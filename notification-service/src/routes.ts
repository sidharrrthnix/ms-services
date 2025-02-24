import express, { Router } from 'express';

const router: Router = express.Router();

export function healthRoutes(): Router {
  router.get('/notification-health', (_req, res) => {
    res.status(200).send('Notification service is healthy and OK.');
  });
  return router;
}
