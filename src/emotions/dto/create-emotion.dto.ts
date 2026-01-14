import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmotionType } from '../../entities/daily-emotion.entity';

export class CreateEmotionDto {
  @ApiProperty({ description: '감정 타입', enum: EmotionType, example: 'sunny' })
  @IsEnum(EmotionType)
  emotionType: EmotionType;
}
