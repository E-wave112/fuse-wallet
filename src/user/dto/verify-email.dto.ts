import { IsNotEmpty, IsString, IsUUID, IsEmail } from 'class-validator';

export class VerifyEmailDto {
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsEmail()
    @IsEmail()
    email: string;
}
