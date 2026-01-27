import { IsEnum, IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Mood } from '../../entities/daily-share.entity';

export class CreateDailyShareDto {
  @ApiProperty({ description: '오늘의 기분', enum: Mood, example: 'sun' })
  @IsEnum(Mood)
  mood: Mood;

  @ApiPropertyOptional({ description: '내용 (최대 100자)', example: '오늘 하루도 힘내자!' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  content?: string;

  @ApiPropertyOptional({ description: '이미지 URL', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: '비공개 여부', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
