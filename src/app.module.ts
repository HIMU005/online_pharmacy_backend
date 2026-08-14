import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CryptoModule } from './common/services/crypto/crypto.module';
import { EmailModule } from './common/services/email/email.module';
import { OtpModule } from './common/services/otp/otp.module';
import { JwtTokenModule } from './jwt/jwt.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CryptoModule,
    EmailModule,
    OtpModule,
    AuthModule,
    JwtTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
