/* eslint-disable @typescript-eslint/no-unused-vars */
import { config } from '@gateway-service/config';
import { BadRequestError, IAuthPayload, NotAuthorizedError } from '@sidharrrthnix/ms-shared-package';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login again.', 'GatewayService verifyUser() method error');
    }

    try {
      const payload: IAuthPayload = verify(req.session.jwt, `${config.jwt.token}`) as IAuthPayload;
      req.currentUser = payload;
    } catch (_) {
      throw new NotAuthorizedError(
        'Token is not available. Please login again.',
        'GatewayService verifyUser() method invalid session error'
      );
    }
    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new BadRequestError('Authentication is required to access this route.', 'GatewayService checkAuthentication() method error');
    }
    next();
  }
}
export const authMiddleware: AuthMiddleware = new AuthMiddleware();

