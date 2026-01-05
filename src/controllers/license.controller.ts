import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';
import crypto from 'crypto';

/**
 * Verifies the license of a business.
 * This endpoint is called by the POS to check if it can operate.
 */
export const verifyLicense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = req.headers['x-business-id'] as string;
    const fingerprint = req.headers['x-device-fingerprint'] as string;

    if (!businessId || !fingerprint) {
      throw createError('Missing business ID or device fingerprint', 400);
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { devices: true }
    });

    if (!business) {
      throw createError('Business not found', 404);
    }

    // 1. Check if business is active
    if (!business.isActive) {
      return res.json({ 
        success: false, 
        status: 'SUSPENDED', 
        message: 'El negocio ha sido suspendido por el administrador.' 
      });
    }

    // 2. Check license expiry
    const now = new Date();
    if (business.licenseExpiry && business.licenseExpiry < now) {
      return res.json({ 
        success: false, 
        status: 'EXPIRED', 
        message: 'Tu licencia ha expirado. Por favor, contacta a soporte.' 
      });
    }

    // 3. Check device authorization
    const device = business.devices.find(d => d.fingerprint === fingerprint);
    if (!device || !device.isAuthorized) {
      return res.json({ 
        success: false, 
        status: 'UNAUTHORIZED_DEVICE', 
        message: 'Este dispositivo no est� autorizado para operar.' 
      });
    }

    // 4. Check device limit
    const authorizedDevices = business.devices.filter(d => d.isAuthorized);
    if (authorizedDevices.length > business.maxDevices && !device.isAuthorized) {
      return res.json({ 
        success: false, 
        status: 'LIMIT_EXCEEDED', 
        message: 'Has excedido el l�mite de dispositivos autorizados.' 
      });
    }

    // 5. Generate a signed verification token (to prevent local tampering)
    // In a real scenario, use a private key to sign this.
    const dataToSign = `${business.id}:${fingerprint}:${business.licenseExpiry?.toISOString()}:${now.toISOString()}`;
    const signature = crypto.createHmac('sha256', process.env.JWT_SECRET || 'secret')
      .update(dataToSign)
      .digest('hex');

    // Update last check
    await prisma.business.update({
      where: { id: businessId },
      data: { lastLicenseCheck: now }
    });

    return res.json({
      success: true,
      status: 'ACTIVE',
      data: {
        businessName: business.name,
        expiry: business.licenseExpiry,
        serverTime: now,
        signature
      }
    });
  } catch (error) {
    next(error);
    return;
  }
};

/**
 * Admin endpoint to update license (e.g., extend expiry, change plan)
 */
export const updateLicense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, plan, expiryDate, maxDevices, status } = req.body;
    
    // Only SUPER_ADMIN should be able to call this (handled by middleware)
    
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        plan: plan || undefined,
        licenseExpiry: expiryDate ? new Date(expiryDate) : undefined,
        maxDevices: maxDevices || undefined,
        licenseStatus: status || undefined,
        isActive: status === 'ACTIVE' ? true : (status === 'SUSPENDED' ? false : undefined)
      }
    });

    await prisma.licenseLog.create({
      data: {
        businessId,
        action: 'UPDATE_LICENSE',
        details: JSON.stringify({ plan, expiryDate, maxDevices, status })
      }
    });

    return res.json({ success: true, data: updatedBusiness });
  } catch (error) {
    next(error);
    return;
  }
};
