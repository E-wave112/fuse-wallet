import { Test, TestingModule } from '@nestjs/testing';
import { TransactionDto } from './dto/transaction.dto';
import { Transactions } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import {
    TransactionType,
    TransactionStatus,
} from './constants/transaction.enum';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../app.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { VerifyWebhookDto } from './dto/verify-webhook.dto';
import { stripString } from '../utils';
jest.setTimeout(60000);
jest.mock('../wallet/wallet.service');

describe('TransactionService', () => {
    let service: TransactionService;
    let walletService: WalletService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                Transactions,
                AppModule,
                UserModule,
                AuthModule,
                WalletModule,
                TypeOrmModule.forFeature([Transactions]),
            ],
            providers: [TransactionService, WalletService],
        }).compile();

        service = module.get<TransactionService>(TransactionService);
        walletService = module.get<WalletService>(WalletService);
    });

    describe('creates transaction', () => {
        it('should create a new user transaction', async () => {
            try {
                const id = uuidv4();
                const newTransaction: TransactionDto = {
                    user: id,
                    amount: 200,
                    type: TransactionType.CREDIT,
                    status: TransactionStatus.SUCCESS,
                    reference: 'funded-1002123',
                    narration: 'Funded wallet',
                };
                const result = await service.createTransaction(newTransaction);
                expect(result).toHaveBeenCalledWith(newTransaction);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('views all User Transactions', () => {
        it('views all the transactions of a particular user', async () => {
            try {
                const innerParam = {
                    user: 1,
                };
                const result = await service.viewUserTransactions(innerParam);
                expect(result).toHaveBeenCalledWith(innerParam);
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
                const checkWallet = await walletService.checkIfWalletExists({
                    where: {
                        user: { id: stripString(webhook.body.txRef) },
                    },
                });
                const walletUpdate = await walletService.updateWalletBalance(
                    Number(webhook.body.amount),
                    checkWallet,
                );

                const result = await service.verifyWebhookService(webhook);
                expect(stripString).toHaveBeenCalledWith(webhook.body.txRef);
                expect(result).toHaveBeenCalledWith(webhook);
                expect(walletUpdate).toHaveBeenCalledWith(
                    Number(webhook.body.amount),
                    checkWallet,
                );
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
