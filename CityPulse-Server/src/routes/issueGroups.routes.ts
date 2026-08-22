import { Router } from 'express';

import {
  getIssueGroupsController,
  getIssueGroupByIdController,
  getNearbyIssueGroupsController,
  updateIssueGroupStatusController,
  escalateIssueGroupSeverityController,
  recalculateIssueGroupPriorityController,
} from '../controllers/issueGroups.controller.js';

import {
  getIssueGroupsValidator,
  getIssueGroupByIdValidator,
  getNearbyIssueGroupsValidator,
  updateIssueGroupStatusValidator,
  escalateIssueGroupSeverityValidator,
  recalculateIssueGroupPriorityValidator,
} from '../validators/issueGroups.validator.js';

import { validate } from '../middleware/validation.middleware.js';

import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();


router.get(
  '/nearby',
  authenticate,
  getNearbyIssueGroupsValidator,
  validate,
  getNearbyIssueGroupsController
);

router.get(
  '/',
  authenticate,
  getIssueGroupsValidator,
  validate,
  getIssueGroupsController
);


router.get(
  '/:id',
  authenticate,
  getIssueGroupByIdValidator,
  validate,
  getIssueGroupByIdController
);


router.patch(
  '/:id/status',
  authenticate,
  authorize('Admin'),
  updateIssueGroupStatusValidator,
  validate,
  updateIssueGroupStatusController
);

router.patch(
  '/:id/severity',
  authenticate,
  authorize('Admin'),
  escalateIssueGroupSeverityValidator,
  validate,
  escalateIssueGroupSeverityController
);

router.post(
  '/:id/recalculate-priority',
  authenticate,
  authorize('Admin'),
  recalculateIssueGroupPriorityValidator,
  validate,
  recalculateIssueGroupPriorityController
);

export default router;