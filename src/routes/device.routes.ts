import { Router } from 'express';
import {
    registerDevice,
    getDevices,
    authorizeDevice,
    checkDeviceAuth,
} from '../controllers/device.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route - device registration
router.post('/register', registerDevice);
router.get('/check/:fingerprint', checkDeviceAuth);

// Protected routes
router.get('/:businessId', authenticate, getDevices);
router.patch('/:id/authorize', authenticate, authorizeDevice);

export default router;
