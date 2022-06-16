import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { Emailver } from './entities/emailver.entity';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { SignUpDto } from './dto/signup.dto';
import { LogInUserDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';
import { ResetPinDto } from './dto/reset-pin.dto';
import { ChangePinDto } from './dto/change-pin.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestVerifyEmailDto } from './dto/request-verify-email.dto';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';
import { EmailOption } from '../mail/types/mail.types';
import { mailStructure } from '../mail/interface-send/mail.send';
import { AuthService } from '../auth/auth.service';
import { TransactionPinDto } from './dto/transaction-pin.dto';
import { PrivateKeyDto } from './dto/private-key.dto';
import { ResetTransactionPinDto } from './dto/reset-transaction-pin.dto';
import { stringToArray, arrayToString, excludeFields } from '../utils';
import { BeneficiaryDto } from './dto/beneficiary.dto';

jest.setTimeout(60000);

describe('UserService', () => {
    let service: UserService;
    let configService: ConfigService;
    let authService: AuthService;
    let mailService: MailService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                User,
                {
                    provide: JwtService,
                    useFactory: () => ({
                        sign: jest.fn(() => true),
                    }),
                },
                UserService,
                ConfigService,
                AuthService,
                MailService,
            ],
            imports: [
                AppModule,
                TypeOrmModule.forFeature([User, Emailver]),
                AuthModule,
                MailModule,
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        configService = module.get<ConfigService>(ConfigService);
        authService = module.get<AuthService>(AuthService);
        mailService = module.get<MailService>(MailService);
    });

    describe('signup a user', () => {
        it('service to sign up a user', async () => {
            const user = new SignUpDto();
            user.email = 'dwave101@yahoo.com';
            user.pin = '123456';
            user.firstName = 'dwave';
            user.lastName = 'dwave';
            user.phone = '08012345678';
            user.deviceId = '123456789';
            try {
                const authSpySignUpService = jest.spyOn(authService, 'signup');
                expect(authSpySignUpService).toBeCalledWith(user);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('login a user', () => {
        it('service to login a user', async () => {
            const loginDto = new LogInUserDto();
            loginDto.email = 'dwave101@yahoo.com';
            loginDto.pin = '123456';
            try {
                const authSpyLoginService = jest.spyOn(authService, 'login');
                expect(authSpyLoginService).toBeCalledWith(loginDto);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('update a user', () => {
        it('service to update a user', async () => {
            const id = '2f6e74db-cbe4-47a5-8530-77b77d331187';
            const user = new User();
            user.dob = '01/01/1990';
            user.pin = '00776611';
            try {
                const result = await service.updateUser(id, user);
                expect(result).toBeCalledWith(id, user);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('get a user', () => {
        it('service to get a user', async () => {
            const id = '2f6e74db-cbe4-47a5-8530-77b77d331187';
            try {
                const result = await service.findUserById(id);
                expect(result).toBeCalledWith(id);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('verify a user credentials', () => {
        it('service to verify a user credentials', async () => {
            const login = new LogInUserDto();
            login.phone = '+2348012345678';
            login.pin = '123456';
            try {
                const result = await service.findUser(login);
                expect(result).toBeCalledWith(login);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('request reset pin', () => {
        it('service to request reset pin', async () => {
            const email = 'dwave101@yahoo.com';
            // uuid token
            const token: string = uuidv4();
            const BASE_URL = configService.get<'string'>('API_BASE_URL');
            const resetPin: EmailOption = mailStructure(
                [email],
                'support@fusewallet.io',
                'Reset your Pin',
                configService.get('TEMPLATE_RESET_PIN'),
                {
                    firstName: `Eddie`,
                    subject: 'Reset Your Pin',
                    resetLink: `${BASE_URL}/user/reset-pin/${token}`,
                },
            );

            try {
                const result = await service.requestResetPin({ email });
                const emailSpyService = jest.spyOn(mailService, 'send');
                expect(result).toBeCalledWith(email);
                expect(emailSpyService).toHaveBeenCalledWith(resetPin);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('reset pin', () => {
        it('service to reset pin', async () => {
            const reset = new ResetPinDto();
            reset.token = uuidv4();
            reset.pin = '123456';
            reset.confirmPin = '123456';
            try {
                const result = await service.resetPin(reset);
                expect(result).toBeCalledWith(reset);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('update pin', () => {
        it('service to update pin', async () => {
            const id: string = uuidv4();
            const pinDto = new ChangePinDto();
            pinDto.oldPin = '123456';
            pinDto.newPin = '123457';
            pinDto.confirmPin = '123457';
            try {
                const result = await service.updatePin(pinDto, id);
                expect(result).toBeCalledWith(pinDto, id);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('request verify email', () => {
        it('service to request verify email', async () => {
            const verifyEmail = new RequestVerifyEmailDto();
            verifyEmail.email = 'dwave101@yahoo.com';
            verifyEmail.firstName = 'dwave';
            verifyEmail.lastName = 'Khan';
            const token: string = uuidv4();
            const BASE_URL = configService.get<'string'>('API_BASE_URL');

            const verify: EmailOption = mailStructure(
                [verifyEmail.email],
                'support@fusewallet.io',
                'Verify Your Account',
                configService.get('TEMPLATE_VERIFY_ACCOUNT'),
                {
                    firstName: `${verifyEmail.firstName}`,
                    subject: 'Verify Your Account',
                    verifyLink: `${BASE_URL}/user/verify/${token}/${verifyEmail.email}`,
                },
            );
            try {
                const result = await service.requestVerifyEmail(verifyEmail);
                const emailSpyService = jest.spyOn(mailService, 'send');
                expect(result).toBeCalledWith(verifyEmail);
                expect(emailSpyService).toHaveBeenCalledWith(verify);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('verify email', () => {
        it('service to verify email', async () => {
            const email = new VerifyEmailDto();
            email.email = 'dwave101@yahoo.com';
            email.token = uuidv4();
            try {
                const result = await service.verifyEmail(email);
                expect(result).toBeCalledWith(email);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('set transaction pin', () => {
        it('service to set a user transaction pin', async () => {
            const id = uuidv4();
            const trans = new TransactionPinDto();
            trans.newPin = '0043';
            trans.confirmPin = '0043';
            try {
                const result = await service.setTransactionPin(id, trans);
                expect(result).toBeCalledWith(id, trans);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('validate private key', () => {
        it('service to validate a user private key before they can reset their password', async () => {
            const id = uuidv4();
            const key = new PrivateKeyDto();
            key.privateKey =
                '07cf3e46d49c6406ac8d76f6bb22675d226ee00d4a354f7w3555446dc6ed4fd5';
            try {
                const result = await service.validatePrivateKey(id, key);
                expect(result).toBeCalledWith(id, key);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('reset transaction pin', () => {
        it('service to reset a user transaction pin', async () => {
            const id = uuidv4();
            const resetPin = new ResetTransactionPinDto();
            resetPin.transactionPin = '4400';
            resetPin.confirmPin = '4400';
            try {
                const result = await service.resetTransactionPin(id, resetPin);
                expect(result).toBeCalledWith(id, resetPin);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('add a new beneficiary', () => {
        it('service to add a new beneficiary', async () => {
            const id = uuidv4();
            const email = 'dwaave171@yahoo.com';
            const beneficiary = new BeneficiaryDto();
            beneficiary.email = email;
            try {
                const result = await service.addBeneficiary(id, beneficiary);
                expect(result).toBeCalledWith(id, beneficiary);
                expect(excludeFields).toHaveBeenCalledWith(User);
                expect(stringToArray).toHaveBeenCalled();
                expect(arrayToString).toHaveBeenCalled();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('get beneficiaries', () => {
        it('service to get the beneficiaries of a particular user', async () => {
            const id = uuidv4();
            try {
                const result = await service.viewAllUserBeneficiaries(id);
                expect(result).toBeCalledWith(id);
                expect(stringToArray).toHaveBeenCalled();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('delete beneficiary', () => {
        it('service to delete a user beneficiary', async () => {
            const id = uuidv4();
            const beneficiary = new BeneficiaryDto();
            beneficiary.email = 'eddybrock@hotmail.com';
            try {
                const result = await service.deleteBeneficiary(id, beneficiary);
                expect(result).toBeCalledWith(id, beneficiary);
                expect(stringToArray).toHaveBeenCalled();
                expect(arrayToString).toHaveBeenCalled();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('get a single beneficiary', () => {
        it('service to get a single beneficiary', async () => {
            const id = uuidv4();
            const beneficiary = new BeneficiaryDto();
            beneficiary.email = 'eddybrock@hotmail.com';
            try {
                const result = await service.checkBeneficiary(id, beneficiary);
                expect(result).toBeCalledWith(id, beneficiary);
                expect(stringToArray).toHaveBeenCalled();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
