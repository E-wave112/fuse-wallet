import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TransactionPinDto {
    @IsString()
    @IsNotEmpty()
    @Length(4, 4)
    newPin: string;

    @IsString()
    @IsNotEmpty()
    @Length(4, 4)
    confirmPin: string;
}
