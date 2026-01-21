import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessId = req.headers['x-business-id'] as string;

        if (!businessId) {
            throw createError('Business ID is required', 400);
        }

        const logs = await prisma.systemLog.findMany({
            where: {
                businessId: businessId
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 200
        });

        res.json({
            success: true,
            data: logs.map(log => ({
                id: log.id,
                action: log.action,
                details: log.details,
                timestamp: log.timestamp,
                user: log.userName ? {
                    name: log.userName,
                    role: log.userRole
                } : null
            }))
        });
    } catch (error) {
        next(error);
    }
};
