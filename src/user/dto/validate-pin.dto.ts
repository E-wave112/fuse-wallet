import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ValidatePinDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsString()
    @IsNotEmpty()
    pin: string;
}
