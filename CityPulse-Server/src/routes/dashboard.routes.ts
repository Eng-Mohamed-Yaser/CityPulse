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
    authorize("admin"),
    getDashboardSummary
);


router.get(
    "/by-category",
    authenticate,
    authorize("admin"),
    getReportsByCategory
);

router.get(
    "/by-location",
    authenticate,
    authorize("admin"),
    getGroupsByLocation
);

export default router;