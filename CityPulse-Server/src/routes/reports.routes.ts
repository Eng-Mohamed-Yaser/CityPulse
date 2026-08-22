import { Router } from "express";
import {
    createReport,
    getAllReports,
    getReportById,
    updateReport,
    deleteReport
} from "../controller/reports.controller.js";
import { validateReport } from "../validators/reports.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { Authentication } from "../middleware/Authentication.middleware.js";
import { AuthorizationAdmin } from "../middleware/Authorization.middle.js";

export const ReportRouter = Router();

ReportRouter.post("/", Authentication, validateReport, validate, createReport);
ReportRouter.get("/", Authentication, getAllReports);
ReportRouter.get("/:id",Authentication, getReportById);
ReportRouter.put("/:id",Authentication, AuthorizationAdmin, validateReport, validate, updateReport);
ReportRouter.delete("/:id",Authentication,AuthorizationAdmin, deleteReport);

