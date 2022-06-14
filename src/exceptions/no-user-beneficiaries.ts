import { BadRequestException } from '@nestjs/common';

export class NoBeneficiariesException extends BadRequestException {
    constructor(error?: string) {
        super('you have no beneficiaries at the moment!', error);
    }
}
