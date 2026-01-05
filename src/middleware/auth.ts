import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError('No token provided', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = verifyToken(token);

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error instanceof Error && error.name === 'JsonWebTokenError') {
            next(createError('Invalid token', 401));
        } else if (error instanceof Error && error.name === 'TokenExpiredError') {
            next(createError('Token expired', 401));
        } else {
            next(error);
        }
    }
};
