import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class VerifyWebhookDto {
    @IsNotEmpty()
    @IsString()
    hash: string;

    @IsNotEmpty()
    @IsString()
    reference: string;

    @IsNotEmpty()
    headers: any | string;

    @IsNotEmpty()
    @IsObject()
    body: Record<any, any>;
}
