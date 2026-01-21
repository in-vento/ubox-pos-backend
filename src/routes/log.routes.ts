import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getLogs } from '../controllers/log.controller';

const router = Router();

router.use(authenticate);

router.get('/', getLogs);

export default router;
