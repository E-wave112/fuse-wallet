import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionModule } from '../transaction/transaction.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [WalletController],
  providers: [WalletService],
  imports: [
    TypeOrmModule.forFeature([Wallet]),
    TransactionModule,
    UserModule,
    AuthModule,
  ],
})
export class WalletModule {}
