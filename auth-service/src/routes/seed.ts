import { create } from '@auth-service/controllers/seed';
import { Router } from 'express';

export function seedRoutes(): Router {
  const router = Router();
  router.put('/seed/:count', create);
  return router;
}
