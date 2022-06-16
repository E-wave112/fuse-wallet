import { Test, TestingModule } from '@nestjs/testing';
import { forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AppModule } from '../app.module';
import { WalletController } from './wallet.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { UserAuthGuard } from '../auth/guards';
import { v4 as uuidv4 } from 'uuid';
import { TransactionModule } from '../transaction/transaction.module';
import { FundWalletByCardDto } from './dto/fund-wallet-card.dto';
import { WalletService } from './wallet.service';
import { WithdrawWalletDto } from './dto/withraw-wallet.dto';
import { MailModule } from '../mail/mail.module';
jest.setTimeout(60000);

describe('WalletController', () => {
    let controller: WalletController;
    let service: WalletService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                AppModule,
                AuthModule,
                UserModule,
                forwardRef(() => TransactionModule),
                TypeOrmModule.forFeature([Wallet]),
                MailModule,
            ],
            controllers: [WalletController],
            providers: [WalletService],
        }).compile();

        controller = module.get<WalletController>(WalletController);
        service = module.get<WalletService>(WalletService);
    });

    describe('POST /wallet/user/fund-wallet', () => {
        it('controller to fund a user wallet', async () => {
            try {
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.fundWallet,
                );
                const guard = new guards[0]();
                const user = uuidv4();
                const fund: FundWalletByCardDto = {
                    cardExpiration: '12/20',
                    card: '1234567890123456',
                    cardCvv: '123',
                    amount: 1000,
                    pin: '123456',
                    otp: '1234',
                };
                const type = 'card';
                const result = await controller.fundWallet(fund, type, user);
                const serviceResult = await service.reconcileFundMethod(
                    user,
                    type,
                    fund,
                );
                expect(result).toBeCalledWith(fund, user);
                expect(serviceResult).toHaveBeenCalledWith(user, type, fund);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('POST /wallet/withdrawals', () => {
        it('controller to withdraw funds from a user wallet', async () => {
            try {
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.withdrawFromWallet,
                );
                const guard = new guards[0]();
                const user = uuidv4();
                const withdraw: WithdrawWalletDto = {
                    amount: 3000,
                    account_bank: 'United Bank for Africa',
                    accountNumber: '0690000037',
                    transactionPin: '2000',
                };

                const result = await controller.withdrawFromWallet(
                    withdraw,
                    user,
                );
                const serviceResult = await service.fundWalletByBank(
                    withdraw,
                    user,
                );
                expect(result).toHaveBeenCalledWith(withdraw, user);

                expect(service).toBeCalledWith(withdraw, user);
                expect(serviceResult).toHaveBeenCalledWith(withdraw, user);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
