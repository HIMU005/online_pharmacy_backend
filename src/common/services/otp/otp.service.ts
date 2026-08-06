import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { CryptoService } from '../crypto/crypto.service';
import { EmailService } from '../email/email.service';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly emailService: EmailService,
  ) {}

  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly RESEND_COOLDOWN_SECONDS = 60;

  /**
   * * Generate 6 digit OTP
   */
  private generateOtpSixDigit(): string {
    return randomInt(100000, 1000000).toString();
  }

  /**
   * * Generate and Send OTP
   */
  async generateOtp(generateOtpDto: GenerateOtpDto) {
    const { email, type } = generateOtpDto;

    // Check resend cooldown
    const recentOtp = await this.prisma.oTP.findFirst({
      where: {
        email,
        type,
        used: false,
        createdAt: {
          gt: new Date(Date.now() - this.RESEND_COOLDOWN_SECONDS * 1000),
        },
      },
    });

    if (recentOtp) {
      throw new ConflictException({
        status: 'fail',
        statusCode: 409,
        message: `Please wait ${this.RESEND_COOLDOWN_SECONDS} seconds before requesting another OTP.`,
      });
    }

    // * Generate Otp
    const otp = this.generateOtpSixDigit();

    // * hash OTP
    const hashedOtp = await this.cryptoService.hash(otp);

    //* Expiry
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // * Invalidate previous OTPs
    await this.prisma.oTP.updateMany({
      where: {
        email,
        type,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // * Save OTP
    await this.prisma.oTP.create({
      data: {
        email,
        code: hashedOtp,
        type,
        expiresAt,
      },
    });

    // Send email
    await this.emailService.sendOtpEmail(email, otp, this.OTP_EXPIRY_MINUTES);

    return {
      status: 'success',
      statusCode: 200,
      message: 'OTP sent successfully.',
      expiresIn: this.OTP_EXPIRY_MINUTES * 60,
    };
  }

  async VerifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
    status: string;
    statusCode: number;
    email: string;
    verified: boolean;
    message: string;
  }> {
    const { email, code } = verifyOtpDto;

    // find the latest valid OPT
    const otpRecord = await this.prisma.oTP.findFirst({
      where: {
        email,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new BadRequestException({
        status: 'fail',
        statusCode: 400,
        errorCode: 'OTP_NOT_FOUND',
        message: 'No valid OTP found. Please request a new one.',
      });
    }

    // *Compare plain OTP with hashed OTP
    const isValid = await this.cryptoService.compare(code, otpRecord.code);
    if (!isValid) {
      throw new BadRequestException({
        status: 'fail',
        statusCode: 400,
        errorCode: 'OTP_INVALID',
        message: 'Invalid OTP code.',
      });
    }

    // Mark OTP as used
    await this.prisma.oTP.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        used: true,
      },
    });

    return {
      status: 'success',
      statusCode: 200,
      message: 'OTP verified successfully.',
      email,
      verified: true,
    };
  }
}
