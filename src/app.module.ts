import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { CryptoService } from './common/services/crypto/crypto.service';
import { CryptoModule } from './common/services/crypto/crypto.module';
import { EmailModule } from './common/services/email/email.module';
import { OtpService } from './common/services/otp/otp.service';
import { OtpModule } from './common/services/otp/otp.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CryptoModule,
    EmailModule,
    OtpModule,
    AuthModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, CryptoService, OtpService],
})
export class AppModule {}
