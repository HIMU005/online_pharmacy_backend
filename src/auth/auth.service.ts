import { CryptoService } from '@/common/services/crypto/crypto.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { authResponseDTO } from './dto/authResponse.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  //   Register
  async registerANewUser(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new ConflictException({
        status: 'fail',
        statusCode: 409,
        errorCode: 'DUPLICATE_EMAIL',
        message:
          'User with that email already exists. Please log in or use a different email.',
      });
    }

    const passwordHashed = this.cryptoService.encrypt(password);

    console.log(passwordHashed);
    // await this.prisma.user.create({
    //   data: {
    //     email,
    //     passwordHashed,
    //   },
    // });

    return plainToInstance(authResponseDTO, {
      status: 'success',
      statusCode: 201,
      message: 'User created successfully',
    });
  }
}
