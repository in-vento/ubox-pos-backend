import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessId = req.headers['x-business-id'] as string;
        
        if (!businessId) {
            throw createError('Business ID is required', 400);
        }

        const orders = await prisma.order.findMany({
            where: {
                businessId: businessId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100 // Limit to last 100 orders for now
        });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

export const getOrderStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessId = req.headers['x-business-id'] as string;
        
        if (!businessId) {
            throw createError('Business ID is required', 400);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalOrders, todayOrders, totalRevenue] = await Promise.all([
            prisma.order.count({
                where: { businessId }
            }),
            prisma.order.count({
                where: { 
                    businessId,
                    createdAt: {
                        gte: today
                    }
                }
            }),
            prisma.order.aggregate({
                where: { businessId },
                _sum: {
                    total: true
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                totalOrders,
                todayOrders,
                totalRevenue: totalRevenue._sum.total || 0
            }
        });
    } catch (error) {
        next(error);
    }
};