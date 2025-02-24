import { changePassword, forgotPassword, resetPassword } from '@auth-service/controllers/password';
import { read } from '@auth-service/controllers/signin';
import { create } from '@auth-service/controllers/signup';
import { update } from '@auth-service/controllers/verify-email';
import express, { Router } from 'express';

const router: Router = express.Router();

export function authRoutes(): Router {
  router.post('/signup', create);
  router.post('/signin', read);
  router.put('/verify-email', update);
  router.put('/forgot-password', forgotPassword);
  router.put('/reset-password/:token', resetPassword);
  router.put('/change-password', changePassword);
  return router;
}
