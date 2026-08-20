import {
  IssueGroup,
  type IssueCategory,
  type IssueSeverity,
  type IssueStatus,
  type HydratedIssueGroupDocument,
} from '../models/issueGroupe.model.js';

const GROUPING_RADIUS_METERS = 50;

const SEVERITY_WEIGHT: Record<IssueSeverity, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

interface ICreateIssueGroupData {
  category: IssueCategory;
  longitude: number;
  latitude: number;
  severity: IssueSeverity;
}

interface IUpdateStatusData {
  status: IssueStatus;
  changedBy?: string | null;
  note?: string | null;
}

/* =========================================================
   Helpers
========================================================= */

/**
 * Calculate the priority score of an issue group.
 *
 * Formula:
 *
 * (reportCount × severityWeight × 10) + recencyBonus
 *
 * recencyBonus:
 * max(0, 20 - daysSinceLastReport)
 */
export const calculatePriorityScore = ( reportCount: number, severity: IssueSeverity, lastReportAt: Date): number => {
  const severityWeight = SEVERITY_WEIGHT[severity];

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const daysSinceLastReport = (Date.now() - lastReportAt.getTime()) / millisecondsPerDay;

  const recencyBonus = Math.max(  0,20 - daysSinceLastReport);

  return ( reportCount * severityWeight * 10 + recencyBonus);
};


export const findNearbyGroup = async (
  category: IssueCategory, longitude: number, latitude: number ): Promise<HydratedIssueGroupDocument | null> => {
  const groups = await IssueGroup.findNearby(
    category,
    longitude,
    latitude,
    GROUPING_RADIUS_METERS
  );

  return groups[0] ?? null;
};


export const createIssueGroup = async ( data: ICreateIssueGroupData ): Promise<HydratedIssueGroupDocument> => {
  const { category, longitude, latitude, severity, } = data;

  const now = new Date();

  const priorityScore = calculatePriorityScore(1, severity, now);

  const issueGroup = await IssueGroup.create({
    category,

    centerLocation: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },

    reportCount: 1,

    lastReportAt: now,

    priorityScore,

    severity,

    status: 'Pending',

    statusHistory: [
      {
        status: 'Pending',
        changedBy: null,
        changedAt: now,
        note: 'Issue group created automatically.',
      },
    ],
  });

  return issueGroup;
};

/**
 * Find an existing nearby group.
 *
 * If found:
 *   - increment reportCount
 *   - update lastReportAt
 *   - escalate severity if necessary
 *   - recalculate priority
 *
 * If not found:
 *   - create a new group
 */
export const findOrCreateGroup = async ( data: ICreateIssueGroupData): Promise<HydratedIssueGroupDocument> => {
  const { category, longitude, latitude, severity, } = data;

  const existingGroup = await findNearbyGroup(category, longitude, latitude );

  if (!existingGroup) {
    return createIssueGroup(data);
  }

  /* -------------------------------------------------------
     Existing group
  ------------------------------------------------------- */

  existingGroup.reportCount += 1;

  existingGroup.lastReportAt = new Date();

  await existingGroup.escalateSeverity(severity);

  existingGroup.priorityScore =
    calculatePriorityScore(
      existingGroup.reportCount,
      existingGroup.severity,
      existingGroup.lastReportAt
    );

  await existingGroup.save();

  return existingGroup;
};

/* =========================================================
   Get All Groups
========================================================= */

export const getIssueGroups = async (options?: {
  category?: IssueCategory;
  status?: IssueStatus;
  page?: number;
  limit?: number;
}): Promise<{
  groups: HydratedIssueGroupDocument[];
  total: number;
  page: number;
  limit: number;
}> => {
  const {
    category,
    status,
    page = 1,
    limit = 20,
  } = options ?? {};

  const filter: Record<string, unknown> = {};

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [groups, total] = await Promise.all([
    IssueGroup.find(filter)
      .sort({ priorityScore: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),

    IssueGroup.countDocuments(filter),
  ]);

  return {
    groups,
    total,
    page,
    limit,
  };
};

/* =========================================================
   Get Group By ID
========================================================= */

export const getIssueGroupById = async (
  id: string
): Promise<HydratedIssueGroupDocument> => {
  const issueGroup = await IssueGroup.findById(id).exec();

  if (!issueGroup) {
    throw new Error('Issue group not found');
  }

  return issueGroup;
};

/* =========================================================
   Get Nearby Groups
========================================================= */

export const getNearbyIssueGroups = async (
  category: IssueCategory,
  longitude: number,
  latitude: number,
  maxDistanceInMeters = GROUPING_RADIUS_METERS
): Promise<HydratedIssueGroupDocument[]> => {
  return IssueGroup.findNearby(
    category,
    longitude,
    latitude,
    maxDistanceInMeters
  );
};

/* =========================================================
   Update Status
========================================================= */

export const updateIssueGroupStatus = async (
  id: string,
  data: IUpdateStatusData
): Promise<HydratedIssueGroupDocument> => {
  const issueGroup = await getIssueGroupById(id);

  return issueGroup.updateStatus(
    data.status,
    data.changedBy ?? null,
    data.note ?? null
  );
};

/* =========================================================
   Escalate Severity
========================================================= */

export const escalateIssueGroupSeverity = async (
  id: string,
  severity: IssueSeverity
): Promise<HydratedIssueGroupDocument> => {
  const issueGroup = await getIssueGroupById(id);

  return issueGroup.escalateSeverity(severity);
};

/* =========================================================
   Recalculate Priority
========================================================= */

export const recalculateIssueGroupPriority = async (
  id: string
): Promise<HydratedIssueGroupDocument> => {
  const issueGroup = await getIssueGroupById(id);

  issueGroup.priorityScore =
    calculatePriorityScore(
      issueGroup.reportCount,
      issueGroup.severity,
      issueGroup.lastReportAt
    );

  await issueGroup.save();

  return issueGroup;
};