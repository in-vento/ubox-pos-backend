import { Router } from 'express';
import { getRecoveryData, syncConfig } from '../controllers/recovery.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getRecoveryData);
router.post('/sync', syncConfig);

export default router;
