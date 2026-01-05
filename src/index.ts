import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import businessRoutes from './routes/business.routes';
import deviceRoutes from './routes/device.routes';
import syncRoutes from './routes/sync.routes';
import recoveryRoutes from './routes/recovery.routes';
import licenseRoutes from './routes/license.routes';
import { errorHandler } from './middleware/errorHandler';
import prisma from './utils/prisma';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'UBOX POS Backend API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/license', licenseRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log(' Database connected');

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/health`);
      console.log(` Auth: http://localhost:${PORT}/api/auth`);
      console.log(` Business: http://localhost:${PORT}/api/business`);
      console.log(` Device: http://localhost:${PORT}/api/device`);
      console.log(` Sync: http://localhost:${PORT}/api/sync`);
      console.log(` Recovery: http://localhost:${PORT}/api/recovery`);
      console.log(` License: http://localhost:${PORT}/api/license`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
