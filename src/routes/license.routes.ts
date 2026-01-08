import { Router } from 'express';
import { verifyLicense, updateLicense, getLicenseLogs } from '../controllers/license.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public verification (requires device fingerprint and business ID in headers)
router.get('/verify', verifyLicense);

// Protected management (requires authentication)
router.post('/update', authenticate, updateLicense);
router.get('/logs', authenticate, getLicenseLogs);

export default router;
