import { Router } from "express";
import {
    createReport,
    getAllReports,
    getReportById,
    updateReport,
    deleteReport
} from "../controllers/reports.controller.js";
import { validateReport } from "../validators/reports.validator.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/", validateReport, validate, createReport);
router.get("/", getAllReports);
router.get("/:id", getReportById);
router.put("/:id", validateReport, validate, updateReport);
router.delete("/:id", deleteReport);

export default router;