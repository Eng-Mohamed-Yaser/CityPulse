import { Router } from "express";

import {
    getDashboardSummary,
    getReportsByCategory,
    getGroupsByLocation,
} from "../controller/dashboard.controller.js";

import { Authentication } from "../middleware/Authentication.middleware.js";
import { AuthorizationAdmin } from "../middleware/Authorization.middle.js";

export const BoardRouter = Router();

BoardRouter.get(
    "/summary",
    Authentication,
    AuthorizationAdmin,
    getDashboardSummary
);


BoardRouter.get(
    "/by-category",
    Authentication,
    AuthorizationAdmin,
    getReportsByCategory
);

BoardRouter.get(
    "/by-location",
    Authentication,
    AuthorizationAdmin,
    getGroupsByLocation
);

