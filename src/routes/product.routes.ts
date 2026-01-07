import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProducts } from '../controllers/product.controller';

const router = Router();

router.use(authenticate);

router.get('/', getProducts);

export default router;