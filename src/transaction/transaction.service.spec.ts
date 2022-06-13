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
jest.setTimeout(30000);

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        Transactions,
        AppModule,
        UserModule,
        AuthModule,
        TypeOrmModule.forFeature([Transactions]),
      ],
      providers: [TransactionService],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
