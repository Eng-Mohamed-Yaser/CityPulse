import { Router } from 'express';

import {
  getIssueGroupsController,
  getIssueGroupByIdController,
  getNearbyIssueGroupsController,
  updateIssueGroupStatusController,
  escalateIssueGroupSeverityController,
  recalculateIssueGroupPriorityController,
} from '../controllers/issueGroups.controller.js';

const router = Router();

/*
 * IMPORTANT:
 * /nearby must come BEFORE /:id
 *
 * Otherwise Express can interpret:
 *
 * /nearby
 *
 * as:
 *
 * /:id
 */

router.get('/nearby', getNearbyIssueGroupsController);

router.get('/', getIssueGroupsController);

router.get('/:id', getIssueGroupByIdController);

router.patch('/:id/status', updateIssueGroupStatusController);

router.patch('/:id/severity', escalateIssueGroupSeverityController);

router.post('/:id/recalculate-priority', recalculateIssueGroupPriorityController);

export default router;