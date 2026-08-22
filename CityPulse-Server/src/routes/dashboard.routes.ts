import { Router } from "express";

import {
    getDashboardSummary,
    getReportsByCategory,
    getGroupsByLocation,
} from "../controllers/dashboard.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

router.get(
    "/summary",
    authenticate,
    authorize("Admin"),
    getDashboardSummary
);


router.get(
    "/by-category",
    authenticate,
    authorize("Admin"),
    getReportsByCategory
);

router.get(
    "/by-location",
    authenticate,
    authorize("Admin"),
    getGroupsByLocation
);

export default router;