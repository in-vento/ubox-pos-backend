import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';

// Register new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password || !name) {
            throw createError('Email, password, and name are required', 400);
        }

        if (password.length < 6) {
            throw createError('Password must be at least 6 characters', 400);
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw createError('User already exists', 409);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        res.status(201).json({
            success: true,
            data: {
                user,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            throw createError('Email and password are required', 400);
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                businesses: {
                    include: {
                        business: true,
                    },
                },
            },
        });

        if (!user) {
            throw createError('Invalid credentials', 401);
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            throw createError('Invalid credentials', 401);
        }

        // Generate token
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: {
                user: userWithoutPassword,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get current user
export const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            throw createError('Unauthorized', 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                businesses: {
                    include: {
                        business: true,
                    },
                },
            },
        });

        if (!user) {
            throw createError('User not found', 404);
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};
