import type { Request, Response, NextFunction } from 'express';
import { promoteToAdmin } from '../services/admin.service.js';

export const promoteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };

    const user = await promoteToAdmin(email!);

    res.status(200).json({
      success: true,
      message: `${user.name} has been promoted to admin`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
