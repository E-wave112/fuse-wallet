import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AppModule } from '../app.module';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { UserAuthGuard } from '../auth/guards';
import { Transactions } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { VerifyWebhookDto } from './dto/verify-webhook.dto';
import { WalletModule } from '../wallet/wallet.module';
jest.setTimeout(60000);

describe('TransactionController', () => {
    let controller: TransactionController;
    let service: TransactionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                AppModule,
                UserModule,
                AuthModule,
                WalletModule,
                TypeOrmModule.forFeature([Transactions]),
            ],
            controllers: [TransactionController],
            providers: [TransactionService],
        }).compile();

        controller = module.get<TransactionController>(TransactionController);
        service = module.get<TransactionService>(TransactionService);
    });

    describe('GET /transactions/user', () => {
        it('should view all transactions by a particular user', async () => {
            try {
                const innerParam = {
                    user: 1,
                };
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.getUserTransactions,
                );
                const guard = new guards[0]();
                const controllerResult = await controller.getUserTransactions(
                    innerParam,
                );
                expect(controllerResult).toBeCalledWith(innerParam);
                expect(guard).toBeInstanceOf(UserAuthGuard);
                expect(service.viewUserTransactions).toHaveBeenCalledWith(
                    innerParam,
                );
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('verifies a webhook transaction', () => {
        it('service verify a webhook transaction', async () => {
            try {
                const webhook = new VerifyWebhookDto();
                webhook.hash = `${uuidv4() - Date.now()}`;
                webhook.reference = `${uuidv4()}`;
                webhook.body = {
                    id: 3485324,
                    txRef: 'funded-2598438-32ecd7f0-ebf2-474c-b7df-84420ecd8840',
                    flwRef: 'FLWACHMOCK-1655250505180_AA',
                    orderRef: 'URF_1655250505021_8088335',
                    paymentPlan: null,
                    paymentPage: null,
                    createdAt: '2022-06-14T23:48:25.000Z',
                    amount: 2000,
                    charged_amount: 2000,
                    status: 'successful',
                    IP: '52.205.154.141',
                    currency: 'NGN',
                    appfee: null,
                    merchantfee: 0,
                    merchantbearsfee: 1,
                    customer: {
                        id: 1658845,
                        phone: null,
                        fullName:
                            'Edmond Kirsch-32ecd7f0-ebf2-474c-b7df-84420ecd8840',
                        customertoken: null,
                        email: 'iyayiemmanuel1@gmail.com',
                        createdAt: '2022-06-14T23:48:25.000Z',
                        updatedAt: '2022-06-14T23:48:25.000Z',
                        deletedAt: null,
                        AccountId: 681547,
                    },
                    entity: {
                        account_number: '0690000037',
                        first_name: 'Edmond',
                        last_name:
                            'Kirsch-32ecd7f0-ebf2-474c-b7df-84420ecd8840',
                        createdAt: '2022-06-14T23:48:24.000Z',
                    },
                    'event.type': 'ACCOUNT_TRANSACTION',
                };
                let req: any;
                const controllerResult = await controller.verifyWebhook(
                    webhook,
                    req,
                );
                const result = await service.verifyWebhookService(webhook);
                expect(result).toHaveBeenCalledWith(webhook);
                expect(controllerResult).toHaveBeenCalledWith(webhook, req);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
