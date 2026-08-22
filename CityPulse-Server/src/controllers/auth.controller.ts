import type { Request, Response, NextFunction, } from 'express';

import { registerService, loginService, refreshService, logoutService, } from '../services/auth.service.js';

import { env } from '../config/env.config.js';

const REFRESH_COOKIE_NAME = 'citypulse_refresh_token';

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite as
        | 'strict'
        | 'lax'
        | 'none',
    path: '/api/auth',
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const result = await registerService(req.body);

        res
            .cookie(
                REFRESH_COOKIE_NAME,
                result.refreshToken,
                REFRESH_COOKIE_OPTIONS
            )
            .status(201)
            .json({
                success: true,
                message: 'Registration successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction ): Promise<void> {
    try {
        const result = await loginService(req.body);

        res
            .cookie(
                REFRESH_COOKIE_NAME,
                result.refreshToken,
                REFRESH_COOKIE_OPTIONS
            )
            .status(200)
            .json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
    } catch (error) {
        next(error);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction ): Promise<void> {
    try {
        const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

        if (!refreshToken) {
            res.status(401).json({success: false, message: 'Refresh token is required', });
            return;
        }

        const result = await refreshService(refreshToken);

        res
            .cookie(
                REFRESH_COOKIE_NAME,
                result.refreshToken,
                REFRESH_COOKIE_OPTIONS
            )
            .status(200)
            .json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: result.accessToken,
                },
            });
    } catch (error) {
        next(error);
    }
}

export async function logout(req: Request,res: Response,next: NextFunction ): Promise<void> {
    try {
        const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

        if (refreshToken) {
            await logoutService(refreshToken);
        }

        res
            .clearCookie(
                REFRESH_COOKIE_NAME,
                REFRESH_COOKIE_OPTIONS
            )
            .status(200)
            .json({
                success: true,
                message: 'Logout successful',
            });
    } catch (error) {
        next(error);
    }
}