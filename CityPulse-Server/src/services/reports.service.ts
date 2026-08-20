import mongoose from "mongoose";
import Report, { type ReportCategory, type ReportSeverity, type ReportStatus } from "../models/reports.model.js";
import { findOrCreateGroup } from "./issueGroups.service.js";

interface CreateReportInput {
    title: string;
    description: string;
    category: ReportCategory;
    severity: ReportSeverity;
    longitude: number;
    latitude: number;
    imageUrl?: string | null;
    reportedBy: string;
}

interface UpdateReportInput {
    title?: string;
    description?: string;
    category?: ReportCategory;
    severity?: ReportSeverity;
    status?: ReportStatus;
    longitude?: number;
    latitude?: number;
    imageUrl?: string | null;
}

export const createReportService = async (data: CreateReportInput) => {
    const session = await mongoose.startSession();

    try {
        const reportId = await session.withTransaction(async () => {
            const reports = await Report.create([{
                title: data.title,
                description: data.description,
                category: data.category,
                severity: data.severity,
                location: {
                    type: "Point",
                    coordinates: [data.longitude, data.latitude]
                },
                imageUrl: data.imageUrl ?? null,
                reportedBy: new mongoose.Types.ObjectId(data.reportedBy)
            }], { session });

            const report = reports[0];

            if (!report) {
                throw new Error("Failed to create report");
            }

            const issueGroup = await findOrCreateGroup({
                category: report.category,
                severity: report.severity,
                longitude: report.location.coordinates[0],
                latitude: report.location.coordinates[1]
            }, session);

            report.issueGroupId = issueGroup._id;

            await report.save({ session });

            return report._id;
        });

        return await Report.findById(reportId)
            .populate("issueGroupId")
            .exec();
    } finally {
        await session.endSession();
    }
};

export const getAllReportsService = async () => {
    return await Report.find({
        isDeleted: false
    })
        .populate("issueGroupId")
        .sort({ createdAt: -1 });
};

export const getReportByIdService = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }

    return await Report.findOne({
        _id: id,
        isDeleted: false
    }).populate("issueGroupId");
};

export const updateReportService = async (id: string, data: UpdateReportInput) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }

    const report = await Report.findOne({
        _id: id,
        isDeleted: false
    });

    if (!report) {
        return null;
    }

    if (data.title !== undefined) {
        report.title = data.title;
    }

    if (data.description !== undefined) {
        report.description = data.description;
    }

    if (data.status !== undefined) {
        report.status = data.status;
    }

    if (data.imageUrl !== undefined) {
        report.imageUrl = data.imageUrl;
    }

    if (data.category !== undefined) {
        report.category = data.category;
    }

    if (data.severity !== undefined) {
        report.severity = data.severity;
    }

    if (data.longitude !== undefined && data.latitude !== undefined) {
        report.location = {
            type: "Point",
            coordinates: [data.longitude, data.latitude]
        };
    }

    report.updatedAt = new Date();

    return await report.save();
};

export const deleteReportService = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }

    const session = await mongoose.startSession();

    try {
        let deletedReport = null;

        await session.withTransaction(async () => {
            const report = await Report.findOne({
                _id: id,
                isDeleted: false
            }).session(session);

            if (!report) {
                return;
            }

            report.isDeleted = true;
            report.deletedAt = new Date();
            report.updatedAt = new Date();

            await report.save({ session });

            deletedReport = report;
        });

        return deletedReport;
    } finally {
        await session.endSession();
    }
};