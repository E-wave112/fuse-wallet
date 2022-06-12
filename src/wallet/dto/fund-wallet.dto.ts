import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class FundWalletDto {
  @IsNotEmpty()
  @IsString()
  cardExpiration: string;

  @IsNotEmpty()
  @IsString()
  card: string;

  @IsNotEmpty()
  @IsString()
  cardCvv: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  pin: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}
