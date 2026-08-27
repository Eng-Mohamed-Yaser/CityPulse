import { User, type IUser } from '../models/user.models.js';
import { AppError } from '../utils/appError.js';

export interface PromoteResult {
  id: string;
  name: string;
  email: string;
  role: IUser['role'];
}

export const promoteToAdmin = async (email: string): Promise<PromoteResult> => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new AppError('No user found with that email address', 404);
  }

  if (user.role === 'admin') {
    throw new AppError('User is already an admin', 409);
  }

  user.role = 'admin';
  await user.save();

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
