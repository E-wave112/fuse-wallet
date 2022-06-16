import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LogInUserDto } from '../user/dto/login.dto';
import { SignUpDto } from '../user/dto/signup.dto';
import { hashCred } from '../utils';
import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { DataConflictException } from '../exceptions';
import { GenerateAddressWalletKey } from '../user/utils/cryptogen';
import { Wallet } from '../wallet/entities/wallet.entity';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        @InjectRepository(User) private UserRepository: Repository<User>,
    ) {}

    async login(obj: LogInUserDto) {
        try {
            const user = await this.userService.findUser(obj);

            const payload = { sub: user.id };
            obj.pin = hashCred(obj.pin);
            const newUser = await this.UserRepository.save({
                id: user.id,
                lastLoggedIn: new Date().toLocaleString(),
                ...obj,
            });
            return {
                access_token: this.jwtService.sign(payload),
                message: 'Login Successful',
                user,
            };
        } catch (err) {
            throw new BadRequestException(err.message);
        }
    }

    async signup(obj: SignUpDto) {
        try {
            const { email, phone } = obj;
            const user = await this.UserRepository.findOne({
                where: [{ email }, { phone }],
            });
            if (user)
                throw new DataConflictException('This user already exists!');
            const hashedPin = hashCred(obj.pin);
            obj.pin = hashedPin;

            const privateKey =
                GenerateAddressWalletKey.generateAddressAndKey().privateKey;

            const newUser = await this.UserRepository.save({
                ...obj,
                beneficiaries: '[]',
                privateKey: hashCred(privateKey),
            });

            // automatically create the user wallet
            const walletInstance = new Wallet();
            walletInstance.user = newUser;
            await walletInstance.save();
            return {
                message:
                    'user created successfully, please ensure your keep your private key somewhere safe and secure as there is no way to recover it once it is lost!',
                newUser,
                walletInstance,
                privateKey: privateKey,
            };
        } catch (err) {
            throw new DataConflictException(err.message);
        }
    }
}
