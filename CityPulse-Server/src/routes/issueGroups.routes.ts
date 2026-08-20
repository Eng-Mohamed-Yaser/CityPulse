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

import { validate } from '../middleware/validate.middleware.js';

const router = Router();


router.get('/nearby', getNearbyIssueGroupsValidator, validate,  getNearbyIssueGroupsController);

router.get(
  '/',getIssueGroupsValidator, validate,
  getIssueGroupsController);


router.get(
  '/:id',
  getIssueGroupByIdValidator, validate,
  getIssueGroupByIdController);


router.patch(
  '/:id/status',
  updateIssueGroupStatusValidator, validate,
  updateIssueGroupStatusController);


router.patch(
  '/:id/severity',
  escalateIssueGroupSeverityValidator, validate,
  escalateIssueGroupSeverityController);


router.post(
  '/:id/recalculate-priority',
  recalculateIssueGroupPriorityValidator, validate,
  recalculateIssueGroupPriorityController);

export default router;