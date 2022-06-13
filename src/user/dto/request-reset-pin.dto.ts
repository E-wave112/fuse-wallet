import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class RequestResetPinDto {
    @IsOptional()
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
