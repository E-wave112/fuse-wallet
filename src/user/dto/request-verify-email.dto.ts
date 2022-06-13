import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class RequestVerifyEmailDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;
}
