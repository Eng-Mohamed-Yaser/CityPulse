import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import { AppError } from '../utils/appError.js';

export function validate(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0]?.msg ?? 'Validation failed', 400);
  }

  next();
}