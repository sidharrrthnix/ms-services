import { seller as createSeller } from '@user-service/controller/seller/create';
import { id, random, username } from '@user-service/controller/seller/get';
import { seed } from '@user-service/controller/seller/seed';
import { seller as updateSeller } from '@user-service/controller/seller/update';
import express, { Router } from 'express';

const router: Router = express.Router();

const sellerRoutes = (): Router => {
  router.get('/id/:sellerId', id);
  router.get('/username/:username', username);
  router.get('/random/:size', random);
  router.post('/create', createSeller);
  router.put('/:sellerId', updateSeller);
  router.put('/seed/:count', seed);

  return router;
};

export { sellerRoutes };
