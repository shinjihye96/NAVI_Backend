import { IsInt, IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Weather } from '../../entities/daily-answer.entity';

export class CreateAnswerDto {
  @ApiProperty({ description: '질문 ID', example: 1 })
  @IsInt()
  questionId: number;

  @ApiPropertyOptional({ description: '답변 내용', example: '오늘 병원 검사 결과가 좋게 나왔어요!', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  content?: string;

  @ApiPropertyOptional({ description: '이미지 URL', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: '날씨',
    enum: Weather,
    example: 'sun',
  })
  @IsEnum(Weather)
  weather: Weather;
}
