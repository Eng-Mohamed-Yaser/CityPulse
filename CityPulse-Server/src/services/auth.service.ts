import { Types } from 'mongoose';

import { User } from '../models/user.models.js';
import { RefreshToken } from '../models/refreshToken.model.js';

import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '../utils/auth/jwt.js';

import {
    hashPassword,
    comparePassword,
} from '../utils/auth/password.js';

import { hashToken } from '../utils/auth/token.js';

import { AppError } from '../utils/appError.js';

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

interface AuthResult {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
}

async function createRefreshToken(userId: string): Promise<string> {
    const { token, jti } = await generateRefreshToken(userId);

    const decoded = await verifyRefreshToken(token);

    if (!decoded.exp) {
        throw new AppError(
            'Failed to generate refresh token',
            500
        );
    }

    await RefreshToken.create({
        userId: new Types.ObjectId(userId),
        jti,
        tokenHash: hashToken(token),
        expiresAt: new Date(decoded.exp * 1000),
    });

    return token;
}

function buildAuthResult(
    user: { id: string; name: string; email: string; role: string; },
    accessToken: string, refreshToken: string): AuthResult {
    return {
        user,
        accessToken,
        refreshToken,
    };
}

export async function registerService(data: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.findOne({
        email: data.email.toLowerCase(),
    });

    if (existingUser) {
        throw new AppError('Email is already registered', 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
    });

    const accessToken = await generateAccessToken(
        user._id.toString(),
        user.role
    );

    const refreshToken = await createRefreshToken(
        user._id.toString()
    );

    return buildAuthResult(
        {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        },
        accessToken,
        refreshToken
    );
}

export async function loginService(data: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({
        email: data.email.toLowerCase(),
    }).select('+password');

    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
        throw new AppError('Your account is inactive', 403);
    }

    const passwordMatches = await comparePassword(
        data.password,
        user.password
    );

    if (!passwordMatches) {
        throw new AppError('Invalid email or password', 401);
    }

    const accessToken = await generateAccessToken(
        user._id.toString(),
        user.role
    );

    const refreshToken = await createRefreshToken(
        user._id.toString()
    );

    return buildAuthResult(
        {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        },
        accessToken,
        refreshToken
    );
}

export async function refreshService(refreshToken: string):
    Promise<{ accessToken: string; refreshToken: string; }> {

    let payload;

    try {
        payload = await verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError('Invalid or expired refresh token', 401);
    }

    const storedToken = await RefreshToken.findOne({
        jti: payload.jti,
        userId: payload.sub,
        tokenHash: hashToken(refreshToken),
        revokedAt: null,
    });

    if (!storedToken) {
        throw new AppError('Refresh token is invalid or has been revoked', 401);
    }

    if (storedToken.expiresAt <= new Date()) {
        await RefreshToken.updateOne(
            { _id: storedToken._id },
            {
                revokedAt: new Date(),
            }
        );

        throw new AppError('Refresh token has expired', 401);
    }

    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
        throw new AppError(
            'User account is unavailable',
            401
        );
    }

    await RefreshToken.updateOne(
        { _id: storedToken._id },
        {
            revokedAt: new Date(),
        }
    );

    const accessToken = await generateAccessToken(
        user._id.toString(),
        user.role
    );

    const newRefreshToken =
        await createRefreshToken(
            user._id.toString()
        );

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
}

export async function logoutService(refreshToken: string): Promise<void> {
    try {
        const payload = await verifyRefreshToken(refreshToken);

        await RefreshToken.updateOne(
            {
                jti: payload.jti,
                userId: payload.sub,
                tokenHash: hashToken(refreshToken),
                revokedAt: null,
            },
            {
                revokedAt: new Date(),
            }
        );
    } catch {
        // Logout should be idempotent.
        // Invalid/expired token does not need
        // to produce an error.
    }
}