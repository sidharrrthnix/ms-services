import { gigService } from '@gateway-service/services/api/gig.service';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class Seed {
  public async gig(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await gigService.seed(req.params.count);
    res.status(StatusCodes.OK).json({ message: response.data.message });
  }
}
