import {
    IsNotEmpty,
    IsString,
    IsEmail,
    IsMobilePhone,
    MinLength,
    IsOptional,
} from 'class-validator';

export class SignUpDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    firstName?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    lastName?: string;

    @IsOptional()
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Pin must be at least 6 characters' })
    pin?: string;

    @IsMobilePhone('en-NG', { message: 'Phone number is not valid' })
    @IsString()
    @IsNotEmpty()
    phone?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    deviceId?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    deviceModel?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    deviceIp?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    address?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    transactionPin?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    platform?: string;
}
