import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Flutterwave = require('flutterwave-node-v3');
import {
  InternalErrorException,
  WalletNotFoundException,
  InsufficientTokensException,
} from '../exceptions';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransactionDto } from '../transaction/dto/transaction.dto';
import {
  TransactionType,
  TransactionStatus,
} from '../transaction/constants/transaction.enum';
import { TransactionService } from '../transaction/transaction.service';
import { WithdrawWalletDto } from './dto/withraw-wallet.dto';
import {
  FlutterwaveChargeDto,
  FlutterwaveWithdrawDto,
} from './dto/flutterwave';
import { UserService } from '../user/user.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
    private configService: ConfigService,
    private transactionService: TransactionService,
    private userService: UserService,
  ) {}

  async flutterwaveCharge(payload: FlutterwaveChargeDto) {
    const flw = new Flutterwave(
      this.configService.get('FLW_PUBLIC_KEY'),
      this.configService.get('FLW_SECRET_KEY'),
    );
    try {
      const response = await flw.Charge.card(payload);
      console.log(response);
      if (response.status === 'error') {
        return response;
      }

      if (response.meta.authorization.mode === 'pin') {
        const payload2 = payload;
        payload2.authorization = {
          mode: 'pin',
          fields: ['pin'],
          pin: payload.pin,
        };
        const reCallCharge = await flw.Charge.card(payload2);
        if (response.status === 'error') {
          return response;
        }
        const callValidate = await flw.Charge.validate({
          otp: payload.otp,
          flw_ref: reCallCharge.data.flw_ref,
        });
        // console.log(callValidate)
      }
      if (response.meta.authorization.mode === 'redirect') {
        const url = response.meta.authorization.redirect;
        open(url);
      }

      return response;
    } catch (error: any) {
      console.error(error);
      throw new InternalErrorException();
    }
  }

  async fundWallet(user: any, data: FundWalletDto) {
    // get the user card details from the req.user object
    const ref = `funded-${Math.floor(Math.random() * 10000000 + 1)}-${
      user.userId
    }`;
    const wallet = await this.checkIfWalletExists({
      where: { user: { id: user.userId } },
    });

    if (!wallet) throw new WalletNotFoundException();

    // get the expiry year and month from the req.user object
    const [month, year] = data.cardExpiration.split('/');
    const payloadObj = {
      card_number: data.card,
      cvv: data.cardCvv,
      expiry_month: month,
      expiry_year: year,
      currency: 'NGN',
      amount: data.amount,
      fullname: `${wallet.user.firstName} ${wallet.user.lastName}`,
      email: wallet.user.email,
      enckey: 'FLWSECK_TEST437a39a29cca',
      tx_ref: `ref-card-${Date.now()}`, // This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
      authorization: {},
      pin: data.pin,
      otp: data.otp,
    };

    const funded = await this.flutterwaveCharge(payloadObj);
    if (funded.status === 'success') {
      funded.message = `Yahtzee!, you have successfully funded ${data.amount} tokens to your wallet`;
      wallet.balance = wallet.balance + Number(data.amount);
      await wallet.save();

      const transactionObj: TransactionDto = {
        user: user.userId,
        amount: data.amount,
        type: TransactionType.CREDIT,
        status: TransactionStatus.SUCCESS,
        reference: ref,
      };
      await this.transactionService.createTransaction(transactionObj);
      return { status: funded.status, message: funded.message, wallet };
    } else {
      throw new InternalErrorException();
    }
  }

  async flutterwaveWithdraw(payload: FlutterwaveWithdrawDto) {
    const flw = new Flutterwave(
      this.configService.get('FLW_PUBLIC_KEY'),
      this.configService.get('FLW_SECRET_KEY'),
    );
    try {
      const response = await flw.Charge.ng(payload);
      if (response.status === 'success') {
        return response;
      }
      return response;
    } catch (error: any) {
      console.error(error);
      throw new InternalErrorException();
    }
  }

  async withdrawFromWallet(user: any, data: WithdrawWalletDto) {
    const ref = `funded-${Math.floor(Math.random() * 10000000 + 1)}-${
      user.userId
    }`;

    const wallet = await this.checkIfWalletExists({
      where: { user: { id: user.userId } },
    });

    if (!wallet) throw new WalletNotFoundException();

    const payload = {
      tx_ref: `ref-withdraw-${Date.now()}`, //This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
      amount: data.amount, //This is the amount to be charged.
      account_bank: this.getBankCode(data.account_bank), //This is the Bank numeric code. You can get a list of supported banks and their respective codes Here: https://developer.flutterwave.com/v3.0/reference#get-all-banks
      account_number: data.accountNumber,
      currency: 'NGN',
      email: wallet.user.email,
      fullname: `${wallet.user.firstName} ${wallet.user.lastName}`,
    };

    // check if the amount is greater than the balance by more than the minimum wallet balance
    const funds = this.checkSufficientFunds(Number(data.amount), wallet);
    if (!funds) throw new InsufficientTokensException();

    // check if the transaction pin is correct
    const checkTransactionPin = await this.userService.validateTransactionPin({
      userId: user.userId,
      pin: data.transactionPin,
    });
    const withdrawal = await this.flutterwaveWithdraw(payload);
    if (withdrawal.status === 'success') {
      withdrawal.message = `Yikes!, you have successfully withdrawn ${data.amount} tokens from your wallet`;
      wallet.balance = wallet.balance - Number(data.amount);
      await wallet.save();

      const transactionObj: TransactionDto = {
        user: user.userId,
        amount: data.amount,
        type: TransactionType.DEBIT,
        status: TransactionStatus.SUCCESS,
        reference: ref,
      };
      await this.transactionService.createTransaction(transactionObj);

      return { status: withdrawal.status, message: withdrawal.message, wallet };
    } else {
      throw new InternalErrorException();
    }
  }

  public getBankCode(bank: string): string {
    let bank_code = '';
    switch (bank) {
      case (bank = 'Access Bank'):
        bank_code = '044';
        break;

      case (bank = 'Ecobank'):
        bank_code = '050';
        break;

      case (bank = 'Fidelity Bank'):
        bank_code = '070';
        break;

      case (bank = 'First Bank of Nigeria'):
        bank_code = '011';
        break;

      case (bank = 'First City Monument Bank (FCMB)'):
        bank_code = '214';
        break;

      case (bank = 'GTBank'):
        bank_code = '058';
        break;

      case (bank = 'Heritage Bank'):
        bank_code = '030';
        break;

      case (bank = 'Keystone Bank'):
        bank_code = '082';
        break;

      case (bank = 'Stanbic IBTC Bank'):
        bank_code = '221';
        break;

      case (bank = 'Sterling Bank'):
        bank_code = '232';
        break;

      case (bank = 'Union Bank'):
        bank_code = '032';
        break;

      case (bank = 'United Bank for Africa'):
        bank_code = '033';
        break;

      case (bank = 'Unity Bank'):
        bank_code = '215';
        break;

      case (bank = 'Wema Bank'):
        bank_code = '035';
        break;

      case (bank = 'Zenith Bank'):
        bank_code = '057';
        break;

      default:
        bank_code = '044';
        break;
    }

    return bank_code;
  }

  async checkIfWalletExists(obj: Record<any, unknown>): Promise<any | Wallet> {
    try {
      return await this.walletRepository.findOne(obj);
    } catch (error) {
      console.error(error);
      throw new WalletNotFoundException();
    }
  }

  public checkSufficientFunds(
    amount: number,
    wallet: Partial<Wallet>,
  ): boolean {
    if (wallet.balance - amount < 100) {
      return false;
    }
    return true;
  }
}
