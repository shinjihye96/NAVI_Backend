import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmotionsController } from './emotions.controller';
import { EmotionTypesController } from './emotion-types.controller';
import { EmotionsService } from './emotions.service';
import { DailyEmotion } from '../entities/daily-emotion.entity';
import { DailyShare } from '../entities/daily-share.entity';
import { EmotionTypeEntity } from '../entities/emotion-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyEmotion, DailyShare, EmotionTypeEntity])],
  controllers: [EmotionsController, EmotionTypesController],
  providers: [EmotionsService],
})
export class EmotionsModule {}
