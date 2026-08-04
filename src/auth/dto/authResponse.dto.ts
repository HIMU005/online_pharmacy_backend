import { IsNumber, IsOptional, IsString } from 'class-validator';

export class authResponseDTO {
  @IsString()
  status!: 'success' | 'error' | 'fail';

  @IsNumber()
  statusCode!: number;

  @IsString()
  @IsOptional()
  errorCode?: string;

  @IsString()
  message!: string;
}
