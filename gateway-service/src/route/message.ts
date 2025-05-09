import { Router } from 'express';

import { Create } from '../controllers/message/create';
import { Get } from '../controllers/message/get';
import { Update } from '../controllers/message/update';

class MessageRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/message/conversation/:senderUsername/:receiverUsername', Get.prototype.conversation);
    this.router.get('/message/conversations/:username', Get.prototype.conversationList);
    this.router.get('/message/:senderUsername/:receiverUsername', Get.prototype.messages);
    this.router.get('/message/:conversationId', Get.prototype.userMessages);
    this.router.post('/message', Create.prototype.message);
    this.router.put('/message/offer', Update.prototype.offer);
    this.router.put('/message/mark-as-read', Update.prototype.markSingleMessage);
    this.router.put('/message/mark-multiple-as-read', Update.prototype.markMultipleMessages);
    return this.router;
  }
}

export const messageRoutes: MessageRoutes = new MessageRoutes();
