import type { Request, Response, NextFunction } from "express";
import {
    createReportService,
    getAllReportsService,
    getReportByIdService,
    updateReportService,
    deleteReportService
} from "../services/reports.service.js";
import { AppError } from "../utils/appError.js";

export const createReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return next(new AppError("Unauthorized", 401));
        }

        const report = await createReportService({
            ...req.body,
            reportedBy: userId.toString()
        });

        res.status(201).json({
            success: true,
            message: "Report created successfully",
            data: report
        });
    } catch (error) {
        next(error);
    }
};

export const getAllReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reports = await getAllReportsService();

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};

export const getReportById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new AppError("Report id is required", 400));
        }

        const report = await getReportByIdService(id as string);

        if (!report) {
            return next(new AppError("Report not found", 404));
        }

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

export const updateReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new AppError("Report id is required", 400));
        }

        const report = await updateReportService(id as string, req.body);

        if (!report) {
            return next(new AppError("Report not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Report updated successfully",
            data: report
        });
    } catch (error) {
        next(error);
    }
};

export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new AppError("Report id is required", 400));
        }

        const report = await deleteReportService(id as string);

        if (!report) {
            return next(new AppError("Report not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Report deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};