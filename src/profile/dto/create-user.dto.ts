import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @Length(2, 100)
  fullName!: string;

  @IsOptional()
  @IsUrl()
  @Length(1, 255)
  avatarURL?: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  nidNumber?: string;
}
