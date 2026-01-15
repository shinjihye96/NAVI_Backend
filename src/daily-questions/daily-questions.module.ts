import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyQuestionsController } from './daily-questions.controller';
import { DailyQuestionsService } from './daily-questions.service';
import { DailyQuestion } from '../entities/daily-question.entity';
import { DailyAnswer } from '../entities/daily-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyQuestion, DailyAnswer])],
  controllers: [DailyQuestionsController],
  providers: [DailyQuestionsService],
})
export class DailyQuestionsModule {}
