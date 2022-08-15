import { Module, forwardRef } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionModule } from '../transaction/transaction.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { PeerToPeerEventListener } from './listeners';

@Module({
    controllers: [WalletController],
    providers: [WalletService, Wallet, PeerToPeerEventListener],
    imports: [
        TypeOrmModule.forFeature([Wallet]),
        forwardRef(() => TransactionModule),
        UserModule,
        AuthModule,
        MailModule,
    ],
    exports: [WalletService, Wallet],
})
export class WalletModule {}
