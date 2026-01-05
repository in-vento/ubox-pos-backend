import { Router } from 'express';
import { verifyLicense, updateLicense } from '../controllers/license.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public verification (requires device fingerprint and business ID in headers)
router.get('/verify', verifyLicense);

// Protected management (requires authentication)
router.post('/update', authenticate, updateLicense);

export default router;
