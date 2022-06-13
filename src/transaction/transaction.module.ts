import { Module, forwardRef } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transactions } from './entities/transaction.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { WalletService } from '../wallet/wallet.service';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transactions]),
        forwardRef(() => WalletModule),
        UserModule,
        AuthModule,
    ],
    controllers: [TransactionController],
    providers: [TransactionService, WalletService, ConfigService],
    exports: [TransactionService],
})
export class TransactionModule {}
