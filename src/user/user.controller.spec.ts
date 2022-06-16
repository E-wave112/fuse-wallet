import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { Emailver } from './entities/emailver.entity';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from './dto/signup.dto';
import { LogInUserDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';
import { ResetPinDto } from './dto/reset-pin.dto';
import { ChangePinDto } from './dto/change-pin.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestVerifyEmailDto } from './dto/request-verify-email.dto';
import { RequestResetPinDto } from './dto/request-reset-pin.dto';
import { UserAuthGuard } from '../auth/guards';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { MailModule } from '../mail/mail.module';
import { MailService } from '@sendgrid/mail';
import { EmailOption } from '../mail/types/mail.types';
import { mailStructure } from '../mail/interface-send/mail.send';
import { TransactionPinDto } from './dto/transaction-pin.dto';
import { PrivateKeyDto } from './dto/private-key.dto';
import { ResetTransactionPinDto } from './dto/reset-transaction-pin.dto';
import { BeneficiaryDto } from './dto/beneficiary.dto';

jest.setTimeout(60000);

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;
    let configService: ConfigService;
    let authService: AuthService;
    let mailService: MailService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                AppModule,
                TypeOrmModule.forFeature([User, Emailver]),
                AuthModule,
                MailModule,
            ],
            controllers: [UserController],
            providers: [
                UserService,
                {
                    provide: JwtService,
                    useFactory: () => ({
                        sign: jest.fn(() => true),
                    }),
                },
                ConfigService,
                MailService,
                AuthService,
                User,
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get<UserService>(UserService);
        configService = module.get<ConfigService>(ConfigService);
        authService = module.get<AuthService>(AuthService);
        mailService = module.get<MailService>(MailService);
    });

    describe('POST /user/auth/register', () => {
        it('controller to sign up a user', async () => {
            const user = new SignUpDto();
            user.email = 'dwave101@yahoo.com';
            user.pin = '123456';
            user.firstName = 'dwave';
            user.lastName = 'dwave';
            user.phone = '08012345678';
            user.deviceId = '123456789';
            try {
                const authSpySignUpService = jest.spyOn(authService, 'signup');
                const controllerResult = await controller.register(user);
                expect(authSpySignUpService).toBeCalledWith(user);
                expect(controllerResult).toBeCalledWith(user);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('POST /user/auth/login', () => {
        it('controller to login a user', async () => {
            const login = new LogInUserDto();
            login.email = 'dwave101@yahoo.com';
            login.pin = '123456';
            try {
                const authSpyLoginService = jest.spyOn(authService, 'login');
                const controllerResult = await controller.login(login);
                expect(authSpyLoginService).toBeCalledWith(login);
                expect(controllerResult).toBeCalledWith(login);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('PUT /user/update/{id}', () => {
        it('controller to update a user', async () => {
            const guards = Reflect.getMetadata('__guards__', controller.update);
            const guard = new guards[0]();

            const id = '2f6e74db-cbe4-47a5-8530-77b77d331187';
            const user = new User();
            user.dob = '01/01/1990';
            user.pin = '00776611';
            try {
                const result = await service.updateUser(id, user);
                const controllerResult = await controller.update(id, user);
                expect(result).toBeCalledWith(id, user);
                expect(result).toBeCalledWith(id, user);
                expect(controllerResult).toBeCalledWith(id, user);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('GET /user/me', () => {
        it('controller to get a user', async () => {
            const guards = Reflect.getMetadata('__guards__', controller.view);
            const guard = new guards[0]();
            const id = '2f6e74db-cbe4-47a5-8530-77b77d331187';
            try {
                const result = await service.findUserById(id);
                const controllerResult = await controller.view({ userId: id });
                expect(result).toBeCalledWith(id);
                expect(controllerResult).toBeCalledWith(id);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('POST /user/request-reset-pin', () => {
        it('controller to request reset pin', async () => {
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
            const reqResetPin = new RequestResetPinDto();
            reqResetPin.email = email;

            try {
                const result = await service.requestResetPin(reqResetPin);
                const controllerResult = await controller.requestResetPin(
                    reqResetPin,
                );
                const emailSpyService = jest.spyOn(mailService, 'send');
                expect(result).toBeCalledWith(email);
                expect(controllerResult).toBeCalledWith(reqResetPin);
                expect(emailSpyService).toHaveBeenCalledWith(resetPin);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('POST }/user/reset-pin/{id}', () => {
        it('controller to reset pin', async () => {
            const id = uuidv4();
            const reset = new ResetPinDto();
            reset.token = uuidv4();
            reset.pin = '123456';
            reset.confirmPin = '123456';
            try {
                const result = await service.resetPin(reset);
                const controllerResult = await controller.resetPin(id, reset);
                expect(result).toBeCalledWith(reset);
                expect(controllerResult).toBeCalledWith(id, reset);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('PUT /user/change-pin', () => {
        it('controller to update pin', async () => {
            const id: string = uuidv4();
            const pinDto = new ChangePinDto();
            pinDto.oldPin = '123456';
            pinDto.newPin = '123457';
            pinDto.confirmPin = '123457';
            try {
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.updateUserPin,
                );
                const guard = new guards[0]();
                const result = await service.updatePin(pinDto, id);
                const controllerResult = await controller.updateUserPin(
                    pinDto,
                    id,
                );
                expect(result).toBeCalledWith(pinDto, id);
                expect(controllerResult).toBeCalledWith(pinDto, id);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('POST /user/send-verification-email', () => {
        it('controller to request verify email', async () => {
            const id = uuidv4();
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
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.sendVerificationEmail,
                );
                const guard = new guards[0]();
                const result = await service.requestVerifyEmail(verifyEmail);
                const emailSpyService = jest.spyOn(mailService, 'send');
                const controllerResult = await controller.sendVerificationEmail(
                    {
                        userId: id,
                    },
                );
                expect(result).toBeCalledWith(verifyEmail);
                expect(controllerResult).toHaveBeenCalledWith({ userId: id });
                expect(emailSpyService).toHaveBeenCalledWith(verify);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('POST /user/verify/{token}/{email}', () => {
        it('controller to verify email', async () => {
            const email = new VerifyEmailDto();
            email.email = 'dwave101@yahoo.com';
            email.token = uuidv4();
            try {
                const result = await service.verifyEmail(email);
                const controllerResult = await controller.verifyEmail(
                    email.token,
                    email.email,
                );
                expect(result).toBeCalledWith(email);
                expect(controllerResult).toHaveBeenCalledWith(
                    email.token,
                    email.email,
                );
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('PUT /user/set-transaction-pin', () => {
        it('controller to set a user transaction pin', async () => {
            const id = uuidv4();
            const trans = new TransactionPinDto();
            trans.newPin = '0043';
            trans.confirmPin = '0043';
            try {
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.setUserTransactionPin,
                );
                const guard = new guards[0]();
                const result = await service.setTransactionPin(id, trans);
                const controllerResult = await controller.setUserTransactionPin(
                    id,
                    trans,
                );
                expect(result).toBeCalledWith(id, trans);
                expect(controllerResult).toHaveBeenCalledWith(id, trans);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('POST /user/validate-private-key', () => {
        it('service to validate a user private key before they can reset their password', async () => {
            const id = uuidv4();
            const key = new PrivateKeyDto();
            key.privateKey =
                '07cf3e46d49c6406ac8d76f6bb22675d226ee00d4a354f7w3555446dc6ed4fd5';
            try {
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.validateUserPrivateKey,
                );
                const guard = new guards[0]();
                const result = await service.validatePrivateKey(id, key);
                const controllerResult =
                    await controller.validateUserPrivateKey(id, key);
                expect(result).toBeCalledWith(id, key);
                expect(controllerResult).toHaveBeenCalledWith(id, key);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('PUT /user/reset-transaction-pin', () => {
        it('controller to reset a user transaction pin', async () => {
            const id = uuidv4();
            const resetPin = new ResetTransactionPinDto();
            resetPin.transactionPin = '4400';
            resetPin.confirmPin = '4400';
            try {
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.resetUserTransactionPin,
                );
                const guard = new guards[0]();
                const result = await service.resetTransactionPin(id, resetPin);
                const controllerResult =
                    await controller.resetUserTransactionPin(id, resetPin);
                expect(result).toBeCalledWith(id, resetPin);
                expect(controllerResult).toHaveBeenCalledWith(id, resetPin);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('POST /user/beneficiary/new', () => {
        it('controller to add a new beneficiary', async () => {
            const id = uuidv4();
            const email = 'dwaave171@yahoo.com';
            const beneficiary = new BeneficiaryDto();
            beneficiary.email = email;
            try {
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.addNewBeneficiary,
                );
                const guard = new guards[0]();
                const result = await service.addBeneficiary(id, beneficiary);
                const controllerResult = await controller.addNewBeneficiary(
                    id,
                    beneficiary,
                );
                expect(result).toBeCalledWith(id, beneficiary);
                expect(controllerResult).toHaveBeenCalledWith(id, beneficiary);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('GET /user/beneficaries/me', () => {
        it('controller to get the beneficiaries of a particular user', async () => {
            const id = uuidv4();
            try {
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.getUserBeneficaries,
                );
                const guard = new guards[0]();
                const controllerResult = await controller.getUserBeneficaries(
                    id,
                );
                const result = await service.viewAllUserBeneficiaries(id);
                expect(result).toBeCalledWith(id);
                expect(controllerResult).toHaveBeenCalledWith(id);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('PUT /user/beneficiary/remove', () => {
        it('controller to delete a user beneficiary', async () => {
            const id = uuidv4();
            const beneficiary = new BeneficiaryDto();
            beneficiary.email = 'eddybrock@hotmail.com';
            try {
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.deleteUserBeneficiary,
                );
                const guard = new guards[0]();
                const controllerResult = await controller.deleteUserBeneficiary(
                    id,
                    beneficiary,
                );
                const result = await service.deleteBeneficiary(id, beneficiary);
                expect(result).toBeCalledWith(id, beneficiary);
                expect(controllerResult).toHaveBeenCalledWith(id, beneficiary);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe('GET /user/beneficiary/one', () => {
        it('controller to get a single beneficiary', async () => {
            const id = uuidv4();
            const beneficiary = new BeneficiaryDto();
            beneficiary.email = 'eddybrock@hotmail.com';
            try {
                const guards = Reflect.getMetadata(
                    '__guards__',
                    controller.getSingleBeneficiary,
                );
                const guard = new guards[0]();
                const controllerResult = await controller.getSingleBeneficiary(
                    id,
                    beneficiary,
                );
                const result = await service.checkBeneficiary(id, beneficiary);
                expect(result).toBeCalledWith(id, beneficiary);
                expect(controllerResult).toHaveBeenCalledWith(id, beneficiary);
                expect(guard).toBeInstanceOf(UserAuthGuard);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
