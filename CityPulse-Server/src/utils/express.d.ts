import type { UserRole } from '../models/user.model.js';

declare global {
    namespace Express {
        interface UserPayload {
            id: string;
            role: UserRole;
        }

        interface Request {
            user?: UserPayload;
        }
    }
}

export { };