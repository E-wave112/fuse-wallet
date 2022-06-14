import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePinDto {
    @IsString()
    @IsNotEmpty()
    oldPin: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Pin must be at least 6 characters' })
    newPin: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Pin must be at least 6 characters' })
    confirmPin: string;
}
