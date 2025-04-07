import crypto from 'crypto';

import { createAuthUser, getUserByUsernameOrEmail } from '@auth-service/services/auth.service';
import { faker } from '@faker-js/faker';
import { BadRequestError, firstLetterUppercase, IAuthDocument, lowerCase } from '@sidharrrthnix/ms-shared-package';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sample } from 'lodash';
import { generateUsername } from 'unique-username-generator';
import { v4 as uuidV4 } from 'uuid';

export async function create(req: Request, res: Response): Promise<void> {
  const { count } = req.params;
  const usernames: string[] = [];
  for (let i = 0; i < parseInt(count, 10); i++) {
    const username: string = generateUsername('', 0, 12);
    usernames.push(firstLetterUppercase(username));
  }
  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    const email = faker.internet.email();
    const password = 'qwertyqwertyqwerty';
    const country = faker.location.country();
    const profilePicture = faker.image.urlPicsumPhotos();
    const checkIfUserExist: IAuthDocument | undefined = await getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials. Email or Username', 'Seed create() method error');
    }
    const profilePublicId = uuidV4();
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const authData: IAuthDocument = {
      username: firstLetterUppercase(username),
      email: lowerCase(email),
      profilePublicId,
      password,
      country,
      profilePicture,
      emailVerificationToken: randomCharacters,
      emailVerified: sample([0, 1])
    };
    await createAuthUser(authData);
  }
  res.status(StatusCodes.OK).json({ message: 'Seed users created successfully.' });
}
