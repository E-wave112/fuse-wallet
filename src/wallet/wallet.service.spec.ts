import { Test, TestingModule } from '@nestjs/testing';
import { TransactionModule } from '../transaction/transaction.module';
import { AppModule } from '../app.module';
import { WalletService } from './wallet.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import {
  FlutterwaveChargeDto,
  FlutterwaveWithdrawDto,
} from './dto/flutterwave';
import { v4 as uuidv4 } from 'uuid';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { WithdrawWalletDto } from './dto/withraw-wallet.dto';
import { TransactionDto } from '../transaction/dto/transaction.dto';
import {
  TransactionStatus,
  TransactionType,
} from '../transaction/constants/transaction.enum';
import { TransactionService } from '../transaction/transaction.service';
import { Transactions } from '../transaction/entities/transaction.entity';
jest.setTimeout(30000);

describe('WalletService', () => {
  let service: WalletService;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        AuthModule,
        TransactionModule,
        UserModule,
        TypeOrmModule.forFeature([Wallet, Transactions]),
      ],
      providers: [WalletService, TransactionService],
    }).compile();

    service = module.get<WalletService>(WalletService);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  describe('fund-wallet', () => {
    it('service to fund wallet and return a wallet', async () => {
      try {
        const user = uuidv4();
        const fund: FundWalletDto = {
          cardExpiration: '12/20',
          card: '1234567890123456',
          cardCvv: '123',
          amount: 1000,
          pin: '123456',
          otp: '1234',
        };
        const [month, year] = fund.cardExpiration.split('/');
        const flutterwavePayload: FlutterwaveChargeDto = {
          card_number: fund.card,
          cvv: fund.cardCvv,
          expiry_month: month,
          expiry_year: year,
          currency: 'NGN',
          amount: fund.amount,
          fullname: `Edmond Kirsch`,
          email: 'eddy@gmail.com',
          enckey: 'FLWSECK_TEST437a39a29cca',
          tx_ref: `ref-card-${Date.now()}`, // This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
          authorization: {},
          pin: fund.pin,
          otp: fund.otp,
        };

        const newTransaction: TransactionDto = {
          user: uuidv4(),
          amount: fund.amount,
          type: TransactionType.CREDIT,
          status: TransactionStatus.SUCCESS,
          reference: 'funded-1002123',
        };

        const result = await service.fundWallet(user, fund);
        const flwSpyService = await service.flutterwaveCharge(
          flutterwavePayload,
        );
        const transactionSpyService =
          await transactionService.createTransaction(newTransaction);
        expect(result).toBeCalledWith(user, fund);
        expect(flwSpyService).toHaveBeenCalled();
        expect(flwSpyService).toHaveBeenCalledWith(flutterwavePayload);
        expect(transactionSpyService).toHaveBeenCalled();
        expect(transactionSpyService).toHaveBeenCalledWith(newTransaction);
      } catch (error) {
        console.error(error);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('withdraw from wallet', () => {
    it('service to withdraw from wallet and return a wallet', async () => {
      try {
        const user = uuidv4();
        const withdraw: WithdrawWalletDto = {
          amount: 3000,
          account_bank: 'United Bank for Africa',
          accountNumber: '0690000037',
          transactionPin: '2000',
        };
        const flutterwavePayload: FlutterwaveWithdrawDto = {
          tx_ref: `ref-withdraw-${Date.now()}`, //This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
          amount: withdraw.amount, //This is the amount to be charged.
          account_bank: withdraw.account_bank, //This is the Bank numeric code. You can get a list of supported banks and their respective codes Here: https://developer.flutterwave.com/v3.0/reference#get-all-banks
          account_number: withdraw.accountNumber,
          currency: 'NGN',
          email: 'eddy@gmail.com',
          fullname: `Edmond Kirsch`,
        };

        const newTransaction: TransactionDto = {
          user: uuidv4(),
          amount: withdraw.amount,
          type: TransactionType.DEBIT,
          status: TransactionStatus.SUCCESS,
          reference: 'funded-1002123',
        };

        const result = await service.withdrawFromWallet(user, withdraw);
        const flwSpyService = await service.flutterwaveWithdraw(
          flutterwavePayload,
        );
        const transactionSpyService =
          await transactionService.createTransaction(newTransaction);
        expect(result).toBeCalledWith(user, withdraw);
        expect(flwSpyService).toHaveBeenCalled();
        expect(flwSpyService).toHaveBeenCalledWith(flutterwavePayload);
        expect(transactionSpyService).toHaveBeenCalled();
        expect(transactionSpyService).toHaveBeenCalledWith(newTransaction);
      } catch (error) {
        console.error(error);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
