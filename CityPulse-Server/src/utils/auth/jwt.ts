import jwt, { type SignOptions, type JwtPayload, } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../Config/env.config.js';
import { AppError } from '../appError.js';
export type TokenType = 'access' | 'refresh';

export interface AccessTokenPayload extends JwtPayload {
    sub: string;
    role: string;
    type: 'access';
}

export interface RefreshTokenPayload extends JwtPayload {
    sub: string;
    jti: string;
    type: 'refresh';
}

export async function generateAccessToken(userId: string, role: string): Promise<string> {
    const payload: AccessTokenPayload = { sub: userId, role, type: 'access', };

    return await jwt.sign(
        payload,
        env.jwtAccessSecret,
        {
            expiresIn: env.jwtAccessExpiration as NonNullable<SignOptions['expiresIn']>,
        }
    );
}

export async function generateRefreshToken(userId: string): Promise<{ token: string; jti: string; }> {
    const jti = crypto.randomUUID();

    const payload: RefreshTokenPayload = {
        sub: userId,
        jti,
        type: 'refresh',
    };

    const token = await jwt.sign(
        payload,
        env.jwtRefreshSecret,
        {
            expiresIn: env.jwtRefreshExpiration as NonNullable<SignOptions['expiresIn']>,
        }
    );

    return {
        token,
        jti,
    };
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const decoded = await jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;

    if (decoded.type !== 'access' || !decoded.sub || !decoded.role) {
        throw new AppError('Invalid access token', 401);
    }

    return decoded;
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const decoded = await jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;

    if (decoded.type !== 'refresh' || !decoded.sub || !decoded.jti) {
        throw new AppError('Invalid refresh token', 401);
    }

    return decoded;
}