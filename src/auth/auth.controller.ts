import { VerifyOtpDto } from '@/common/services/otp/dto/verify-otp.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerAUser(@Body() registerdto: RegisterDto) {
    return this.authService.registerANewUser(registerdto);
  }

  @Post('verify-email')
  verifyEmail(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyEmail(verifyOtpDto);
  }

  @Post('login')
  loginaUser(@Body() logindto: LoginDto) {
    return this.authService.loginAUser(logindto);
  }
}
