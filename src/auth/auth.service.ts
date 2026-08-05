import { OtpService } from '@/common/services/otp/otp.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { OTPType } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { CryptoService } from './../common/services/crypto/crypto.service';
import { authResponseDTO } from './dto/authResponse.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly otpService: OtpService,
  ) {}

  //   Register
  async registerANewUser(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // * first find that user with that used already exist or not
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    // * if exists then return crror
    if (existingUser) {
      throw new ConflictException({
        status: 'fail',
        statusCode: 409,
        errorCode: 'DUPLICATE_EMAIL',
        message:
          'User with that email already exists. Please log in or use a different email.',
      });
    }

    // * hash the password before save
    const passwordHashed = await this.cryptoService.hash(password);

    // * create User
    await this.prisma.user.create({
      data: {
        email,
        passwordHashed,
      },
    });

    // *Generate verification OTP

    await this.otpService.generateOtp({
      email,
      type: OTPType.VERIFICATION,
    });

    return plainToInstance(authResponseDTO, {
      status: 'success',
      statusCode: 201,
      message: 'User created successfully',
    });
  }
}
