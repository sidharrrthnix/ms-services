import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const health = (_req: Request, res: Response): void => {
  res.status(StatusCodes.OK).send('User service is healthy and OK.');
};
