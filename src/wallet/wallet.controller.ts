import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { UserDecorator } from '../user/decorators/user.decorator';
import { UserAuthGuard } from '../auth/guards';
import { WalletService } from './wallet.service';
import { FundWalletByCardDto } from './dto/fund-wallet-card.dto';
import { FundWalletByBanktDto } from './dto/fund-wallet-bank.dto';
import { WithdrawWalletDto } from './dto/withraw-wallet.dto';
import { PeerTransferDto } from './dto/peer-transfer.dto';

@Controller('wallet')
export class WalletController {
    constructor(private walletService: WalletService) {}

    @UseGuards(UserAuthGuard)
    @Post('user/fund-wallet')
    async fundWallet(
        @Body() body: FundWalletByCardDto | FundWalletByBanktDto,
        @Query('type') type: string,
        @UserDecorator() user: any,
    ) {
        return this.walletService.reconcileFundMethod(user, type, body);
    }

    @UseGuards(UserAuthGuard)
    @Get('me')
    async getWallet(@UserDecorator() user: any) {
        return await this.walletService.checkIfWalletExists({
            where: { user: { id: user.userId } },
        });
    }

    @UseGuards(UserAuthGuard)
    @Post('withdrawals')
    async withdrawFromWallet(
        @Body() body: WithdrawWalletDto,
        @UserDecorator() user: any,
    ) {
        return await this.walletService.withdrawFromWallet(user, body);
    }

    @UseGuards(UserAuthGuard)
    @Post('peer-transfer')
    async TransferFromWallet(
        @Body() data: PeerTransferDto,
        @UserDecorator() user: any,
    ) {
        data.user = user;
        return await this.walletService.transferPeerTokens(data);
    }
}
