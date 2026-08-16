import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RequestUser } from '@/auth/interfaces/request-user.interface';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

interface AuthRequest extends Request {
  user: RequestUser;
}

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('me')
  async createMyProfile(
    @Req() request: AuthRequest,
    @Body() createprofileDto: CreateProfileDto,
  ) {
    return this.profileService.createMyProfile(
      request.user.userId,
      createprofileDto,
    );
  }

  @Get('me')
  async getMyProfile(@Req() request: AuthRequest) {
    return this.profileService.getMyProfile(request.user.userId);
  }

  @Patch('me')
  async updateMyProfile(
    @Req() request: AuthRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateMyProfile(
      request.user.userId,
      updateProfileDto,
    );
  }
}
