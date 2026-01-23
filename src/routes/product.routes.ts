import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProducts, syncProduct } from '../controllers/product.controller';

const router = Router();

router.use(authenticate);

router.get('/', getProducts);
router.post('/sync', syncProduct);

export default router;