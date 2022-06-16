import { Module, forwardRef } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from './entities/transaction.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transactions]),
        forwardRef(() => WalletModule),
        UserModule,
        AuthModule,
    ],
    controllers: [TransactionController],
    providers: [TransactionService, ConfigService, Transactions],
    exports: [TransactionService, Transactions],
})
export class TransactionModule {}
