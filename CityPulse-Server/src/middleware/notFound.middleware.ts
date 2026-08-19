import type { Request, Response, NextFunction } from "express";
export async function notFound(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.status(404).json({ message: "The page not found" });

  next();
}
