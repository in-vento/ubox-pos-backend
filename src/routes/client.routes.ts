/**
 * Client Routes
 */

import { Router } from 'express';
import { syncClient, getClients } from '../controllers/client.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/sync/client', authenticate, syncClient);
router.get('/clients', authenticate, getClients);

export default router;
