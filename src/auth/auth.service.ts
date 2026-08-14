import { VerifyOtpDto } from '@/common/services/otp/dto/verify-otp.dto';
import { OtpService } from '@/common/services/otp/otp.service';
import { JwtService } from '@/jwt/jwt.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountStatus, OTPType } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { CryptoService } from './../common/services/crypto/crypto.service';
import { authResponseDTO } from './dto/authResponse.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly otpService: OtpService,
    private readonly jwtTokenService: JwtService,
  ) {}

  // !  Register
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

  async verifyEmail(verifyOtpDto: VerifyOtpDto) {
    const { email } = verifyOtpDto;

    // * verify OTP
    await this.otpService.VerifyOtp(verifyOtpDto);

    await this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        accountStatus: AccountStatus.ACTIVE,
      },
    });
    /* //TODO ADD OPT DELETE AFTER USED
     */
    return {
      status: 'success',
      statusCode: 200,
      message: 'Email verified successfully',
    };
  }

  async loginAUser(logindto: LoginDto) {
    const { email, password } = logindto;
    // * Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.cryptoService.compare(
      password,
      user.passwordHashed,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // * JWT payload
    // ! generate access token
    const accessToken = await this.jwtTokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    //  ! generate refresh token
    const refreshToken = await this.jwtTokenService.generateRefreshToken({
      sub: user.id,
    });

    // ! hash the refresh token for store
    const refreshtokenHash = await this.cryptoService.hash(refreshToken);

    // * save the refresh token in db
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshtokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // * return the login response

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
    };
  }
}
