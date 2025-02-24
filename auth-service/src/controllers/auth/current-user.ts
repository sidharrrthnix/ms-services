import { authService } from '@gateway-service/services/api/auth.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class CurrentUser {
  public async read(_req: Request, res: Response): Promise<void> {
    const respose: AxiosResponse = await authService.getCurrentUser();
    res.status(StatusCodes.OK).json({ message: respose.data.message, user: respose.data.user });
  }

  public async resendEmail(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await authService.resendEmail(req.body);
    res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
  }
}
