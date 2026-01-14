import { IsEnum } from 'class-validator';
import { EmotionType } from '../../entities/daily-emotion.entity';

export class CreateEmotionDto {
  @IsEnum(EmotionType)
  emotionType: EmotionType;
}
