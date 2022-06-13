import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
} from 'class-validator';

export class ResetPinDto {
    @IsOptional()
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Pin must be at least 6 characters' })
    pin: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Pin must be at least 6 characters' })
    confirmPin: string;
}
