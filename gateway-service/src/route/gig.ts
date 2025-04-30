import { Create } from '@gateway-service/controllers/gig/create';
import { Delete } from '@gateway-service/controllers/gig/delete';
import { Seed } from '@gateway-service/controllers/gig/seed';
import { Update } from '@gateway-service/controllers/gig/update';
import { authMiddleware } from '@gateway-service/services/auth-middleware';
import express, { Router } from 'express';

import { Get } from '../controllers/gig/get';

class GigRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/gig/:gigId', Get.prototype.gigById);
    this.router.get('/seller/:sellerId', Get.prototype.getSellerGigs);
    this.router.get('/seller/pause/:sellerId', Get.prototype.getSellerPausedGigs);
    this.router.get('/category/:username', Get.prototype.getGigsByCategory);
    this.router.get('/more/:gigId', Get.prototype.getMoreGigsLikeThis);
    this.router.get('/top/:username', Get.prototype.getTopRatedGigsByCategory);
    this.router.post('/gig/create', authMiddleware.checkAuthentication, Create.prototype.gig);
    this.router.put('/gig/:gigId', authMiddleware.checkAuthentication, Update.prototype.gig);
    this.router.put('/gig/active/:gigId', authMiddleware.checkAuthentication, Update.prototype.gigActive);
    this.router.put('/gig/seed/:count', authMiddleware.checkAuthentication, Seed.prototype.gig);
    this.router.delete('/gig/:gigId/:sellerId', authMiddleware.checkAuthentication, Delete.prototype.gig);
    return this.router;
  }
}

export const gigRoutes: GigRoutes = new GigRoutes();
