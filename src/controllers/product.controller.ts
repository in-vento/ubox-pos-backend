import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessId = req.headers['x-business-id'] as string;
        
        if (!businessId) {
            throw createError('Business ID is required', 400);
        }

        const products = await prisma.product.findMany({
            where: {
                businessId: businessId
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};