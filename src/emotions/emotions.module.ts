import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmotionsController } from './emotions.controller';
import { EmotionsService } from './emotions.service';
import { DailyEmotion } from '../entities/daily-emotion.entity';
import { DailyShare } from '../entities/daily-share.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyEmotion, DailyShare])],
  controllers: [EmotionsController],
  providers: [EmotionsService],
})
export class EmotionsModule {}
