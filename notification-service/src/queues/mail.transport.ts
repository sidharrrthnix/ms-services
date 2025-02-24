import { emailTemplates } from '@notification-service/helpers';
import { IEmailLocals, WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import { Logger } from 'winston';
import { config } from '../config';

const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'mailTransport', 'debug');
async function sendEmail(template: string, receiverEmail: string, locals: IEmailLocals): Promise<void> {
  try {
    emailTemplates(template, receiverEmail, locals);
    log.info('Email sent successfully.');
  } catch (error) {
    log.log('error', 'NotificationService MailTransport sendEmail() method error:', error);
  }
}

export { sendEmail };
