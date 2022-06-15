import {
    IsString,
    IsNumber,
    IsNotEmpty,
    IsEmail,
    IsOptional,
} from 'class-validator';

export class PeerTransferDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    user?: any;

    @IsNotEmpty()
    @IsEmail()
    receiver: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    transactionPin: string;
}
