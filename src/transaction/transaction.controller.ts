import { Body, Controller, Post, Req } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UseGuards, Get } from '@nestjs/common';
import { UserAuthGuard } from '../auth/guards';
import { UserDecorator } from '../user/decorators/user.decorator';
import { Transactions } from './entities/transaction.entity';
import { VerifyWebhookDto } from './dto/verify-webhook.dto';
import configuration from '../config/configuration';
import { ConfigService } from '@nestjs/config';
const configService = new ConfigService(configuration);

@Controller('transactions')
export class TransactionController {
    constructor(private transactionService: TransactionService) {}
    @UseGuards(UserAuthGuard)
    @Get('user')
    async getUserTransactions(
        @UserDecorator() user: any,
    ): Promise<Transactions[] | string> {
        return await this.transactionService.viewUserTransactions({
            where: { user: { id: user.userId } },
        });
    }

    // create a controller to validate an incoming webhook request
    @Post('verify')
    async verifyWebhook(@Body() body, @Req() req) {
        const data = new VerifyWebhookDto();
        data.headers = req.headers['verif-hash'];
        const hash = configService.get('WEBHOOK_HASH');
        data.hash = hash;
        data.body = req.body.data;
        return await this.transactionService.verifyWebhookService(data);
    }
}
