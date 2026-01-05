import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

/**
 * Returns all configuration data for a business (Products, StaffUsers)
 * This is used for data recovery when a new POS is installed.
 */
export const getRecoveryData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = req.headers['x-business-id'] as string;

    if (!businessId) {
      throw createError('Missing business ID', 400);
    }

    const products = await prisma.product.findMany({
      where: { businessId },
    });

    const staffUsers = await prisma.staffUser.findMany({
      where: { businessId },
    });

    // We could also include recent orders if needed
    // const recentOrders = await prisma.order.findMany({
    //   where: { businessId },
    //   take: 100,
    //   orderBy: { createdAt: 'desc' },
    //   include: { items: true, payments: true }
    // });

    res.json({
      success: true,
      data: {
        products,
        staffUsers,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Syncs configuration data from local to cloud (Initial setup or updates)
 */
export const syncConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = req.headers['x-business-id'] as string;
    const { products, staffUsers } = req.body;

    if (!businessId) {
      throw createError('Missing business ID', 400);
    }

    // Sync Products
    if (products && Array.isArray(products)) {
      for (const p of products) {
        await prisma.product.upsert({
          where: { businessId_localId: { businessId, localId: p.id } },
          update: {
            name: p.name,
            price: p.price,
            category: p.category,
            stock: p.stock,
            updatedAt: new Date(),
          },
          create: {
            localId: p.id,
            businessId,
            name: p.name,
            price: p.price,
            category: p.category,
            stock: p.stock,
          },
        });
      }
    }

    // Sync Staff Users
    if (staffUsers && Array.isArray(staffUsers)) {
      for (const u of staffUsers) {
        await prisma.staffUser.upsert({
          where: { businessId_localId: { businessId, localId: u.id } },
          update: {
            name: u.name,
            role: u.role,
            pin: u.pin,
            status: u.status,
            updatedAt: new Date(),
          },
          create: {
            localId: u.id,
            businessId,
            name: u.name,
            role: u.role,
            pin: u.pin,
            status: u.status,
          },
        });
      }
    }

    res.json({ success: true, message: 'Configuration synced successfully' });
  } catch (error) {
    next(error);
  }
};
