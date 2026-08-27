import type { Request, Response, NextFunction, } from 'express';

import type { UserRole, } from '../models/user.models.js';

import { AppError } from '../utils/appError.js';

export function authorize(...allowedRoles: UserRole[]) {
    return (
        req: Request, _res: Response, next: NextFunction
    ): void => {
        if (!req.user) {
            throw new AppError('Authentication required', 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError('You do not have permission to perform this action', 403);
        }

        next();
    };
}