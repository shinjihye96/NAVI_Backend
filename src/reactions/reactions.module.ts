import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';
import { PostReaction } from '../entities/post-reaction.entity';
import { DailyShare } from '../entities/daily-share.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostReaction, DailyShare])],
  controllers: [ReactionsController],
  providers: [ReactionsService],
  exports: [ReactionsService],
})
export class ReactionsModule {}
