import { param, query, body } from 'express-validator';

import { ISSUE_CATEGORIES, ISSUE_SEVERITIES, ISSUE_STATUSES, } from '../models/issueGroupe.model.js';

/* =========================================================
   GET /api/issue-groups
========================================================= */

export const getIssueGroupsValidator = [
  query('category')
    .optional()
    .isIn(ISSUE_CATEGORIES)
    .withMessage(
      `Category must be one of: ${ISSUE_CATEGORIES.join(', ')}`
    ),

  query('status')
    .optional()
    .isIn(ISSUE_STATUSES)
    .withMessage(
      `Status must be one of: ${ISSUE_STATUSES.join(', ')}`
    ),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

/* =========================================================
   GET /api/issue-groups/:id
========================================================= */

export const getIssueGroupByIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid issue group ID'),
];

/* =========================================================
   GET /api/issue-groups/nearby
========================================================= */

export const getNearbyIssueGroupsValidator = [
  query('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(ISSUE_CATEGORIES)
    .withMessage(
      `Category must be one of: ${ISSUE_CATEGORIES.join(', ')}`
    ),

  query('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage(
      'Longitude must be a number between -180 and 180'
    )
    .toFloat(),

  query('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage(
      'Latitude must be a number between -90 and 90'
    )
    .toFloat(),

  query('maxDistance')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage(
      'maxDistance must be greater than 0'
    )
    .toFloat(),
];

/* =========================================================
   PATCH /api/issue-groups/:id/status
========================================================= */

export const updateIssueGroupStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid issue group ID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(ISSUE_STATUSES)
    .withMessage(
      `Status must be one of: ${ISSUE_STATUSES.join(', ')}`
    ),

  body('note')
    .optional({ nullable: true })
    .isString()
    .withMessage('Note must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),
];

/* =========================================================
   PATCH /api/issue-groups/:id/severity
========================================================= */

export const escalateIssueGroupSeverityValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid issue group ID'),

  body('severity')
    .notEmpty()
    .withMessage('Severity is required')
    .isIn(ISSUE_SEVERITIES)
    .withMessage(
      `Severity must be one of: ${ISSUE_SEVERITIES.join(', ')}`
    ),
];

/* =========================================================
   POST /api/issue-groups/:id/recalculate-priority
========================================================= */

export const recalculateIssueGroupPriorityValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid issue group ID'),
];