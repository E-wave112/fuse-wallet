import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnectionOptions } from 'typeorm';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionModule } from './transaction/transaction.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            expandVariables: true,
            cache: false,
            load: [configuration],
        }),

        TypeOrmModule.forRootAsync({
            useFactory: async () =>
                Object.assign(await getConnectionOptions(), {
                    autoLoadEntities: true,
                }),
        }),
        UserModule,
        WalletModule,
        TransactionModule,
        AuthModule,
        MailModule,
        EventEmitterModule.forRoot({
            // set this to `true` to use wildcards
            wildcard: true,
            // the delimiter used to segment namespaces
            delimiter: '.',
            // set this to `true` if you want to emit the newListener event
            newListener: false,
            // set this to `true` if you want to emit the removeListener event
            removeListener: false,
            // the maximum amount of listeners that can be assigned to an event
            maxListeners: 10,
            // show event name in memory leak message when more than maximum amount of listeners is assigned
            verboseMemoryLeak: false,
            // disable throwing uncaughtException if an error event is emitted and it has no listeners
            ignoreErrors: false,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    constructor(private connection: Connection) {}
}
