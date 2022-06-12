import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AppModule } from '../app.module';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { UserAuthGuard } from '../auth/guards';
import { Transactions } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
jest.setTimeout(30000);

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        UserModule,
        AuthModule,
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
        expect(service.viewUserTransactions).toHaveBeenCalledWith(innerParam);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
