import { IsEnum, IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { Mood } from '../../entities/daily-share.entity';

export class CreateDailyShareDto {
  @IsEnum(Mood)
  mood: Mood;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
