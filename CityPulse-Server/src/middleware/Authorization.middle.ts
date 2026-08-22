import type { Request, Response, NextFunction } from "express";

export function AuthorizationAdmin(req: Request,res: Response,next: NextFunction) {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({
            msg: "Unauthorized"
        });
    }

    if (user.role !== "admin") {
        return res.status(403).json({
            msg: "Access denied. Admin only"
        });
    }

    next();
}
