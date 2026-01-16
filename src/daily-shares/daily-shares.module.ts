import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySharesController } from './daily-shares.controller';
import { DailySharesService } from './daily-shares.service';
import { DailyShare } from '../entities/daily-share.entity';
import { PostReaction } from '../entities/post-reaction.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyShare, PostReaction, User])],
  controllers: [DailySharesController],
  providers: [DailySharesService],
  exports: [DailySharesService],
})
export class DailySharesModule {}
