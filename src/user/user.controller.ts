import {
    Controller,
    HttpStatus,
    Body,
    HttpCode,
    Post,
    Get,
    Put,
    Param,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UseGuards } from '@nestjs/common';
import { UserAuthGuard } from '../auth/guards';
import { UserDecorator } from './decorators/user.decorator';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LogInUserDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { ChangePinDto } from './dto/change-pin.dto';
import { ResetPinDto } from './dto/reset-pin.dto';
import { RequestResetPinDto } from './dto/request-reset-pin.dto';
import { TransactionPinDto } from './dto/transaction-pin.dto';
import { ResetTransactionPinDto } from './dto/reset-transaction-pin.dto';
import { PrivateKeyDto } from './dto/private-key.dto';
import { BeneficiaryDto } from './dto/beneficiary.dto';
import { ChangeTransactionPinDto } from './dto/change-transaction-pin.dto';

@Controller('user')
export class UserController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}

    @UseGuards(UserAuthGuard)
    @ApiBearerAuth()
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @Get('me')
    async view(@UserDecorator() user: { userId: string }) {
        return await this.userService.findUserById(user.userId);
    }

    @ApiOkResponse({ status: HttpStatus.OK })
    @HttpCode(HttpStatus.OK)
    @Post('auth/login')
    async login(@Body() body: LogInUserDto) {
        return await this.authService.login(body);
    }

    @Post('auth/register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse({ status: HttpStatus.CREATED })
    @ApiOperation({ summary: 'register a user' })
    async register(@Body() body: SignUpDto) {
        return await this.authService.signup(body);
    }

    @UseGuards(UserAuthGuard)
    @Put('update/:id')
    async update(@Param() params, @Body() body: Partial<User>) {
        return await this.userService.updateUser(params.id, body);
    }

    @UseGuards(UserAuthGuard)
    @Put('change-pin')
    async updateUserPin(
        @Body() body: ChangePinDto,
        @UserDecorator() users: any,
    ) {
        return await this.userService.updatePin(body, users.userId);
    }

    @UseGuards(UserAuthGuard)
    @Put('set-transaction-pin')
    async setUserTransactionPin(
        @Body() body: TransactionPinDto,
        @UserDecorator() users: any,
    ) {
        return await this.userService.setTransactionPin(users.userId, body);
    }

    @UseGuards(UserAuthGuard)
    @Post('validate-private-key')
    async validateUserPrivateKey(
        @Body() body: PrivateKeyDto,
        @UserDecorator() users: any,
    ) {
        return await this.userService.validatePrivateKey(users.userId, body);
    }

    @UseGuards(UserAuthGuard)
    @Put('reset-transaction-pin')
    async resetUserTransactionPin(
        @Body() body: ResetTransactionPinDto,
        @UserDecorator() users: any,
    ) {
        return await this.userService.resetTransactionPin(users.userId, body);
    }

    @UseGuards(UserAuthGuard)
    @Post('send-verification-email')
    async sendVerificationEmail(@UserDecorator() user: any) {
        const getUser = await this.view(user);
        return await this.userService.requestVerifyEmail({
            firstName: getUser.firstName,
            lastName: getUser.lastName,
            email: getUser.email,
        });
    }

    @Post('verify/:token/:email')
    async verifyEmail(
        @Param('token') params: string,
        @Param('email') email: string,
    ) {
        return await this.userService.verifyEmail({
            token: params,
            email: email,
        });
    }

    @Post('request-reset-pin')
    async requestResetPin(@Body() body: RequestResetPinDto) {
        return await this.userService.requestResetPin(body);
    }

    @Post('reset-pin/:resetToken')
    async resetPin(
        @Param('resetToken') params: string,
        @Body() body: ResetPinDto,
    ) {
        return await this.userService.resetPin({ ...body, token: params });
    }

    @UseGuards(UserAuthGuard)
    @Put('change-transaction-pin')
    async updateUserTransactionPin(
        @Body() body: ChangeTransactionPinDto,
        @UserDecorator() users: any,
    ) {
        return await this.userService.updateTransactionPin(body, users.userId);
    }

    @UseGuards(UserAuthGuard)
    @Get('beneficaries/me')
    async getUserBeneficaries(@UserDecorator() users: any) {
        return await this.userService.viewAllUserBeneficiaries(users.userId);
    }

    @UseGuards(UserAuthGuard)
    @Post('beneficiary/new')
    async addNewBeneficiary(
        @UserDecorator() users: any,
        @Body() body: BeneficiaryDto,
    ) {
        return await this.userService.addBeneficiary(users.userId, body);
    }

    @UseGuards(UserAuthGuard)
    @Put('beneficiary/remove')
    async deleteUserBeneficiary(
        @UserDecorator() users: any,
        @Body() body: BeneficiaryDto,
    ) {
        return await this.userService.deleteBeneficiary(users.userId, body);
    }

    @UseGuards(UserAuthGuard)
    @Get('beneficiary/one')
    async getSingleBeneficiary(
        @UserDecorator() users: any,
        @Body() body: BeneficiaryDto,
    ) {
        return await this.userService.checkBeneficiary(users.userId, body);
    }
}
