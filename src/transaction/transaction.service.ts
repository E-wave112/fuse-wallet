import { Injectable } from '@nestjs/common';
import { Transactions } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionDto } from './dto/transaction.dto';
import {
  InternalErrorException,
  TransactionNotFoundException,
} from '../exceptions';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transactions)
    private TransactionsRepository: Repository<Transactions>,
  ) {}
  async createTransaction(payload: TransactionDto): Promise<Transactions> {
    try {
      const newTransaction: Transactions =
        this.TransactionsRepository.create(payload);
      await this.TransactionsRepository.save(newTransaction);
      return newTransaction;
    } catch (err: any) {
      console.error(err);
      throw new InternalErrorException(err.message);
    }
  }

  async viewUserTransactions(
    user: Record<any, unknown>,
  ): Promise<Transactions[]> {
    try {
      const userTransactions = await this.TransactionsRepository.find(user);
      if (!userTransactions.length) {
        throw new TransactionNotFoundException();
      }
      return userTransactions;
    } catch (err: any) {
      throw new TransactionNotFoundException();
    }
  }
}
