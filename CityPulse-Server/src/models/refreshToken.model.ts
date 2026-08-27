import {
    Schema,
    model,
    type HydratedDocument,
    type Model,
    type Types,
} from 'mongoose';

export interface IRefreshToken {
    userId: Types.ObjectId;
    jti: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type HydratedRefreshTokenDocument =
    HydratedDocument<IRefreshToken>;

const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        jti: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        tokenHash: {
            type: String,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

refreshTokenSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

export const RefreshToken: Model<IRefreshToken> =
    model<IRefreshToken>('RefreshToken', refreshTokenSchema);