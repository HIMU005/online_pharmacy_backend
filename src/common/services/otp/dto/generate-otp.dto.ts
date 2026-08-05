import { OTPType } from '@prisma/client';
import { IsEmail, IsEnum } from 'class-validator';

export class GenerateOtpDto {
  @IsEmail()
  email!: string;

  @IsEnum(OTPType)
  type!: OTPType;
}
