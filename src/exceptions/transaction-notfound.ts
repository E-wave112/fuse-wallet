import { NotFoundException } from '@nestjs/common';

export class TransactionNotFoundException extends NotFoundException {
    constructor(error?: string) {
        super('Transaction not found!', error);
    }
}
