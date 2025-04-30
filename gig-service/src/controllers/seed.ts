import { publishDirectMessage } from '@gig-service/queues/gigs.producer';
import { gigChannel } from '@gig-service/server';
import { Exchange, RoutingKey } from '@sidharrrthnix/ms-shared-package';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const gig = async (req: Request, res: Response): Promise<void> => {
  const { count } = req.params;

  await publishDirectMessage(
    gigChannel,
    Exchange.Gig,
    RoutingKey.GetSellers,
    JSON.stringify({ type: 'getSellers', count }),
    'Gig seed message sent to user service.'
  );

  res.status(StatusCodes.CREATED).json({ message: 'Gig created successfully' });
};

export { gig };
