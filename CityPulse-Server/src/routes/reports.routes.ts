import { Router } from "express";

import {
    createReport,
    getAllReports,
    getReportById,
    updateReport,
    deleteReport,
} from "../controllers/reports.controller.js";

import { validateReport } from "../validators/reports.validator.js";
import { validate } from "../middleware/validation.middleware.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

router.post(
    "/",
    authenticate,
    validateReport,
    validate,
    createReport
);


router.get(
    "/",
    authenticate,
    getAllReports
);


router.get(
    "/:id",
    authenticate,
    getReportById
);


router.put(
    "/:id",
    authenticate,
    authorize("Admin", "User"),
    validateReport,
    validate,
    updateReport
);

router.delete(
    "/:id",
    authenticate,
    authorize("Admin"),
    deleteReport
);

export default router;