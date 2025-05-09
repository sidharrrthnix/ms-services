import { IMessageDocument, WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Server, Socket } from 'socket.io';
import { io, Socket as SocketClient } from 'socket.io-client';
import { Logger } from 'winston';

import { config } from '../config';
import { GatewayCache } from '../redis/gateway.cache';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'gatewaySocket', 'debug');
let chatSocketClient: SocketClient;
export class SocketIOAppHandler {
  private io: Server;
  private gatewayCache: GatewayCache;

  constructor(io: Server) {
    this.io = io;
    this.gatewayCache = new GatewayCache();
    this.chatSocketServiceIOConnections();
  }

  public listen(): void {
    this.chatSocketServiceIOConnections();
    this.io.on('connection', async (socket: Socket) => {
      socket.on('getLoggedInUsers', async () => {
        const response: string[] = await this.gatewayCache.getLoggedInUsersFromCache('loggedInUsers');
        this.io.emit('online', response);
      });

      socket.on('loggedInUsers', async (username: string) => {
        const response: string[] = await this.gatewayCache.saveLoggedInUserToCache('loggedInUsers', username);
        this.io.emit('online', response);
      });

      socket.on('removeLoggedInUser', async (username: string) => {
        const response: string[] = await this.gatewayCache.removeLoggedInUserFromCache('loggedInUsers', username);
        this.io.emit('online', response);
      });

      socket.on('category', async (category: string, username: string) => {
        await this.gatewayCache.saveUserSelectedCategory(`selectedCategories:${username}`, category);
      });
    });
  }
  private chatSocketServiceIOConnections(): void {
    chatSocketClient = io(`${config.services.messages}`, {
      transports: ['websocket', 'polling'],
      secure: true
    });
    chatSocketClient.on('connect', () => {
      log.info('ChatService socket connected');
    });
    chatSocketClient.on('disconnect', (reason: SocketClient.DisconnectReason) => {
      log.info(`ChatService socket disconnected due to ${reason}`);
    });
    chatSocketClient.on('connect_error', (error: Error) => {
      log.info(`ChatService socket connection error: ${error}`);
    });

    chatSocketClient.on('message received', (data: IMessageDocument) => {
      this.io.emit('message received', data);
    });

    chatSocketClient.on('message updated', (data: IMessageDocument) => {
      this.io.emit('message updated', data);
    });
  }
}
