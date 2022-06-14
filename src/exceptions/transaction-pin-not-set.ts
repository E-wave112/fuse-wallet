import { BadRequestException } from '@nestjs/common';

export class TransactionPinNotSetException extends BadRequestException {
    constructor(error?: string) {
        super('you have not set up your transaction pin!', error);
    }
}
