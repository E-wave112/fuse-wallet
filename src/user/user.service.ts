import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { LogInUserDto } from './dto/login.dto';
import { ChangePinDto } from './dto/change-pin.dto';
import { User } from './entities/user.entity';
import { Emailver } from './entities/emailver.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
    UserNotFoundException,
    IncorrectCredentialsException,
    TokenExpiredException,
    TransactionPinNotSetException,
    AccountNotVerifiedException,
    BeneficiaryAlreadyAddedException,
    CannotAddSelfException,
    NoBeneficiariesException,
    BeneficiaryNotFoundException,
} from '../exceptions';
import {
    Compare,
    hashCred,
    excludeFields,
    stringToArray,
    arrayToString,
} from '../utils';
import { RequestVerifyEmailDto } from './dto/request-verify-email.dto';
import { EmailOption } from '../mail/types/mail.types';
import { mailStructure } from '../mail/interface-send/mail.send';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { ResetPinDto } from './dto/reset-pin.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestResetPinDto } from './dto/request-reset-pin.dto';
import { TransactionPinDto } from './dto/transaction-pin.dto';
import { PrivateKeyDto } from './dto/private-key.dto';
import { ResetTransactionPinDto } from './dto/reset-transaction-pin.dto';
import { ValidatePinDto } from './dto/validate-pin.dto';
import { BeneficiaryDto } from './dto/beneficiary.dto';
import { ChangeTransactionPinDto } from './dto/change-transaction-pin.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private UserRepository: Repository<User>,
        @InjectRepository(Emailver)
        private EmailverRepository: Repository<Emailver>,
        private readonly user: User,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) {}

    async findUser(login: LogInUserDto): Promise<User> {
        try {
            const singleUser = await this.UserRepository.find({
                where: [{ email: login.email }, { phone: login.phone }],
            });

            if (!singleUser.length) {
                throw new UserNotFoundException();
            }
            const comparePin = singleUser[0].pin;

            const validPassword = await Compare(login.pin, comparePin);

            if (!singleUser.length || !validPassword) {
                throw new IncorrectCredentialsException();
            }
            return singleUser[0];
        } catch (err) {
            throw new BadRequestException('incorrect credentials!');
        }
    }

    async findUserById(id: string) {
        try {
            const singleUser = await this.UserRepository.findOne(id);
            if (!singleUser) throw new UserNotFoundException();
            return singleUser;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async findUserByEmail(email: string) {
        try {
            const singleUser = await this.UserRepository.findOne({
                where: { email },
            });
            if (!singleUser) throw new UserNotFoundException();
            return singleUser;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async isVerifiedUser(id: string): Promise<void | User> {
        try {
            const singleUser = await this.findUserById(id);
            if (!singleUser.verified) {
                throw new AccountNotVerifiedException();
            }
            return singleUser;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateUser(id: string, user: Partial<User>) {
        try {
            const singleUser = await this.findUserById(id);
            if (user.pin || user.transactionPin) {
                throw new BadRequestException(
                    'try updating your tokens/pins in their specific endpoints',
                );
            }
            const updatedUser = await this.UserRepository.save({
                id: singleUser.id,
                ...user,
            });

            return { message: 'user updated successfully', updatedUser };
        } catch (err: any) {
            throw new BadRequestException(err.message);
        }
    }

    async requestVerifyEmail(data: RequestVerifyEmailDto) {
        const BASE_URL = this.configService.get<'string'>('API_BASE_URL');

        try {
            const checkEmail: Emailver = await this.EmailverRepository.findOne({
                email: data.email,
                valid: true,
            });
            const token = uuidv4().split('-').join('');
            const expiry = Date.now() + 1440 * 60 * 1000;
            // update the emailver row if the phone number already exists else create a new one
            const newEmailVer = checkEmail
                ? await this.EmailverRepository.save({
                      id: checkEmail.id,
                      verifyToken: token,
                      verifyTokenExpiry: expiry,
                      email: data.email,
                      valid: true,
                  })
                : await this.EmailverRepository.save({
                      email: data.email,
                      verifyToken: token,
                      verifyTokenExpiry: expiry,
                  });

            // TODO send mail
            const verifyEmail: EmailOption = mailStructure(
                [data.email],
                'support@fusewallet.io',
                'Verify Your Account',
                this.configService.get('TEMPLATE_VERIFY_ACCOUNT'),
                {
                    firstName: `${data.firstName}`,
                    subject: 'Verify Your Account',
                    verifyLink: `${BASE_URL}/user/verify/${token}/${data.email}`,
                },
            );

            await this.mailService.send(verifyEmail);
            return {
                statusCode: 200,
                message: 'Email verification link sent successfully!',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async verifyEmail(data: VerifyEmailDto) {
        try {
            const findEmailVerifyToken: Emailver =
                await this.EmailverRepository.findOne({
                    verifyToken: data.token,
                    valid: true,
                    email: data.email,
                });
            if (!findEmailVerifyToken) {
                return new BadRequestException('invalid token!');
            }
            if (
                findEmailVerifyToken.verifyTokenExpiry < Date.now() ||
                !findEmailVerifyToken.valid
            ) {
                findEmailVerifyToken.valid = false;
                await findEmailVerifyToken.save();
                return new BadRequestException(
                    'token expired!, please try verifying your email again',
                );
            }
            // delete this particular emailver row instance
            const user = await this.UserRepository.findOne({
                email: data.email,
                verified: false,
            });
            if (!user) {
                throw new UserNotFoundException(
                    'oops, seems this account has already been verified',
                );
            }
            user.verified = true;
            await user.save();
            await findEmailVerifyToken.remove();
            return {
                statusCode: 200,
                message: 'Email verified successfully!',
            };
        } catch (error) {
            throw new BadRequestException(
                'An error occurred!, it seems the link is invalid or this account has already been verified',
            );
        }
    }

    async updatePin(data: ChangePinDto, id: string) {
        try {
            const user = await this.findUserById(id);
            if (!(await Compare(data.oldPin, user.pin)))
                throw new IncorrectCredentialsException('incorrect pin!');

            if (data.newPin !== data.confirmPin)
                throw new IncorrectCredentialsException('Pin mismatch!');

            user.pin = hashCred(data.newPin);
            await user.save();
            return {
                statusCode: 200,
                message: 'pin updated successfully',
            };
        } catch (error) {
            throw new IncorrectCredentialsException(error.message);
        }
    }

    async resetPin(data: ResetPinDto) {
        try {
            const findUserToken: User = await this.UserRepository.findOne({
                resetToken: data.token,
            });
            if (!findUserToken || Date.now() > findUserToken.resetTokenExpiry)
                throw new TokenExpiredException(
                    'This token is invalid, please try resetting your password again',
                );
            if (data.pin !== data.confirmPin)
                throw new IncorrectCredentialsException('pin mismatch!');
            findUserToken.pin = hashCred(data.pin);
            findUserToken.resetToken = '';
            findUserToken.resetTokenExpiry = Date.now();
            await findUserToken.save();
            return {
                statusCode: 200,
                message: 'pin reset successful!',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async requestResetPin(data: RequestResetPinDto) {
        const BASE_URL = this.configService.get<'string'>('API_BASE_URL');
        try {
            const findUser: User = await this.findUserByEmail(data.email);
            if (!findUser) throw new UserNotFoundException();
            const token = uuidv4().split('-').join('');
            findUser.resetToken = token;
            findUser.resetTokenExpiry = Date.now() + 30 * 60 * 1000;
            await findUser.save();
            // TODO: send email
            const resetPin: EmailOption = mailStructure(
                [data.email],
                'support@fusewallet.io',
                'Reset your Pin',
                this.configService.get('TEMPLATE_RESET_PIN'),
                {
                    firstName: `${findUser.firstName}`,
                    subject: 'Reset Your Pin',
                    resetLink: `${BASE_URL}/user/reset-pin/${token}`,
                },
            );

            await this.mailService.send(resetPin);
            return {
                statusCode: 200,
                message: 'Reset pin link sent successfully!',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async setTransactionPin(id: string, data: TransactionPinDto) {
        try {
            const findUser: User = await this.findUserById(id);
            if (findUser.transactionPin) {
                throw new BadRequestException(
                    'oops, it seems you already have a transaction pin set up, if you want to change your pin, try updating it in the user settings',
                );
            }
            if (data.newPin !== data.confirmPin)
                throw new IncorrectCredentialsException(
                    'transaction pin mismatch!',
                );
            findUser.transactionPin = hashCred(data.newPin);
            await findUser.save();
            return {
                statusCode: 200,
                message: 'transaction pin set successfully !',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async validateTransactionPin(data: ValidatePinDto) {
        try {
            const findUser: User = await this.findUserById(data.userId);
            if (!findUser.transactionPin) {
                throw new TransactionPinNotSetException();
            }
            if (!(await Compare(data.pin, findUser.transactionPin))) {
                throw new IncorrectCredentialsException(
                    'incorrect transactionPin!',
                );
            }
            return {
                message: 'success!',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async validatePrivateKey(id: string, data: PrivateKeyDto) {
        try {
            const user = await this.findUserById(id);
            if (!(await Compare(data.privateKey, user.privateKey))) {
                throw new IncorrectCredentialsException('incorrect key!');
            }
            return {
                statusCode: 200,
                message:
                    'key validated successfully, now you can go ahead to reset your transaction pin!',
            };
        } catch (error) {
            throw new IncorrectCredentialsException('incorrect key!');
        }
    }

    async resetTransactionPin(id: string, data: ResetTransactionPinDto) {
        try {
            const findUser: User = await this.findUserById(id);
            if (data.transactionPin !== data.confirmPin)
                throw new IncorrectCredentialsException(
                    ' transaction pin mismatch!',
                );
            findUser.transactionPin = hashCred(data.transactionPin);
            await findUser.save();
            return {
                statusCode: 200,
                message: 'transaction pin reset successfully!',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateTransactionPin(data: ChangeTransactionPinDto, id: string) {
        try {
            const user = await this.findUserById(id);
            if (!(await Compare(data.oldPin, user.transactionPin)))
                throw new IncorrectCredentialsException(
                    'incorrect transaction pin!',
                );

            if (data.newPin !== data.confirmPin)
                throw new IncorrectCredentialsException('Pin mismatch!');

            user.transactionPin = hashCred(data.newPin);
            await user.save();
            return {
                statusCode: 200,
                message: 'transaction pin updated successfully',
            };
        } catch (error) {
            throw new IncorrectCredentialsException(error.message);
        }
    }

    async addBeneficiary(id: string, data: BeneficiaryDto) {
        try {
            const findUser: User = await this.findUserById(id);
            //check if beneficiary already exists
            let findBeneficiary = await this.findUserByEmail(data.email);
            if (findBeneficiary) {
                // check if beneficiary is the same user
                if (findBeneficiary.email === findUser.email) {
                    throw new CannotAddSelfException();
                }
                // check if beneficiary is already added
                const userBeneficiaries = findUser.beneficiaries;
                // convert the beneficiaries string to an array representation
                const userBeneficiariesArr = stringToArray(userBeneficiaries);
                // check if the beneficiary is already added
                const isBeneficiaryAdded = userBeneficiariesArr.find(
                    (beneficiary) => {
                        return beneficiary.email === findBeneficiary.email;
                    },
                );
                if (isBeneficiaryAdded) {
                    throw new BeneficiaryAlreadyAddedException();
                }
                // exclude certain fields the user should not see and add the beneficiary
                findBeneficiary = excludeFields(
                    [
                        'pin',
                        'transactionPin',
                        'privateKey',
                        'createdAt',
                        'updatedAt',
                        'resetToken',
                        'resetTokenExpiry',
                        'isAdmin',
                        'dob',
                        'beneficiaries',
                        'deviceId',
                        'deviceIp',
                        'deviceModel',
                        'verified',
                        'platform',
                        'lastLoggedIn',
                        'createdAt',
                        'updatedAt',
                        'id',
                    ],
                    findBeneficiary,
                );
                userBeneficiariesArr.push(findBeneficiary);
                // convert back to string before saving to db
                findUser.beneficiaries = arrayToString(userBeneficiariesArr);
                await findUser.save();
                return {
                    statusCode: 200,
                    message: 'beneficiary added successfully!',
                };
            } else {
                throw new UserNotFoundException();
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async viewAllUserBeneficiaries(id: string) {
        try {
            const findUser: User = await this.findUserById(id);
            const beneficiaries = stringToArray(findUser.beneficiaries);
            if (beneficiaries.length === 0) {
                throw new NoBeneficiariesException();
            }
            return {
                statusCode: 200,
                message: 'beneficiaries retrieved successfully!',
                beneficiaries,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async deleteBeneficiary(id: string, data: BeneficiaryDto) {
        try {
            const findUser: User = await this.findUserById(id);
            const beneficiaries = stringToArray(findUser.beneficiaries);
            const findBeneficiary = beneficiaries.find((beneficiary) => {
                return beneficiary.email === data.email;
            });
            if (!findBeneficiary) {
                throw new BeneficiaryNotFoundException();
            }
            // remove the beneficiary from the array
            beneficiaries.splice(beneficiaries.indexOf(findBeneficiary), 1);
            // convert back to string before saving to db
            findUser.beneficiaries = arrayToString(beneficiaries);
            await findUser.save();
            return {
                statusCode: 200,
                message: 'beneficiary deleted successfully!',
            };
        } catch (error) {
            throw new BeneficiaryNotFoundException(error.message);
        }
    }

    async checkBeneficiary(id: string, data: BeneficiaryDto) {
        try {
            const findUser: User = await this.findUserById(id);
            const beneficiaries = stringToArray(findUser.beneficiaries);
            const findBeneficiary = beneficiaries.find((beneficiary) => {
                return beneficiary.email === data.email;
            });
            if (!findBeneficiary) {
                throw new BeneficiaryNotFoundException();
            }
            return {
                statusCode: 200,
                message: 'beneficiary found successfully!',
                data: findBeneficiary,
            };
        } catch (error) {
            throw new BeneficiaryNotFoundException(error.message);
        }
    }
}
