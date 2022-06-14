import { BadRequestException } from '@nestjs/common';

export class InsufficientTokensException extends BadRequestException {
    constructor(error?: string) {
        super(
            'insufficient funds you must have at least 100 tokens in your wallet',
            error,
        );
    }
}
