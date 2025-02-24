import { getUserByUsername, signToken } from '@auth-service/services/auth.service';
import { BadRequestError, IAuthDocument } from '@sidharrrthnix/ms-shared-package';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function token(req: Request, res: Response): Promise<void> {
  const existingUser: IAuthDocument | undefined = await getUserByUsername(req.params.username);
  if (!existingUser) {
    throw new BadRequestError('User not found', 'AuthController token() method error');
  }
  const userJWT: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);
  res.status(StatusCodes.OK).json({ message: 'Refresh token', user: existingUser, token: userJWT });
}
