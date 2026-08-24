import { Router } from 'express';
import { Authentication } from "../middleware/Authentication.middleware.js";
import { AuthorizationAdmin } from "../middleware/Authorization.middle.js";
import {
  getIssueGroupsController,
  getIssueGroupByIdController,
  getNearbyIssueGroupsController,
  updateIssueGroupStatusController,
  escalateIssueGroupSeverityController,
  recalculateIssueGroupPriorityController,
} from '../controller/issueGroups.controller.js';

import {
  getIssueGroupsValidator,
  getIssueGroupByIdValidator,
  getNearbyIssueGroupsValidator,
  updateIssueGroupStatusValidator,
  escalateIssueGroupSeverityValidator,
  recalculateIssueGroupPriorityValidator,
} from '../validators/issueGroups.validator.js';

import { validate } from '../middleware/validate.middleware.js';

export const router = Router();


router.get('/nearby', Authentication, getNearbyIssueGroupsValidator, validate,  getNearbyIssueGroupsController);

router.get(
  '/', Authentication,getIssueGroupsValidator, validate,
  getIssueGroupsController);


router.get(
  '/:id',
   Authentication,
  getIssueGroupByIdValidator, validate,
  getIssueGroupByIdController);


router.patch(
  '/:id/status',
  updateIssueGroupStatusValidator, validate,
   Authentication,
  AuthorizationAdmin,
  updateIssueGroupStatusController);


router.patch(
  '/:id/severity',
  escalateIssueGroupSeverityValidator, validate,
   Authentication,
  AuthorizationAdmin,
  escalateIssueGroupSeverityController);


router.post(
  '/:id/recalculate-priority',
  Authentication,
  AuthorizationAdmin,
  recalculateIssueGroupPriorityValidator, validate,
  recalculateIssueGroupPriorityController);

