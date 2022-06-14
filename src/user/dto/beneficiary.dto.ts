import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class BeneficiaryDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;
}
