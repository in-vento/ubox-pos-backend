import { Router } from 'express';
import { syncOrder, syncPayment } from '../controllers/sync.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All sync routes require authentication
router.use(authenticate);

router.post('/order', syncOrder);
router.post('/payment', syncPayment);

export default router;
