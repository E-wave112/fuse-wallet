import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangeTransactionPinDto {
    @IsString()
    @IsNotEmpty()
    oldPin: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(4, { message: 'Pin must be at least 4 characters' })
    newPin: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(4, { message: 'Pin must be at least 4 characters' })
    confirmPin: string;
}
