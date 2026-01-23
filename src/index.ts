import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import businessRoutes from './routes/business.routes';
import deviceRoutes from './routes/device.routes';
import syncRoutes from './routes/sync.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';
import recoveryRoutes from './routes/recovery.routes';
import licenseRoutes from './routes/license.routes';
import logRoutes from './routes/log.routes';
import sunatDocumentRoutes from './routes/sunat-document.routes';
import clientRoutes from './routes/client.routes';
import staffUserRoutes from './routes/staff-user.routes';
import { errorHandler } from './middleware/errorHandler';
import prisma from './utils/prisma';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS === '*' ? '*' : process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/logs', logRoutes);
app.use('/api', sunatDocumentRoutes);
app.use('/api', clientRoutes);
app.use('/api/staff', staffUserRoutes);

// Health Check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: { message: 'Route not found' }
    });
});

// Error Handler
app.use(errorHandler);

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log(' Database connected successfully');

        app.listen(PORT, () => {
            console.log(` Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(' Failed to start server:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', async () => {
    console.log('\n Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

startServer();