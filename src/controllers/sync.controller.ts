import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

export const syncOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = req.headers['x-business-id'] as string;
    const { localId, action, data } = req.body;

    if (!businessId || !localId || !action || !data) {
      throw createError('Missing required sync parameters', 400);
    }

    if (action === 'CREATE' || action === 'UPDATE') {
      // Upsert order
      const order = await prisma.order.upsert({
        where: {
          businessId_localId: {
            businessId,
            localId,
          },
        },
        update: {
          customId: data.customId,
          waiterName: data.waiter?.name || data.waiterName,
          customer: data.customer,
          status: data.status,
          totalAmount: data.totalAmount,
          paidAmount: data.paidAmount,
          updatedAt: new Date(data.updatedAt),
        },
        create: {
          localId,
          businessId,
          customId: data.customId,
          waiterName: data.waiter?.name || data.waiterName,
          customer: data.customer,
          status: data.status,
          totalAmount: data.totalAmount,
          paidAmount: data.paidAmount,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        },
      });

      // Sync items if provided
      if (data.items && Array.isArray(data.items)) {
        // Delete existing items for this order to avoid duplicates on update
        await prisma.orderItem.deleteMany({
          where: { orderId: order.id },
        });

        // Create new items
        await prisma.orderItem.createMany({
          data: data.items.map((item: any) => ({
            orderId: order.id,
            productId: item.productId,
            productName: item.product?.name || 'Producto',
            quantity: item.quantity,
            price: item.price,
          })),
        });
      }

      return res.json({ success: true, data: order });
    }

    return res.status(400).json({ success: false, message: 'Unsupported sync action' });
  } catch (error) {
    next(error);
    return;
  }
};

export const syncPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = req.headers['x-business-id'] as string;
    const { localId, action, data } = req.body;

    if (!businessId || !localId || !action || !data) {
      throw createError('Missing required sync parameters', 400);
    }

    // Find the order in the cloud first
    const order = await prisma.order.findUnique({
      where: {
        businessId_localId: {
          businessId,
          localId: data.orderId,
        },
      },
    });

    if (!order) {
      throw createError('Order not found in cloud. Sync order first.', 404);
    }

    if (action === 'CREATE') {
      const payment = await prisma.payment.upsert({
        where: {
          businessId_localId: {
            businessId,
            localId,
          },
        },
        update: {
          amount: data.amount,
          method: data.method,
          cashier: data.cashier,
          timestamp: new Date(data.timestamp),
        },
        create: {
          localId,
          businessId,
          orderId: order.id,
          amount: data.amount,
          method: data.method,
          cashier: data.cashier,
          timestamp: new Date(data.timestamp),
        },
      });

      return res.json({ success: true, data: payment });
    }

    return res.status(400).json({ success: false, message: 'Unsupported sync action' });
  } catch (error) {
    next(error);
    return;
  }
};

export const syncLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = req.headers['x-business-id'] as string;
    const { localId, action, data } = req.body;

    if (!businessId || !localId || !action || !data) {
      throw createError('Missing required sync parameters', 400);
    }

    if (action === 'CREATE') {
      const log = await prisma.systemLog.upsert({
        where: {
          businessId_localId: {
            businessId,
            localId,
          },
        },
        update: {
          action: data.action,
          details: data.details,
          userId: data.userId,
          userName: data.user?.name || data.userName,
          userRole: data.user?.role || data.userRole,
          timestamp: new Date(data.timestamp),
        },
        create: {
          localId,
          businessId,
          action: data.action,
          details: data.details,
          userId: data.userId,
          userName: data.user?.name || data.userName,
          userRole: data.user?.role || data.userRole,
          timestamp: new Date(data.timestamp),
        },
      });

      return res.json({ success: true, data: log });
    }

    return res.status(400).json({ success: false, message: 'Unsupported sync action' });
  } catch (error) {
    next(error);
    return;
  }
};
