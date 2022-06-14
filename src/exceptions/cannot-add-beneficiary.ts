import { BadRequestException } from '@nestjs/common';
export class CannotAddSelfException extends BadRequestException {
    constructor(error?: string) {
        super('you cannot add yourself as a beneficiary!', error);
    }
}
