import mongoose, {
  Schema,
  model,
  type Model,
  type HydratedDocument,
  type Types,
} from "mongoose";

export const ISSUE_CATEGORIES = [
  "Pothole",
  "Streetlight",
  "WaterLeak",
  "Garbage",
  "RoadDamage",
  "Other",
] as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

export const ISSUE_SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;

export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number];

export const ISSUE_STATUSES = [
  "Pending",
  "InReview",
  "InProgress",
  "Resolved",
] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export interface ICenterLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface IStatusHistory {
  status: IssueStatus;
  changedBy: Types.ObjectId | null;
  changedAt: Date;
  note: string | null;
}

export interface IIssueGroup {
  category: IssueCategory;
  centerLocation: ICenterLocation;

  reportCount: number;
  lastReportAt: Date;
  priorityScore: number;

  severity: IssueSeverity;
  status: IssueStatus;

  statusHistory: IStatusHistory[];

  createdAt: Date;
  updatedAt: Date;
}

export interface IIssueGroupMethods {
  updateStatus(
    newStatus: IssueStatus,
    changedBy?: Types.ObjectId | string | null,
    note?: string | null,
  ): Promise<HydratedIssueGroupDocument>;

  escalateSeverity(
    newSeverity: IssueSeverity,
    session?: mongoose.ClientSession,
  ): Promise<HydratedIssueGroupDocument>;
}

export interface IIssueGroupModel extends Model<
  IIssueGroup, {}, IIssueGroupMethods> {
  findNearby(
    category: IssueCategory,
    longitude: number,
    latitude: number,
    maxDistanceInMeters?: number,
  ): Promise<HydratedIssueGroupDocument[]>;
}

/* =========================================================
   Hydrated Document
========================================================= */

export type HydratedIssueGroupDocument = HydratedDocument<IIssueGroup, IIssueGroupMethods>;

/* =========================================================
   Status Transition Rules
========================================================= */

const ALLOWED_STATUS_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  Pending: ["InReview"],
  InReview: ["InProgress"],
  InProgress: ["Resolved"],
  Resolved: [],
};

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    status: {
      type: String,
      enum: ISSUE_STATUSES,
      required: true,
    },

    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    note: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  },
);

const issueGroupSchema = new Schema<IIssueGroup, IIssueGroupModel, IIssueGroupMethods>(
  {
    category: {
      type: String,
      enum: ISSUE_CATEGORIES,
      required: [true, "Category is required"],
      index: true,
    },

    centerLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,

        validate: {
          validator: (coordinates: unknown): boolean => {
            if (!Array.isArray(coordinates) || coordinates.length !== 2) {
              return false;
            }

            const [longitude, latitude] = coordinates;

            if (typeof longitude !== "number" || typeof latitude !== "number") {
              return false;
            }

            return (
              Number.isFinite(longitude) &&
              Number.isFinite(latitude) &&
              longitude >= -180 &&
              longitude <= 180 &&
              latitude >= -90 &&
              latitude <= 90
            );
          },

          message:
            "Coordinates must be [longitude, latitude] with valid geographic ranges",
        },
      },
    },

    /* -----------------------------------------------------
       Report Count
    ----------------------------------------------------- */

    reportCount: {
      type: Number,
      required: true,
      min: [1, "Report count must be at least 1"],
      default: 1,
    },

    lastReportAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    priorityScore: {
      type: Number,
      required: true,
      min: [0, "Priority score cannot be negative"],
    },

    severity: {
      type: String,
      enum: ISSUE_SEVERITIES,
      required: true,
    },

    status: {
      type: String,
      enum: ISSUE_STATUSES,
      required: true,
      default: "Pending",
    },

    statusHistory: {
      type: [statusHistorySchema],
      required: true,
      default: [],
    },
  },

  {
    timestamps: true,
    collection: "issueGroups",
  },
);

issueGroupSchema.index(
  { centerLocation: "2dsphere" },
  {
    name: "idx_issueGroups_location_2dsphere",
  },
);

issueGroupSchema.index(
  { priorityScore: -1 },
  {
    name: "idx_issueGroups_priority_desc",
  },
);

issueGroupSchema.index(
  { category: 1, status: 1 },
  {
    name: "idx_issueGroups_category_status",
  },
);

/* =========================================================
   Instance Method: Update Status
========================================================= */

issueGroupSchema.methods.updateStatus = async function (
  newStatus: IssueStatus,
  changedBy: Types.ObjectId | string | null = null,
  note: string | null = null,
): Promise<HydratedIssueGroupDocument> {
  const currentStatus = this.status;

  /**
   * Prevent unnecessary transition:
   *
   * Pending -> Pending
   */
  if (currentStatus === newStatus) {
    throw new Error(`Issue group is already in '${currentStatus}' status`);
  }

  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid status transition: ${currentStatus} -> ${newStatus}`,
    );
  }

  let changedByObjectId: Types.ObjectId | null = null;

  if (changedBy) {
    changedByObjectId =
      changedBy instanceof mongoose.Types.ObjectId
        ? changedBy
        : new mongoose.Types.ObjectId(changedBy);
  }

  this.status = newStatus;

  this.statusHistory.push({
    status: newStatus,
    changedBy: changedByObjectId,
    changedAt: new Date(),
    note: note ?? null,
  });

  return this.save();
};

/* =========================================================
   Instance Method: Escalate Severity
========================================================= */

issueGroupSchema.methods.escalateSeverity = async function (
  newSeverity: IssueSeverity,
  session?: mongoose.ClientSession,
): Promise<HydratedIssueGroupDocument> {
  const currentIndex = ISSUE_SEVERITIES.indexOf(this.severity);
  const newIndex = ISSUE_SEVERITIES.indexOf(newSeverity);

  /**
   * Only escalate.
   *
   * Low -> Medium       ✅
   * Medium -> High      ✅
   * High -> Critical    ✅
   *
   * Critical -> Low     ❌
   * High -> Medium       ❌
   */
  if (newIndex <= currentIndex) {
    return this;
  }

  this.severity = newSeverity;

  return this.save(session ? { session } : undefined);
};

/* =========================================================
   Static Method: Find Nearby Groups
========================================================= */

issueGroupSchema.statics.findNearby = function (
  category: IssueCategory,
  longitude: number,
  latitude: number,
  maxDistanceInMeters: number = 50,
): Promise<HydratedIssueGroupDocument[]> {
  return this.find({
    category,

    centerLocation: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },

        $maxDistance: maxDistanceInMeters,
      },
    },
  }).exec();
};

/* =========================================================
   Model
========================================================= */

export const IssueGroup = model<IIssueGroup, IIssueGroupModel>(
  "IssueGroup",
  issueGroupSchema,
);
