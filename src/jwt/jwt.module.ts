import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from './jwt.service';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [JwtService, JwtStrategy],
  exports: [JwtService, JwtStrategy],
})
export class JwtTokenModule {}
