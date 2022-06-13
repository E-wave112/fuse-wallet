import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { TransactionType } from '../constants/transaction.enum';
import { TransactionStatus } from '../constants/transaction.enum';

export class TransactionDto {
    @IsNotEmpty()
    @IsString()
    user: any;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsEnum(TransactionType)
    type: TransactionType;

    @IsNotEmpty()
    @IsEnum(TransactionStatus)
    status: TransactionStatus;

    @IsNotEmpty()
    @IsString()
    reference: string;

    @IsNotEmpty()
    @IsString()
    narration: string;
}
