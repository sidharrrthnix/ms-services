import { gigs, singleGigById } from '@auth-service/controllers/search';
import { Router } from 'express';

const router: Router = Router();

export function searchRoutes(): Router {
  router.get('/search/gig/:from/:size/:type', gigs);
  router.get('/search/gig/:gigId', singleGigById);

  return router;
}

export default router;
