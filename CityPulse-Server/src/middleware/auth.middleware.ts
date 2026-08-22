import type { Request, Response, NextFunction, } from 'express';

import { verifyAccessToken, } from '../utils/auth/jwt.js';

import { AppError } from '../utils/appError.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authorization = req.headers.authorization;

    if (!authorization) {
        throw new AppError('Authentication required', 401);
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
        throw new AppError('Invalid authorization header', 401);
    }

    try {
        const payload = await verifyAccessToken(token);

        req.user = {
            id: payload.sub,
            role: payload.role as | 'User' | 'Admin',
        };

        next();
    } catch {
        throw new AppError('Invalid or expired access token', 401);
    }
}