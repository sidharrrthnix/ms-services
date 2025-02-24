import crypto from 'crypto';

import { config } from '@auth-service/config';
import { publishDirectMessage } from '@auth-service/queues/auth.producer';
import { channel } from '@auth-service/server';
import { getAuthUserById, getUserByEmail, updateVerifyEmailField } from '@auth-service/services/auth.service';
import { BadRequestError, Exchange, IAuthDocument, IEmailMessageDetails, lowerCase, RoutingKey } from '@sidharrrthnix/ms-shared-package';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function read(req: Request, res: Response): Promise<void> {
  let user = null;
  const existingUser: IAuthDocument | undefined = await getAuthUserById(req.currentUser!.id);
  if (Object.keys(existingUser!).length) {
    user = existingUser;
  }
  res.status(StatusCodes.OK).json({ message: 'Authenticated user', user });
}

export async function resendEmail(req: Request, res: Response): Promise<void> {
  const { email, userId } = req.body;

  const checkIfUserExist: IAuthDocument | undefined = await getUserByEmail(email);
  if (!checkIfUserExist) {
    throw new BadRequestError('Email is invalid', 'CurrentUser resentEmail() method error');
  }
  const randomBytes: Buffer = crypto.randomBytes(20);
  const randomCharacters: string = randomBytes.toString('hex');
  const verificationLink = `${config.client.url}/confirm_email?v_token=${randomCharacters}`;
  await updateVerifyEmailField(parseInt(userId), 0, randomCharacters);
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: lowerCase(email),
    verifyLink: verificationLink,
    template: 'verifyEmail'
  };

  await publishDirectMessage(
    channel,
    Exchange.EmailNotification,
    RoutingKey.AuthEmail,
    JSON.stringify(messageDetails),
    'Verify email message sent to notification service.'
  );

  const updateUser = await getAuthUserById(parseInt(userId));
  res.status(StatusCodes.OK).json({ message: 'Email verification sent', user: updateUser });
}
