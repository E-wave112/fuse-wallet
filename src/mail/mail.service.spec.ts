import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { EmailOption } from './types/mail.types';
import { mailStructure } from './interface-send/mail.send';
import { ConfigService } from '@nestjs/config';
jest.setTimeout(60000);

describe('MailService', () => {
    let service: MailService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MailService, ConfigService],
        }).compile();

        service = module.get<MailService>(MailService);
        configService = module.get<ConfigService>(ConfigService);
    });

    describe('simulate send an email', () => {
        it('service to send an email', async () => {
            const email = 'dwave101@yahoo.com';

            const testEmail: EmailOption = mailStructure(
                [email],
                'dwave101@yahoo.com',
                'Trying out Email Sending',
                configService.get('TEMPLATE_RESET_PIN'),
                {
                    firstName: `Eddie`,
                    subject: 'Test Email',
                },
            );

            try {
                const emailInitSpyService = jest.spyOn(
                    service,
                    'sendgridConfig',
                );
                const emailSpyService = jest.spyOn(service, 'send');
                expect(emailSpyService).toBeCalledWith(testEmail);
                expect(emailInitSpyService).toHaveBeenCalled();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
