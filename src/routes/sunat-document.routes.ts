/**
 * SUNAT Document Routes
 */

import { Router } from 'express';
import { syncSunatDocument, getSunatDocuments } from '../controllers/sunat-document.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/sync/sunat-document', authenticate, syncSunatDocument);
router.get('/sunat-documents', authenticate, getSunatDocuments);

export default router;
