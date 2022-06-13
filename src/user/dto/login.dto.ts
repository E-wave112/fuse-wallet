import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsOptional,
    IsMobilePhone,
} from 'class-validator';

export class LogInUserDto {
    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @IsMobilePhone('en-NG', { message: 'Phone number is not valid' })
    phone?: string;

    @IsString()
    @IsNotEmpty()
    pin: string;
}
