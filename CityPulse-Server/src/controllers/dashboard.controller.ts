import type { Request, Response, NextFunction } from "express";

import { dashboardService } from "../services/dashboard.service.js";

export const getDashboardSummary = async ( _req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const summary = await dashboardService.getSummary();

        res.status(200).json({success: true, data: summary, });
    } catch (error) {
        next(error);
    }
};

export const getReportsByCategory = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await dashboardService.getReportsByCategory();

        res.status(200).json({success: true, data, });
    } catch (error) {
        next(error);
    }
};

export const getGroupsByLocation = async (_req: Request, res: Response, next: NextFunction ): Promise<void> => {
    try {
        const data = await dashboardService.getGroupsByLocation();

        res.status(200).json({ success: true, data, });
    } catch (error) {
        next(error);
    }
};