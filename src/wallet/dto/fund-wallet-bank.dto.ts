import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class FundWalletByBanktDto {
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    account_bank: string;

    @IsNotEmpty()
    @IsString()
    accountNumber: string;
}
