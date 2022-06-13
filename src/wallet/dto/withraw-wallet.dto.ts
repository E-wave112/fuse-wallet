import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class WithdrawWalletDto {
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    account_bank: string;

    @IsNotEmpty()
    @IsString()
    accountNumber: string;

    @IsNotEmpty()
    @IsString()
    transactionPin: string;
}
