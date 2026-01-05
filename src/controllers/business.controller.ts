import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createError } from '../middleware/errorHandler';

// Create new business
export const createBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        const { name, slug } = req.body;

        if (!name || !slug) {
            throw createError('Name and slug are required', 400);
        }

        // Check if slug is unique
        const existingBusiness = await prisma.business.findUnique({
            where: { slug },
        });

        if (existingBusiness) {
            throw createError('Business slug already exists', 409);
        }

        // Create business and associate user as OWNER
        const business = await prisma.business.create({
            data: {
                name,
                slug,
                users: {
                    create: {
                        userId,
                        role: 'OWNER',
                    },
                },
            },
            include: {
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            data: business,
        });
    } catch (error) {
        next(error);
    }
};

// Get business by ID
export const getBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;

        const business = await prisma.business.findUnique({
            where: { id },
            include: {
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
                devices: true,
            },
        });

        if (!business) {
            throw createError('Business not found', 404);
        }

        // Check if user has access to this business
        const hasAccess = business.users.some((ub) => ub.userId === userId);

        if (!hasAccess) {
            throw createError('Access denied', 403);
        }

        res.json({
            success: true,
            data: business,
        });
    } catch (error) {
        next(error);
    }
};

// Get all users in a business
export const getBusinessUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        const { id } = req.params;

        // Verify user has access
        const userBusiness = await prisma.userBusiness.findFirst({
            where: {
                businessId: id,
                userId,
            },
        });

        if (!userBusiness) {
            throw createError('Access denied', 403);
        }

        const users = await prisma.userBusiness.findMany({
            where: { businessId: id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

// Add user to business
export const addUserToBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUserId = (req as any).user?.id;
        const { id } = req.params;
        const { userId, role } = req.body;

        if (!userId || !role) {
            throw createError('User ID and role are required', 400);
        }

        // Verify current user is OWNER or ADMIN
        const currentUserBusiness = await prisma.userBusiness.findFirst({
            where: {
                businessId: id,
                userId: currentUserId,
                role: {
                    in: ['OWNER', 'ADMIN'],
                },
            },
        });

        if (!currentUserBusiness) {
            throw createError('Only owners and admins can add users', 403);
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw createError('User not found', 404);
        }

        // Add user to business
        const userBusiness = await prisma.userBusiness.create({
            data: {
                userId,
                businessId: id,
                role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            data: userBusiness,
        });
    } catch (error) {
        next(error);
    }
};
