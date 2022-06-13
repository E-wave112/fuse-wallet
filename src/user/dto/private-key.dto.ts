import { IsNotEmpty, IsString } from 'class-validator';

export class PrivateKeyDto {
    @IsString()
    @IsNotEmpty()
    privateKey: string;
}
