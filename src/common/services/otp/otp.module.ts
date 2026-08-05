import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CryptoModule } from '../crypto/crypto.module';
import { EmailModule } from '../email/email.module';
import { OtpService } from './otp.service';

@Module({
  imports: [PrismaModule, CryptoModule, EmailModule],

  providers: [OtpService],

  exports: [OtpService],
})
export class OtpModule {}
