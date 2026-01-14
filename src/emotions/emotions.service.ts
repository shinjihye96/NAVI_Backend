import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyEmotion } from '../entities/daily-emotion.entity';
import { DailyShare } from '../entities/daily-share.entity';
import { CreateEmotionDto } from './dto/create-emotion.dto';

@Injectable()
export class EmotionsService {
  constructor(
    @InjectRepository(DailyEmotion)
    private dailyEmotionRepository: Repository<DailyEmotion>,
    @InjectRepository(DailyShare)
    private dailyShareRepository: Repository<DailyShare>,
  ) {}

  async create(dailyShareId: string, userId: string, createDto: CreateEmotionDto) {
    const dailyShare = await this.dailyShareRepository.findOne({
      where: { id: dailyShareId },
    });

    if (!dailyShare) {
      throw new NotFoundException('하루공유를 찾을 수 없습니다.');
    }

    const existingEmotion = await this.dailyEmotionRepository.findOne({
      where: { dailyShareId, userId },
    });

    if (existingEmotion) {
      throw new ConflictException('이미 공감했습니다.');
    }

    const emotion = this.dailyEmotionRepository.create({
      dailyShareId,
      userId,
      emotionType: createDto.emotionType,
    });

    await this.dailyEmotionRepository.save(emotion);

    return {
      id: emotion.id,
      emotionType: emotion.emotionType,
      createdAt: emotion.createdAt,
    };
  }

  async remove(dailyShareId: string, userId: string) {
    const emotion = await this.dailyEmotionRepository.findOne({
      where: { dailyShareId, userId },
    });

    if (!emotion) {
      throw new NotFoundException('공감을 찾을 수 없습니다.');
    }

    await this.dailyEmotionRepository.remove(emotion);

    return { message: '공감이 취소되었습니다.' };
  }
}
