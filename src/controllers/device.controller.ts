import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

// Register new device
export const registerDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fingerprint, name, businessId, role } = req.body;

        if (!fingerprint || !name || !businessId) {
            throw createError('Fingerprint, name, and businessId are required', 400);
        }

        // Check if device already exists
        const existingDevice = await prisma.device.findUnique({
            where: { fingerprint },
        });

        if (existingDevice) {
            // Update last seen
            const updatedDevice = await prisma.device.update({
                where: { fingerprint },
                data: { lastSeen: new Date() },
            });

            return res.json({
                success: true,
                data: updatedDevice,
                message: 'Device already registered',
            });
        }

        // Verify business exists
        const business = await prisma.business.findUnique({
            where: { id: businessId },
        });

        if (!business) {
            throw createError('Business not found', 404);
        }

        // Create device (unauthorized by default)
        const device = await prisma.device.create({
            data: {
                fingerprint,
                name,
                businessId,
                role: role || 'POS',
                isAuthorized: false,
            },
        });

        return res.status(201).json({
            success: true,
            data: device,
            message: 'Device registered. Waiting for admin authorization.',
        });
    } catch (error) {
        next(error);
        return;
    }
};

// Get all devices for a business
export const getDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        const { businessId } = req.params;

        // Verify user has access to this business
        const userBusiness = await prisma.userBusiness.findFirst({
            where: {
                businessId,
                userId,
            },
        });

        if (!userBusiness) {
            throw createError('Access denied', 403);
        }

        const devices = await prisma.device.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
        });

        return res.json({
            success: true,
            data: devices,
        });
    } catch (error) {
        next(error);
        return;
    }
};

// Authorize/revoke device
export const authorizeDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;
        const { isAuthorized } = req.body;

        if (typeof isAuthorized !== 'boolean') {
            throw createError('isAuthorized must be a boolean', 400);
        }

        // Get device
        const device = await prisma.device.findUnique({
            where: { id },
        });

        if (!device) {
            throw createError('Device not found', 404);
        }

        // Verify user is OWNER or ADMIN of the business
        const userBusiness = await prisma.userBusiness.findFirst({
            where: {
                businessId: device.businessId,
                userId,
                role: {
                    in: ['OWNER', 'ADMIN'],
                },
            },
        });

        if (!userBusiness) {
            throw createError('Only owners and admins can authorize devices', 403);
        }

        // Update device
        const updatedDevice = await prisma.device.update({
            where: { id },
            data: { isAuthorized },
        });

        return res.json({
            success: true,
            data: updatedDevice,
            message: isAuthorized ? 'Device authorized' : 'Device revoked',
        });
    } catch (error) {
        next(error);
        return;
    }
};

// Check device authorization status
export const checkDeviceAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fingerprint } = req.params;

        const device = await prisma.device.findUnique({
            where: { fingerprint },
            include: {
                business: {
                    select: {
                        id: true,
                        name: true,
                        isActive: true,
                    },
                },
            },
        });

        if (!device) {
            throw createError('Device not found', 404);
        }

        // Update last seen
        await prisma.device.update({
            where: { fingerprint },
            data: { lastSeen: new Date() },
        });

        return res.json({
            success: true,
            data: {
                isAuthorized: device.isAuthorized && device.business.isActive,
                device,
            },
        });
    } catch (error) {
        next(error);
        return;
    }
};
