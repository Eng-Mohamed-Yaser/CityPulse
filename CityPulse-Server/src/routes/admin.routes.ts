import { Router } from 'express';
import { promoteUserController } from '../controllers/admin.controller.js';
import { promoteUserValidator } from '../validators/admin.validator.js';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

router.post(
  '/promote',
  authenticate,
  authorize('admin'),
  promoteUserValidator,
  validate,
  promoteUserController
);

export default router;
