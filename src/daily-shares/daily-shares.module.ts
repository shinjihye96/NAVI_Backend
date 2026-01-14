import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySharesController } from './daily-shares.controller';
import { DailySharesService } from './daily-shares.service';
import { DailyShare } from '../entities/daily-share.entity';
import { DailyEmotion } from '../entities/daily-emotion.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyShare, DailyEmotion, User])],
  controllers: [DailySharesController],
  providers: [DailySharesService],
  exports: [DailySharesService],
})
export class DailySharesModule {}
