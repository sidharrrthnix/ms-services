import {
  Exchange,
  IConversationDocument,
  IMessageDetails,
  IMessageDocument,
  lowerCase,
  RoutingKey
} from '@sidharrrthnix/ms-shared-package';

import { ConversationModel } from '../models/conversation.schema';
import { MessageModel } from '../models/message.schema';
import { publishDirectMessage } from '../queues/chat.producer';
import { chatChannel, socketIOChatObject } from '../server';

const createConversation = async (conversationId: string, sender: string, receiver: string): Promise<void> => {
  await ConversationModel.create({
    conversationId,
    senderUsername: sender,
    receiverUsername: receiver
  });
};

const addMessage = async (data: IMessageDocument): Promise<IMessageDocument> => {
  const message: IMessageDocument = (await MessageModel.create(data)) as IMessageDocument;
  if (data.hasOffer) {
    const emailMessageDetails: IMessageDetails = {
      sender: data.senderUsername,
      amount: `${data.offer?.price}`,
      buyerUsername: lowerCase(`${data.receiverUsername}`),
      sellerUsername: lowerCase(`${data.senderUsername}`),
      title: data.offer?.gigTitle,
      description: data.offer?.description,
      deliveryDays: `${data.offer?.deliveryInDays}`,
      template: 'offer'
    };

    await publishDirectMessage(
      chatChannel,
      Exchange.OrderNotification,
      RoutingKey.OrderEmail,
      JSON.stringify(emailMessageDetails),
      'Order email sent to notification service.'
    );
  }
  socketIOChatObject.emit('message received', message);
  return message;
};

const getConversation = async (sender: string, receiver: string): Promise<IConversationDocument[]> => {
  const query = {
    $or: [
      { senderUsername: sender, receiverUsername: receiver },
      { senderUsername: receiver, receiverUsername: sender }
    ]
  };
  const conversation: IConversationDocument[] = await ConversationModel.aggregate([{ $match: query }]);
  return conversation;
};

const getUserConversationList = async (username: string): Promise<IMessageDocument[]> => {
  const query = {
    $or: [{ senderUsername: username }, { receiverUsername: username }]
  };
  const messages: IMessageDocument[] = await MessageModel.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$conversationId',
        result: { $top: { output: '$$ROOT', sortBy: { createdAt: -1 } } }
      }
    },
    {
      $project: {
        _id: '$result._id',
        conversationId: '$result.conversationId',
        sellerId: '$result.sellerId',
        buyerId: '$result.buyerId',
        receiverUsername: '$result.receiverUsername',
        receiverPicture: '$result.receiverPicture',
        senderUsername: '$result.senderUsername',
        senderPicture: '$result.senderPicture',
        body: '$result.body',
        file: '$result.file',
        gigId: '$result.gigId',
        isRead: '$result.isRead',
        hasOffer: '$result.hasOffer',
        createdAt: '$result.createdAt'
      }
    }
  ]);
  return messages;
};

const getMessages = async (sender: string, receiver: string): Promise<IMessageDocument[]> => {
  const query = {
    $or: [
      { senderUsername: sender, receiverUsername: receiver },
      { senderUsername: receiver, receiverUsername: sender }
    ]
  };
  const messages: IMessageDocument[] = await MessageModel.aggregate([{ $match: query }, { $sort: { createdAt: 1 } }]);
  return messages;
};

const getUserMessages = async (messageConversationId: string): Promise<IMessageDocument[]> => {
  const messages: IMessageDocument[] = await MessageModel.aggregate([
    { $match: { conversationId: messageConversationId } },
    { $sort: { createdAt: 1 } }
  ]);
  return messages;
};

const updateOffer = async (messageId: string, type: string): Promise<IMessageDocument> => {
  const message: IMessageDocument = (await MessageModel.findOneAndUpdate(
    { _id: messageId },
    {
      $set: {
        [`offer.${type}`]: true
      }
    },
    { new: true }
  )) as IMessageDocument;
  return message;
};

const markMessageAsRead = async (messageId: string): Promise<IMessageDocument> => {
  const message: IMessageDocument = (await MessageModel.findOneAndUpdate(
    { _id: messageId },
    {
      $set: {
        isRead: true
      }
    },
    { new: true }
  )) as IMessageDocument;
  socketIOChatObject.emit('message updated', message);
  return message;
};

const markManyMessagesAsRead = async (receiver: string, sender: string, messageId: string): Promise<IMessageDocument> => {
  (await MessageModel.updateMany(
    { senderUsername: sender, receiverUsername: receiver, isRead: false },
    {
      $set: {
        isRead: true
      }
    }
  )) as IMessageDocument;
  const message: IMessageDocument = (await MessageModel.findOne({ _id: messageId }).exec()) as IMessageDocument;
  socketIOChatObject.emit('message updated', message);
  return message;
};
export {
  addMessage,
  createConversation,
  getConversation,
  getMessages,
  getUserConversationList,
  getUserMessages,
  markManyMessagesAsRead,
  markMessageAsRead,
  updateOffer
};
