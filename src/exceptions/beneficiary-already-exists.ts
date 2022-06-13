import { BadRequestException } from '@nestjs/common';
export class BeneficiaryAlreadyAddedException extends BadRequestException {
    constructor(error?: string) {
        super('this beneficiary has already been added!', error);
    }
}
