import { IsString, IsNumber, IsNotEmpty, IsEmail } from 'class-validator';
export class FlutterwaveChargeBankDto {
    @IsNotEmpty()
    @IsString()
    currency: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    fullname: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    account_bank: string;

    @IsNotEmpty()
    @IsString()
    account_number: string;

    @IsNotEmpty()
    @IsString()
    tx_ref: string;

    @IsNotEmpty()
    @IsString()
    callback_url: string;
}
