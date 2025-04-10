import { authService } from '@gateway-service/services/api/auth.service';
import { AxiosResponse } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class SignUp {
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: AxiosResponse = await authService.signUp(req.body);

      req.session = { jwt: response.data.token };

      res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
    } catch (error) {
      next(error);
    }
  }
}
