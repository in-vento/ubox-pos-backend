import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getOrders, getOrderStats } from '../controllers/order.controller';

const router = Router();

router.use(authenticate);

router.get('/', getOrders);
router.get('/stats', getOrderStats);

export default router;