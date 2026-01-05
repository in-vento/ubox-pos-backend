import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export const errorHandler = (
    err: ApiError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log error for debugging
    console.error(`[ERROR] ${statusCode} - ${message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};

export const createError = (message: string, statusCode: number = 500): ApiError => {
    const error: ApiError = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
