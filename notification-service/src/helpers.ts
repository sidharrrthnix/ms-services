import { IEmailLocals, WinstonLogger } from '@sidharrrthnix/ms-shared-package';
import Email from 'email-templates';
import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import { Logger } from 'winston';
import { config } from './config';
const log: Logger = WinstonLogger(`${config.elasticSearch.url}`, 'mailTransportHelper', 'debug');

async function emailTemplates(template: string, receiver: string, locals: IEmailLocals): Promise<void> {
  try {
    const smtpTransport: Transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: config.email.senderEmail,
        pass: config.email.senderEmailPassword
      }
    });

    const email: Email = new Email({
      message: {
        from: `Ms App <${config.email.senderEmail}>`
      },
      send: true,
      preview: false,
      transport: smtpTransport,
      views: {
        options: {
          extension: 'ejs'
        }
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '../build')
        }
      }
    });

    await email.send({
      template: path.join(__dirname, '..', 'src/emails', template),
      message: { to: receiver },
      locals
    });
  } catch (error) {
    log.error('Error sending email:', error);
  }
}

export { emailTemplates };
