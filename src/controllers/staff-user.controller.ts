import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

export const getStaffUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessId = req.headers['x-business-id'] as string;

        if (!businessId) {
            throw createError('Business ID is required', 400);
        }

        const staffUsers = await prisma.staffUser.findMany({
            where: {
                businessId: businessId
            },
            orderBy: {
                name: 'asc'
            }
        });

        return res.json({
            success: true,
            data: staffUsers
        });
    } catch (error) {
        return next(error);
    }
};

export const syncStaffUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const businessId = req.headers['x-business-id'] as string;
        const { localId, action, data } = req.body;

        if (!businessId || !localId || !action || !data) {
            throw createError('Missing required sync parameters', 400);
        }

        if (action === 'CREATE' || action === 'UPDATE') {
            const staffUser = await prisma.staffUser.upsert({
                where: {
                    businessId_localId: {
                        businessId,
                        localId,
                    },
                },
                update: {
                    name: data.name,
                    role: data.role,
                    pin: data.pin,
                    status: data.status,
                    updatedAt: new Date(data.updatedAt || new Date()),
                },
                create: {
                    localId,
                    businessId,
                    name: data.name,
                    role: data.role,
                    pin: data.pin,
                    status: data.status || 'ACTIVE',
                    createdAt: new Date(data.createdAt || new Date()),
                    updatedAt: new Date(data.updatedAt || new Date()),
                },
            });

            return res.json({ success: true, data: staffUser });
        } else if (action === 'DELETE') {
            await prisma.staffUser.deleteMany({
                where: {
                    businessId,
                    localId,
                },
            });

            return res.json({ success: true });
        }

        return res.status(400).json({ success: false, message: 'Unsupported sync action' });
    } catch (error) {
        return next(error);
    }
};
