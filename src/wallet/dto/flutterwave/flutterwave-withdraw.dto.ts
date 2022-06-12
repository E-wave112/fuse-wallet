import { IsString, IsNumber, IsNotEmpty, IsEmail } from 'class-validator';
export class FlutterwaveWithdrawDto {
  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  account_bank: string;

  @IsNotEmpty()
  @IsString()
  account_number: string;

  @IsNotEmpty()
  @IsString()
  tx_ref: string;
}
