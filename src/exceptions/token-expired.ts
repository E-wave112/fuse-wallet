import { BadRequestException } from '@nestjs/common';

export class TokenExpiredException extends BadRequestException {
    constructor(error?: string) {
        super('', error);
    }
}
