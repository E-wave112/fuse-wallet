import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Flutterwave = require('flutterwave-node-v3');
import {
    InternalErrorException,
    WalletNotFoundException,
    InsufficientTokensException,
} from '../exceptions';
import { FundWalletByCardDto } from './dto/fund-wallet-card.dto';
import { TransactionDto } from '../transaction/dto/transaction.dto';
import {
    TransactionType,
    TransactionStatus,
} from '../transaction/constants/transaction.enum';
import { TransactionService } from '../transaction/transaction.service';
import { Transactions } from '../transaction/entities/transaction.entity';
import { FundWalletByBanktDto } from './dto/fund-wallet-bank.dto';
import {
    FlutterwaveChargeCardDto,
    FlutterwaveChargeBankDto,
    FlutterwaveWithdrawDto,
} from './dto/flutterwave';
import { UserService } from '../user/user.service';
import { WithdrawWalletDto } from './dto/withraw-wallet.dto';
import { PeerTransferDto } from './dto/peer-transfer.dto';
import { EmailOption } from '../mail/types/mail.types';
import { mailStructure } from '../mail/interface-send/mail.send';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
        private configService: ConfigService,
        private transactionService: TransactionService,
        private userService: UserService,
        private mailService: MailService,
    ) {}

    async flutterwaveChargeCard(payload: FlutterwaveChargeCardDto) {
        const flw = new Flutterwave(
            this.configService.get('FLW_PUBLIC_KEY'),
            this.configService.get('FLW_SECRET_KEY'),
        );
        try {
            const response = await flw.Charge.card(payload);
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
            }
            if (response.meta.authorization.mode === 'redirect') {
                const url = response.meta.authorization.redirect;
                open(url);
            }

            return response;
        } catch (error: any) {
            throw new InternalErrorException(error.message);
        }
    }

    async fundWalletWithCard(user: any, data: FundWalletByCardDto) {
        // get the user card details from the req.user object
        const ref = `funded-${user.userId}`;
        const wallet = await this.checkIfWalletExists({
            where: { user: { id: user.userId } },
        });

        if (!wallet) throw new WalletNotFoundException();

        // check if the user is verified
        await this.userService.isVerifiedUser(user.userId);

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
            enckey: this.configService.get('FLW_ENCRYPTION_KEY'),
            tx_ref: ref, // This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
            authorization: {},
            pin: data.pin,
            otp: data.otp,
            callback_url: this.configService.get('WEBHOOK_URL'),
        };

        const funded = await this.flutterwaveChargeCard(payloadObj);
        if (funded.status === 'success') {
            funded.message = `Yahtzee!, ${data.amount} tokens is on the way to your wallet, you can check your wallet to see the balance`;

            const transactionObj: TransactionDto = {
                user: user.userId,
                amount: data.amount,
                type: TransactionType.CREDIT,
                status: TransactionStatus.PENDING,
                reference: ref,
                narration: 'transaction processing',
            };
            await this.transactionService.createTransaction(transactionObj);
            return { status: funded.status, message: funded.message };
        } else {
            return { status: funded.status, message: funded.message };
        }
    }

    async flutterwaveChargeBank(payload: FlutterwaveChargeBankDto) {
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
            throw new InternalErrorException();
        }
    }

    async fundWalletByBank(user: any, data: FundWalletByBanktDto) {
        const ref = `funded-${user.userId}`;

        const wallet = await this.checkIfWalletExists({
            where: { user: { id: user.userId } },
        });

        if (!wallet) throw new WalletNotFoundException();

        // check if the user is verified
        await this.userService.isVerifiedUser(user.userId);

        const payload = {
            tx_ref: ref, //This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
            amount: data.amount,
            account_bank: this.getBankCode(data.account_bank),
            account_number: data.accountNumber,
            currency: 'NGN',
            email: wallet.user.email,
            fullname: `${wallet.user.firstName} ${wallet.user.lastName}`,
            callback_url: this.configService.get('WEBHOOK_URL'),
        };

        const fundedBank = await this.flutterwaveChargeBank(payload);
        if (fundedBank.status === 'success') {
            fundedBank.message = `Yahtzee!, ${data.amount} tokens is on the way to your wallet, you can check your wallet to see the balance`;

            const transactionObj: TransactionDto = {
                user: user.userId,
                amount: data.amount,
                type: TransactionType.CREDIT,
                status: TransactionStatus.PENDING,
                reference: ref,
                narration: 'transaction processing',
            };
            await this.transactionService.createTransaction(transactionObj);

            return { status: fundedBank.status, message: fundedBank.message };
        } else {
            return { status: fundedBank.status, message: fundedBank.message };
        }
    }

    async flutterwaveWithdraw(payload: FlutterwaveWithdrawDto) {
        const flw = new Flutterwave(
            this.configService.get('FLW_PUBLIC_KEY'),
            this.configService.get('FLW_SECRET_KEY'),
        );
        try {
            const response = await flw.Transfer.initiate(payload);
            if (response.status === 'success') {
                return response;
            }
            return response;
        } catch (error: any) {
            throw new InternalErrorException(error.message);
        }
    }

    async withdrawFromWallet(user: any, data: WithdrawWalletDto) {
        const ref = `withdraw-${user.userId}`;

        const wallet = await this.checkIfWalletExists({
            where: { user: { id: user.userId } },
        });

        if (!wallet) throw new WalletNotFoundException();

        // check if the user is verified
        await this.userService.isVerifiedUser(user.userId);

        const payload: FlutterwaveWithdrawDto = {
            tx_ref: ref, //This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
            amount: data.amount, //This is the amount to be charged.
            account_bank: this.getBankCode(data.account_bank),
            account_number: data.accountNumber,
            currency: 'NGN',
            email: wallet.user.email,
            fullname: `${wallet.user.firstName} ${wallet.user.lastName}`,
            narration: 'funding my bank account',
            callback_url: this.configService.get('WEBHOOK_URL'),
            meta: {},
            debit_currency: 'NGN',
        };

        // check if the amount is greater than the balance by more than the minimum wallet balance
        const funds = this.checkSufficientFunds(Number(data.amount), wallet);
        if (!funds) throw new InsufficientTokensException();

        // check if the transaction pin is correct
        const checkTransactionPin =
            await this.userService.validateTransactionPin({
                userId: user.userId,
                pin: data.transactionPin,
            });
        const withdrawal = await this.flutterwaveWithdraw(payload);
        if (withdrawal.status === 'success') {
            withdrawal.message = `Yikes!, you have successfully withdrawn ${data.amount} tokens from your wallet`;
            await this.updateWalletBalance(-Number(data.amount), wallet);

            const transactionObj: TransactionDto = {
                user: user.userId,
                amount: data.amount,
                type: TransactionType.DEBIT,
                status: TransactionStatus.PENDING,
                reference: ref,
                narration: 'transaction processing',
            };
            await this.transactionService.createTransaction(transactionObj);

            return {
                status: withdrawal.status,
                message: withdrawal.message,
                wallet,
            };
        } else {
            return { status: withdrawal.status, message: withdrawal.message };
        }
    }

    async transferPeerTokens(data: PeerTransferDto) {
        try {
            const ref = `peer-transfer-${data.user.userId}`;
            // find the sender wallet
            const senderWallet = await this.checkIfWalletExists({
                where: { user: { id: data.user.userId } },
            });
            // check if the sender wallet balance is sufficient
            const funds = this.checkSufficientFunds(
                Number(data.amount),
                senderWallet,
            );
            if (!funds) throw new InsufficientTokensException();

            // check if the transaction pin is correct
            const checkTransactionPin =
                await this.userService.validateTransactionPin({
                    userId: data.user.userId,
                    pin: data.transactionPin,
                });
            // find the receiver wallet
            const receiverUser = await this.userService.findUserByEmail(
                data.receiver,
            );
            const ref2 = `peer-transfer-credit-${receiverUser.id}`;
            const receiverWallet = await this.checkIfWalletExists({
                where: { user: { id: receiverUser.id } },
            });
            // check if receiver is a beneficiary
            await this.userService.checkBeneficiary(data.user.userId, {
                email: data.receiver,
            });
            await this.updateWalletBalance(-Number(data.amount), senderWallet);
            await this.updateWalletBalance(Number(data.amount), receiverWallet);

            const transactionObjSender: TransactionDto = {
                user: data.user.userId,
                amount: data.amount,
                type: TransactionType.PEER_TRANSFER,
                status: TransactionStatus.SUCCESS,
                reference: ref,
                narration: 'peer transfer completed',
            };

            const transactionObjReceiver: TransactionDto = {
                user: receiverUser.id,
                amount: data.amount,
                type: TransactionType.CREDIT,
                status: TransactionStatus.SUCCESS,
                reference: ref2,
                narration: 'amount credited to your wallet',
            };
            const transactionQueue: Transactions[] = [
                await this.transactionService.createTransaction(
                    transactionObjSender,
                ),
                await this.transactionService.createTransaction(
                    transactionObjReceiver,
                ),
            ];

            Promise.all(transactionQueue).then((values) => {
                console.log('values:::', values);
            });

            const optionsReciever: EmailOption = mailStructure(
                [receiverUser.email],
                'support@fusewallet.io',
                'Notice of a Received Peer Transaction',
                this.configService.get('TEMPLATE_RECEIVED_ID'),
                {
                    name: `${receiverUser.firstName}`,
                    subject: 'Notice of a Received Peer Transaction',
                    amount: `${data.amount}`,
                    address: senderWallet.user.email,
                    balance: receiverWallet.balance,
                },
            );
            const optionsSender: EmailOption = mailStructure(
                [senderWallet.user.email],
                'support@fusewallet.io',
                'Notice of a Transfer',
                this.configService.get('TEMPLATE_TRANSFER_ID'),
                {
                    name: `${senderWallet.user.firstName}`,
                    subject: 'Notice of a Transfer',
                    amount: `${data.amount}`,
                    address: receiverWallet.user.email,
                    balance: senderWallet.balance,
                },
            );
            const mailSenderQueue = [
                await this.mailService.send(optionsSender),
                await this.mailService.send(optionsReciever),
            ];
            Promise.all(mailSenderQueue).then((values) => {
                console.log('values:::', values);
            });

            return {
                status: 200,
                message: `peer completed!, you have successfully sent ${data.amount} tokens to user with the address ${receiverUser.email}, you (and your peer) should recieve an email confirmation of the transaction`,
                senderWallet,
            };
        } catch (error) {
            throw new InternalErrorException(error.message);
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

    async checkIfWalletExists(
        obj: Record<any, unknown>,
    ): Promise<any | Wallet> {
        try {
            const findWallet = await this.walletRepository.findOne(obj);
            if (!findWallet) throw new WalletNotFoundException();
            return findWallet;
        } catch (error) {
            throw new WalletNotFoundException();
        }
    }

    async reconcileFundMethod(user: any, query: string, data: any) {
        try {
            if (!query)
                throw new InternalErrorException(
                    'method of funding is required',
                );
            return query == 'card'
                ? await this.fundWalletWithCard(user, data)
                : await this.fundWalletByBank(user, data);
        } catch (error) {
            throw new InternalErrorException(error.message);
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

    public async updateWalletBalance(
        amount: number,
        wallet: Partial<Wallet>,
    ): Promise<Partial<Wallet>> {
        wallet.balance += amount;
        await wallet.save();
        return wallet;
    }
}
