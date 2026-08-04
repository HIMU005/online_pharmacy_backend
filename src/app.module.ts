import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { CryptoService } from './common/services/crypto/crypto.service';
import { CryptoModule } from './common/services/crypto/crypto.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CryptoModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, CryptoService],
})
export class AppModule {}
