import { CurrentUser } from '@gateway-service/controllers/auth/current-user';
import { RefreshToken } from '@gateway-service/controllers/auth/refresh-token';
import { authMiddleware } from '@gateway-service/services/auth-middleware';
import express, { Router } from 'express';

class CurrentUserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/auth/logged-in-user', authMiddleware.checkAuthentication, CurrentUser.prototype.getLoggedInUsers);
    this.router.get('/currentuser', authMiddleware.checkAuthentication, CurrentUser.prototype.read);
    this.router.post('/resend-email', authMiddleware.checkAuthentication, CurrentUser.prototype.resendEmail);
    this.router.get('/refresh-token/:username', authMiddleware.checkAuthentication, RefreshToken.prototype.token);
    this.router.delete('/auth/logged-in-user/:username', authMiddleware.checkAuthentication, CurrentUser.prototype.removeLoggedInUser);
    return this.router;
  }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes();
