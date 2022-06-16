import {
    forwardRef,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Transactions } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionDto } from './dto/transaction.dto';
import {
    InternalErrorException,
    TransactionNotFoundException,
} from '../exceptions';
import { VerifyWebhookDto } from './dto/verify-webhook.dto';
import { TransactionStatus } from './constants/transaction.enum';
import { WalletService } from '../wallet/wallet.service';
import { stripString } from '../utils';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(Transactions)
        private TransactionsRepository: Repository<Transactions>,
        @Inject(forwardRef(() => WalletService))
        private walletService: WalletService,
    ) {}
    async createTransaction(payload: TransactionDto): Promise<Transactions> {
        try {
            const newTransaction: Transactions =
                this.TransactionsRepository.create(payload);
            await this.TransactionsRepository.save(newTransaction);
            return newTransaction;
        } catch (err: any) {
            throw new InternalErrorException(err.message);
        }
    }

    async viewUserTransactions(
        user: Record<any, unknown>,
    ): Promise<Transactions[]> {
        try {
            const userTransactions = await this.TransactionsRepository.find(
                user,
            );
            if (!userTransactions.length) {
                throw new TransactionNotFoundException();
            }
            return userTransactions;
        } catch (err: any) {
            throw new TransactionNotFoundException();
        }
    }

    // create a transaction service to confirm a webhook request
    async verifyWebhookService(data: VerifyWebhookDto) {
        try {
            const walletId = stripString(data.body.tx_ref);
            const findWallet = await this.walletService.checkIfWalletExists({
                where: { user: { id: walletId } },
            });
            // verify the hash of the webhook request
            if (!data.headers || data.headers !== data.hash) {
                // This request isn't from Flutterwave; discard
                throw new UnauthorizedException('Invalid hash');
            }
            const singleTransaction = await this.TransactionsRepository.findOne(
                {
                    reference: data.body.tx_ref,
                },
            );
            if (!singleTransaction) {
                throw new TransactionNotFoundException();
            }

            //update the transaction status
            singleTransaction.status = data.body.status;
            if (data.body.status === 'successful') {
                singleTransaction.status = TransactionStatus.SUCCESS;
                singleTransaction.amount = data.body.amount;
                singleTransaction.narration = 'Transaction successful';
                // update the wallet balance
                await this.walletService.updateWalletBalance(
                    Number(data.body.amount),
                    findWallet,
                );
            } else if (data.body.status === 'failed') {
                singleTransaction.status = TransactionStatus.FAILED;
                singleTransaction.narration = 'Transaction failed';
            }
            await this.TransactionsRepository.save(singleTransaction);
            return singleTransaction;
        } catch (error) {
            throw new InternalErrorException(error.message);
        }
    }
}
