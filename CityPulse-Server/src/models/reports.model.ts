import mongoose, { Schema, Document, Model } from "mongoose";

export type ReportCategory = "Pothole" | "Streetlight" | "WaterLeak" | "Garbage" | "RoadDamage" | "Other";
export type ReportSeverity = "Low" | "Medium" | "High" | "Critical";
export type ReportStatus = "Pending" | "InReview" | "InProgress" | "Resolved";

export interface IReport extends Document {
    title: string;
    description: string;
    category: ReportCategory;
    severity: ReportSeverity;
    status: ReportStatus;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    imageUrl?: string | null;
    reportedBy: mongoose.Types.ObjectId;
    issueGroupId?: mongoose.Types.ObjectId;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 15,
        maxlength: 1000
    },
    category: {
        type: String,
        required: true,
        enum: {
            values: ["Pothole", "Streetlight", "WaterLeak", "Garbage", "RoadDamage", "Other"],
            message: "Please enter a valid category"
        }
    },
    severity: {
        type: String,
        required: true,
        enum: {
            values: ["Low", "Medium", "High", "Critical"],
            message: "Please enter a valid severity"
        }
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["Pending", "InReview", "InProgress", "Resolved"],
            message: "Please enter a valid status"
        },
        default: "Pending"
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    imageUrl: {
        type: String,
        default: null
    },
    reportedBy: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    issueGroupId: {
        type: Schema.Types.ObjectId,
        ref: "IssueGroup",
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

reportSchema.index({ location: "2dsphere" });
reportSchema.index({ category: 1 });
reportSchema.index({ issueGroupId: 1 });
reportSchema.index({ reportedBy: 1 });

const Report: Model<IReport> = mongoose.model<IReport>("reports", reportSchema);

export default Report;