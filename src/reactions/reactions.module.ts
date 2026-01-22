import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionsController } from './reactions.controller';
import { EmotionTypesController } from './emotion-types.controller';
import { ReactionsService } from './reactions.service';
import { PostReaction } from '../entities/post-reaction.entity';
import { DailyShare } from '../entities/daily-share.entity';
import { EmotionTypeEntity } from '../entities/emotion-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostReaction, DailyShare, EmotionTypeEntity])],
  controllers: [ReactionsController, EmotionTypesController],
  providers: [ReactionsService],
  exports: [ReactionsService],
})
export class ReactionsModule {}
