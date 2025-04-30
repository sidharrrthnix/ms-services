import { config } from '@gig-service/config';
import { WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { v2 as cloudinary } from 'cloudinary';
import { Logger } from 'winston';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'cloudinaryService', 'debug');

cloudinary.config({
  cloud_name: config.cloudinary.name,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true
});

export class CloudinaryService {
  async verifyConfiguration(): Promise<boolean> {
    try {
      log.info('Verifying Cloudinary configuration...', {
        cloudName: config.cloudinary.name,
        hasApiKey: !!config.cloudinary.apiKey,
        hasApiSecret: !!config.cloudinary.apiSecret
      });

      const result = await cloudinary.api.ping();
      log.info('Cloudinary configuration verified successfully', { result });
      return true;
    } catch (error) {
      log.error('Cloudinary configuration verification failed', { error });
      return false;
    }
  }

  async uploadImage(
    file: string,
    public_id?: string,
    overwrite?: boolean,
    invalidate?: boolean
  ): Promise<{ secure_url: string; public_id: string }> {
    try {
      // Validate base64 image input
      if (!file.startsWith('data:image/')) {
        const error = 'Invalid base64 image format. Must start with "data:image/"';
        log.error(error);
        throw new Error(error);
      }

      const uploadResult = await cloudinary.uploader.upload(file, {
        public_id,
        overwrite,
        invalidate,
        resource_type: 'auto'
      });

      return {
        secure_url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log.error('Cloudinary upload failed', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Cloudinary upload failed: ${errorMessage}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      log.info('Attempting to delete image from Cloudinary', { publicId });
      const result = await cloudinary.uploader.destroy(publicId);
      log.info('Image deleted successfully', { result });
    } catch (error) {
      log.error('Failed to delete image from Cloudinary', {
        publicId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to delete image');
    }
  }
}

// Exporting a singleton instance of the CloudinaryService
export const cloudinaryService = new CloudinaryService();
