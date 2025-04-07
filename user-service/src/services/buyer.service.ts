import { IBuyerDocument, WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { config } from '@user-service/config';
import { Logger } from 'winston';

import { BuyerModel } from '../models/buyer.schema';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'buyerService', 'debug');

/**
 * Retrieve a buyer by their email.
 * @param email - The buyer's email.
 * @returns The buyer document or null if not found.
 */
const getBuyerByEmail = async (email: string): Promise<IBuyerDocument | null> => {
  try {
    const buyer = await BuyerModel.findOne({ email }).exec();
    return buyer;
  } catch (error) {
    log.error('Error in getBuyerByEmail:', error);
    throw error;
  }
};

/**
 * Retrieve a buyer by their username.
 * @param username - The buyer's username.
 * @returns The buyer document or null if not found.
 */
const getBuyerByUsername = async (username: string): Promise<IBuyerDocument | null> => {
  try {
    const buyer = await BuyerModel.findOne({ username }).exec();
    return buyer;
  } catch (error) {
    log.error('Error in getBuyerByUsername:', error);
    throw error;
  }
};

/**
 * Retrieve a random set of buyers.
 * @param count - The number of buyers to retrieve.
 * @returns An array of buyer documents.
 */
const getRandomBuyers = async (count: number): Promise<IBuyerDocument[]> => {
  try {
    const buyers: IBuyerDocument[] = await BuyerModel.aggregate([{ $sample: { size: count } }]);
    return buyers;
  } catch (error) {
    log.error('Error in getRandomBuyers:', error);
    throw error;
  }
};

/**
 * Create a new buyer if one does not exist.
 * @param buyerData - The data of the buyer to create.
 * @returns The created buyer document, or null if the buyer already exists.
 */
const createBuyer = async (buyerData: IBuyerDocument): Promise<IBuyerDocument | null> => {
  try {
    const existingBuyer = await getBuyerByEmail(buyerData.email!);
    if (existingBuyer) {
      log.info(`Buyer with email ${buyerData.email} already exists.`);
      return null;
    }
    const createdBuyer = await BuyerModel.create(buyerData);
    log.info(`Created buyer with email ${buyerData.email}.`);
    return createdBuyer;
  } catch (error) {
    log.error('Error in createBuyer:', error);
    throw error;
  }
};

const updateBuyerIsSellerProp = async (email: string): Promise<void> => {
  await BuyerModel.updateOne(
    { email },
    {
      $set: {
        isSeller: true
      }
    }
  ).exec();
};

const updateBuyerPurchasedGigsProp = async (buyerId: string, purchasedGigId: string, type: string): Promise<void> => {
  await BuyerModel.updateOne(
    { _id: buyerId },
    type === 'purchased-gigs'
      ? {
          $push: {
            purchasedGigs: purchasedGigId
          }
        }
      : {
          $pull: {
            purchasedGigs: purchasedGigId
          }
        }
  ).exec();
};
export { createBuyer, getBuyerByEmail, getBuyerByUsername, getRandomBuyers, updateBuyerIsSellerProp, updateBuyerPurchasedGigsProp };
