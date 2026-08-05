import { CryptoModule } from '@/common/services/crypto/crypto.module';
import { OtpModule } from '@/common/services/otp/otp.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [OtpModule, PrismaModule, CryptoModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
