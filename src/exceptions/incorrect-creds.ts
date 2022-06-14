import { UnauthorizedException } from '@nestjs/common';

export class IncorrectCredentialsException extends UnauthorizedException {
    constructor(error?: string) {
        super('', error);
    }
}
