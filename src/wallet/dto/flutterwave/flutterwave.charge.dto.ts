import {
    IsString,
    IsNumber,
    IsNotEmpty,
    IsEmail,
    IsObject,
} from 'class-validator';
export class FlutterwaveChargeCardDto {
    @IsNotEmpty()
    @IsString()
    card_number: string;

    @IsNotEmpty()
    @IsString()
    cvv: string;

    @IsNotEmpty()
    @IsString()
    expiry_month: string;

    @IsNotEmpty()
    @IsString()
    expiry_year: string;

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
    enckey: string;

    @IsNotEmpty()
    @IsString()
    tx_ref: string;

    @IsNotEmpty()
    @IsObject()
    authorization: Record<any, any>;

    @IsNotEmpty()
    @IsString()
    pin: string;
    @IsNotEmpty()
    @IsString()
    otp: string;

    @IsNotEmpty()
    @IsString()
    callback_url: string;
}
