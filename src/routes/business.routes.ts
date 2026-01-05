import { Router } from 'express';
import {
    createBusiness,
    getBusiness,
    getBusinessUsers,
    addUserToBusiness,
} from '../controllers/business.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All business routes require authentication
router.use(authenticate);

router.post('/', createBusiness);
router.get('/:id', getBusiness);
router.get('/:id/users', getBusinessUsers);
router.post('/:id/users', addUserToBusiness);

export default router;
