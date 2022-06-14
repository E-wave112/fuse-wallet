import { IsNotEmpty, Length, IsString } from 'class-validator';

export class ResetTransactionPinDto {
    @IsString()
    @IsNotEmpty()
    @Length(4, 4)
    transactionPin: string;

    @IsString()
    @IsNotEmpty()
    @Length(4, 4)
    confirmPin: string;
}
