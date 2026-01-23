import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getStaffUsers, syncStaffUser } from '../controllers/staff-user.controller';

const router = Router();

router.use(authenticate);

router.get('/', getStaffUsers);
router.post('/sync', syncStaffUser);

export default router;
