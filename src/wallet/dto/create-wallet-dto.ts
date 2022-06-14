import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWalletDto {
    @IsNotEmpty()
    @IsString()
    user: string;

    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    balance?: number;
}
