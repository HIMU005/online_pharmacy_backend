import { PrismaService } from '@/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async createMyProfile(userId: string, createProfileDto: CreateProfileDto) {
    const existingProfile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });
    if (existingProfile) {
      throw new ConflictException('Profile already exists');
    }

    return this.prisma.profile.create({
      data: {
        userId,
        ...createProfileDto,
      },
    });
  }

  async updateMyProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return await this.prisma.profile.update({
      where: {
        userId,
      },
      data: updateProfileDto,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }
}
