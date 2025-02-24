import { AuthModel } from '@auth-service/models/auth.schema';
import { loginSchema } from '@auth-service/schemes/signin';
import { getUserByEmail, getUserByUsername, signToken } from '@auth-service/services/auth.service';
import { BadRequestError, IAuthDocument, isEmail } from '@sidharrrthnix/ms-shared-package';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';

export const read = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'SignIn read() method error');
    }

    const { username, password } = req.body;
    const isValidEmail: boolean = isEmail(username);
    const existingUser: IAuthDocument | undefined = !isValidEmail ? await getUserByUsername(username) : await getUserByEmail(username);

    // Guard clause to ensure we have a valid user and password field
    if (!existingUser || !existingUser.password) {
      throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
    }

    // Prefer instance method over calling via the prototype if available
    const passwordsMatch: boolean = await AuthModel.prototype.comparePassword(password, existingUser.password);

    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials', 'SignIn read() method error');
    }

    const userJWT: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);
    const userData: IAuthDocument = omit(existingUser, ['password']);

    res.status(StatusCodes.OK).json({ message: 'User login successfully', user: userData, token: userJWT });
  } catch (error) {
    next(error);
  }
};
