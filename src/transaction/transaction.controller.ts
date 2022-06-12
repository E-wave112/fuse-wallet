import { Controller } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UseGuards, Get } from '@nestjs/common';
import { UserAuthGuard } from '../auth/guards';
import { UserDecorator } from '../user/decorators/user.decorator';
import { Transactions } from './entities/transaction.entity';

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
}
