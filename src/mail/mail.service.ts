import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { EmailOption } from './types/mail.types';
import configuration from '../config/configuration';
import { InternalErrorException } from '../exceptions';
const configService: ConfigService = new ConfigService(configuration);

@Injectable()
export class MailService {
    sendgridConfig() {
        SendGrid.setApiKey(configService.get('SENDGRID_API_KEY'));
        SendGrid.setSubstitutionWrappers('{{', '}}'); // Configure the substitution tag wrappers globally
        return SendGrid;
    }
    async send(options: EmailOption) {
        const sendGridSend = this.sendgridConfig();
        try {
            const message: any = {
                to: options.recipients,
                from: options.from || 'support@bitwallet.io',
                subject: options.subject || 'Account Notification',
                templateId: options.templateId,
            };
            if (options.substitutions) {
                message.dynamic_template_data = Object.assign(
                    {},
                    options.substitutions,
                );
                return await sendGridSend.send(message);
            }
        } catch (error) {
            throw new InternalErrorException(error.message);
        }
    }
}
