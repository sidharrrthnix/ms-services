import crypto from 'crypto';

import { cloudinaryService } from '@auth-service/cloudinary';
import { config } from '@auth-service/config';
import { publishDirectMessage } from '@auth-service/queues/auth.producer';
import { signupSchema } from '@auth-service/schemes/signup';
import { channel } from '@auth-service/server';
import { createAuthUser, getUserByUsernameOrEmail, signToken } from '@auth-service/services/auth.service';
import {
  BadRequestError,
  Exchange,
  IAuthDocument,
  IEmailMessageDetails,
  RoutingKey,
  firstLetterUppercase,
  lowerCase
} from '@sidharrrthnix/ms-shared-package';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidV4 } from 'uuid';
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate request payload using Joi schema
    const { error } = signupSchema.validate(req.body);
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'SignUp create() method error');
    }

    const { username, email, password, country, profilePicture } = req.body;

    // Check if user already exists
    const existingUser = await getUserByUsernameOrEmail(username, email);
    if (existingUser) {
      throw new BadRequestError('Invalid credentials. Email or Username already exists.', 'SignUp create() method error');
    }

    const profilePublicId = uuidV4();

    // Upload profile picture
    const uploadResultCandidate = await cloudinaryService.uploadImage(profilePicture, profilePublicId, true, true);
    const profilePictureUrl = uploadResultCandidate;

    // Generate email verification token
    const randomBytes: Buffer = crypto.randomBytes(20);
    const emailVerificationToken = randomBytes.toString('hex');

    // Prepare auth document
    const authData: IAuthDocument = {
      username: firstLetterUppercase(username),
      email: lowerCase(email),
      profilePublicId,
      password,
      country,
      profilePicture: profilePictureUrl,
      emailVerificationToken
    };

    // Create the auth user record
    const createdUser = await createAuthUser(authData);

    // Build verification message details for email notification
    const verificationLink = `${config.client.url}/confirm_email?v_token=${createdUser.emailVerificationToken}`;
    const messageDetails: IEmailMessageDetails = {
      receiverEmail: createdUser.email,
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

    // Sign session token (JWT)
    const userJWT = signToken(createdUser.id!, createdUser.email!, createdUser.username!);
    res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: createdUser, token: userJWT });
  } catch (err) {
    next(err);
  }
}
