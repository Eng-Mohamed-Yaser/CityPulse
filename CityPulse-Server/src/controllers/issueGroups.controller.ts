import type { Request, Response, NextFunction } from "express";

import {
  getIssueGroups,
  getIssueGroupById,
  getNearbyIssueGroups,
  updateIssueGroupStatus,
  escalateIssueGroupSeverity,
  recalculateIssueGroupPriority,
} from "../services/issueGroups.service.js";

import type {
  IssueCategory,
  IssueSeverity,
  IssueStatus,
} from "../models/issueGroupe.model.js";

/* =========================================================
   Helpers
========================================================= */

const isValidNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const isValidCoordinate = (longitude: number, latitude: number): boolean => {
  return (
    longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90
  );
};

/* =========================================================
   GET /api/issue-groups
========================================================= */

export const getIssueGroupsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const category = req.query.category as IssueCategory | undefined;

    const status = req.query.status as IssueStatus | undefined;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    if (!Number.isInteger(page) || page < 1) {
      res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });

      return;
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });

      return;
    }

    const result = await getIssueGroups({
      ...(category !== undefined && { category }),
      ...(status !== undefined && { status }),
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET /api/issue-groups/:id
========================================================= */

export const getIssueGroupByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const issueGroup = await getIssueGroupById(id as string);

    res.status(200).json({
      success: true,
      data: issueGroup,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   GET /api/issue-groups/nearby
========================================================= */

export const getNearbyIssueGroupsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const category = req.query.category as IssueCategory;

    const longitude = Number(req.query.longitude);
    const latitude = Number(req.query.latitude);

    const maxDistance = Number(req.query.maxDistance ?? 50);

    if (!category) {
      res.status(400).json({
        success: false,
        message: "Category is required",
      });

      return;
    }

    if (!isValidNumber(longitude) || !isValidNumber(latitude)) {
      res.status(400).json({
        success: false,
        message: "Longitude and latitude must be valid numbers",
      });

      return;
    }

    if (!isValidCoordinate(longitude, latitude)) {
      res.status(400).json({
        success: false,
        message: "Invalid geographic coordinates",
      });

      return;
    }

    if (!isValidNumber(maxDistance) || maxDistance <= 0) {
      res.status(400).json({
        success: false,
        message: "maxDistance must be greater than zero",
      });

      return;
    }

    const groups = await getNearbyIssueGroups(
      category,
      longitude,
      latitude,
      maxDistance,
    );

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   PATCH /api/issue-groups/:id/status
========================================================= */

export const updateIssueGroupStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const { status, note } = req.body as {
      status?: IssueStatus;
      note?: string | null;
    };

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status is required",
      });

      return;
    }

    /*
     * In a real authenticated application,
     * changedBy should come from req.user,
     * not from the request body.
     *
     * Example:
     *
     * const changedBy = req.user._id;
     */

    const changedBy =
      (
        req as Request & {
          user?: {
            _id?: string;
            id?: string;
          };
        }
      ).user?._id ??
      (
        req as Request & {
          user?: {
            _id?: string;
            id?: string;
          };
        }
      ).user?.id ??
      null;

    const issueGroup = await updateIssueGroupStatus(id as string, {
      status,
      changedBy,
      note: note ?? null,
    });

    res.status(200).json({
      success: true,
      message: "Issue group status updated successfully",
      data: issueGroup,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   PATCH /api/issue-groups/:id/severity
========================================================= */

export const escalateIssueGroupSeverityController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const { severity } = req.body as {
      severity?: IssueSeverity;
    };

    if (!severity) {
      res.status(400).json({
        success: false,
        message: "Severity is required",
      });

      return;
    }

    const issueGroup = await escalateIssueGroupSeverity(id as string, severity);

    res.status(200).json({
      success: true,
      message: "Issue group severity updated successfully",
      data: issueGroup,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   POST /api/issue-groups/:id/recalculate-priority
========================================================= */

export const recalculateIssueGroupPriorityController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const issueGroup = await recalculateIssueGroupPriority(id as string);

    res.status(200).json({
      success: true,
      message: "Issue group priority recalculated successfully",
      data: issueGroup,
    });
  } catch (error) {
    next(error);
  }
};
