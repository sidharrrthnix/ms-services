/* eslint-disable @typescript-eslint/no-unused-vars */
import { config } from '@auth-service/config';
import { AuthModel } from '@auth-service/models/auth.schema';
import { publishDirectMessage } from '@auth-service/queues/auth.producer';
import { channel } from '@auth-service/server';
import {
  Exchange,
  firstLetterUppercase,
  IAuthBuyerMessageDetails,
  IAuthDocument,
  lowerCase,
  RoutingKey,
  WinstonLogger
} from '@sidharrrthnix/ms-shared-package';
import { sign } from 'jsonwebtoken';
import { Op } from 'sequelize';
import { Logger } from 'winston';

/**
 * A custom error class so that errors thrown within the auth service
 * include additional context.
 */
class AuthServiceError extends Error {
  constructor(functionName: string, originalError: Error) {
    super(`Auth Service Error in ${functionName}: ${originalError.message}`);
    this.name = 'AuthServiceError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthServiceError);
    }
  }
}

/**
 * Helper function for error handling. Logs errors with details and rethrows a descriptive error.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleServiceError(functionName: string, error: any, extraData?: any): never {
  log.error(`Error in ${functionName}: ${error.message}`, { extraData, stack: error.stack });
  throw new AuthServiceError(functionName, error);
}

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'authService', 'debug');

export async function createAuthUser(data: IAuthDocument): Promise<IAuthDocument> {
  try {
    const userRecord = await AuthModel.create(data);
    // Convert to plain object for consistency.
    const userData = userRecord.get({ plain: true }) as IAuthDocument;

    const messageDetails: IAuthBuyerMessageDetails = {
      username: userData.username!,
      email: userData.email!,
      profilePicture: userData.profilePicture!,
      country: userData.country!,
      createdAt: userData.createdAt!,
      type: 'auth'
    };

    await publishDirectMessage(
      channel,
      Exchange.BuyerUpdate,
      RoutingKey.BuyerUpdate,
      JSON.stringify(messageDetails),
      'Buyer details sent to buyer service.'
    );

    // Omit the password before returning.
    const { password, ...userWithoutPassword } = userData;
    return userWithoutPassword as IAuthDocument;
  } catch (error) {
    // Do not log sensitive info (like the password) in extraData.
    handleServiceError('createAuthUser', error, { data: { ...data, password: 'REDACTED' } });
  }
}

export async function getAuthUserById(authId: number): Promise<IAuthDocument | undefined> {
  try {
    const userRecord = await AuthModel.findOne({
      where: { id: authId },
      attributes: { exclude: ['password'] }
    });
    if (!userRecord) {
      return undefined;
    }
    return userRecord.get({ plain: true });
  } catch (error) {
    handleServiceError('getAuthUserById', error, { authId });
  }
}

export async function getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument | undefined> {
  try {
    const userRecord = await AuthModel.findOne({
      where: {
        [Op.or]: [{ username: firstLetterUppercase(username) }, { email: lowerCase(email) }]
      },
      attributes: { exclude: ['password'] }
    });
    if (!userRecord) {
      return undefined;
    }
    return userRecord.get({ plain: true });
  } catch (error) {
    handleServiceError('getUserByUsernameOrEmail', error, { username, email });
  }
}

export async function getUserByUsername(username: string): Promise<IAuthDocument | undefined> {
  try {
    const userRecord = await AuthModel.findOne({
      where: { username: firstLetterUppercase(username) }
    });
    if (!userRecord) {
      return undefined;
    }
    return userRecord.get({ plain: true });
  } catch (error) {
    handleServiceError('getUserByUsername', error, { username });
  }
}

export async function getUserByEmail(email: string): Promise<IAuthDocument | undefined> {
  try {
    const userRecord = await AuthModel.findOne({
      where: { email: lowerCase(email) }
    });
    if (!userRecord) {
      return undefined;
    }
    return userRecord.get({ plain: true });
  } catch (error) {
    handleServiceError('getUserByEmail', error, { email });
  }
}

export async function getAuthUserByVerificationToken(token: string): Promise<IAuthDocument | undefined> {
  try {
    const userRecord = await AuthModel.findOne({
      where: { emailVerificationToken: token },
      attributes: { exclude: ['password'] }
    });
    if (!userRecord) {
      return undefined;
    }
    return userRecord.get({ plain: true });
  } catch (error) {
    handleServiceError('getAuthUserByVerificationToken', error, { token });
  }
}

export async function getAuthUserByPasswordToken(token: string): Promise<IAuthDocument | undefined> {
  try {
    const userRecord = await AuthModel.findOne({
      where: {
        [Op.and]: [{ passwordResetToken: token }, { passwordResetExpires: { [Op.gt]: new Date() } }]
      },
      attributes: { exclude: ['password'] }
    });
    if (!userRecord) {
      return undefined;
    }
    return userRecord.get({ plain: true });
  } catch (error) {
    handleServiceError('getAuthUserByPasswordToken', error, { token });
  }
}

export async function updateVerifyEmailField(authId: number, emailVerified: number, emailVerificationToken?: string): Promise<void> {
  try {
    const updateData = emailVerificationToken ? { emailVerified, emailVerificationToken } : { emailVerified };
    await AuthModel.update(updateData, { where: { id: authId } });
  } catch (error) {
    handleServiceError('updateVerifyEmailField', error, { authId, emailVerified, emailVerificationToken });
  }
}

export async function updatePasswordToken(authId: number, token: string, tokenExpiration: Date): Promise<void> {
  try {
    await AuthModel.update(
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration
      },
      { where: { id: authId } }
    );
  } catch (error) {
    handleServiceError('updatePasswordToken', error, { authId, token, tokenExpiration });
  }
}

export async function updatePassword(authId: number, password: string): Promise<void> {
  try {
    await AuthModel.update(
      {
        password,
        passwordResetToken: '',
        passwordResetExpires: new Date()
      },
      { where: { id: authId } }
    );
  } catch (error) {
    handleServiceError('updatePassword', error, { authId });
  }
}

export function signToken(id: number, email: string, username: string): string {
  return sign({ id, email, username }, config.auth.jwtToken!);
}

export async function deleteAllUsers() {
  try {
    await AuthModel.destroy({
      where: {},
      truncate: true
    });
    console.log('All records have been deleted successfully.');
  } catch (error) {
    handleServiceError('deleteAllUsers', error);
  }
}

export const deleteUserById = async (id: number) => {
  try {
    await AuthModel.destroy({ where: { id } });
  } catch (error) {
    handleServiceError('deleteUserById', error, { id });
  }
};
