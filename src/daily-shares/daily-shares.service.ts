import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { DailyShare } from '../entities/daily-share.entity';
import { DailyEmotion } from '../entities/daily-emotion.entity';
import { User, UserType } from '../entities/user.entity';
import { CreateDailyShareDto } from './dto/create-daily-share.dto';
import { UpdateDailyShareDto } from './dto/update-daily-share.dto';
import { QueryDailyShareDto } from './dto/query-daily-share.dto';

@Injectable()
export class DailySharesService {
  constructor(
    @InjectRepository(DailyShare)
    private dailyShareRepository: Repository<DailyShare>,
    @InjectRepository(DailyEmotion)
    private dailyEmotionRepository: Repository<DailyEmotion>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userId: string, createDto: CreateDailyShareDto) {
    // Check if already written today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingShare = await this.dailyShareRepository.findOne({
      where: {
        userId,
        createdAt: Between(today, tomorrow),
      },
    });

    if (existingShare) {
      throw new BadRequestException('오늘은 이미 하루공유를 작성했습니다.');
    }

    const dailyShare = this.dailyShareRepository.create({
      ...createDto,
      userId,
    });

    await this.dailyShareRepository.save(dailyShare);

    return {
      id: dailyShare.id,
      mood: dailyShare.mood,
      content: dailyShare.content,
      imageUrl: dailyShare.imageUrl,
      isPrivate: dailyShare.isPrivate,
      createdAt: dailyShare.createdAt,
    };
  }

  async findAll(userId: string, queryDto: QueryDailyShareDto) {
    const { filter = 'all', date, page = 1, limit = 20 } = queryDto;

    const queryBuilder = this.dailyShareRepository
      .createQueryBuilder('dailyShare')
      .leftJoinAndSelect('dailyShare.user', 'user')
      .where('dailyShare.isPrivate = :isPrivate', { isPrivate: false });

    // Filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('dailyShare.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Filter by user type
    if (filter === 'caregiver') {
      queryBuilder.andWhere('user.userType = :type', {
        type: UserType.CAREGIVER,
      });
    } else if (filter === 'patient') {
      queryBuilder.andWhere('user.userType = :type', {
        type: UserType.PATIENT,
      });
    } else if (filter === 'recovered') {
      queryBuilder.andWhere('user.userType = :type', {
        type: UserType.RECOVERED,
      });
    }

    // count와 items 병렬 조회
    const [totalCount, items] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .orderBy('dailyShare.createdAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),
    ]);

    // 모든 게시물 ID 추출
    const shareIds = items.map((share) => share.id);

    // 감정 데이터와 내 감정 병렬 조회
    const [allEmotions, myEmotions] = shareIds.length > 0
      ? await Promise.all([
          this.dailyEmotionRepository
            .createQueryBuilder('emotion')
            .select('emotion.dailyShareId', 'dailyShareId')
            .addSelect('emotion.emotionType', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('emotion.dailyShareId IN (:...shareIds)', { shareIds })
            .groupBy('emotion.dailyShareId')
            .addGroupBy('emotion.emotionType')
            .getRawMany(),
          this.dailyEmotionRepository.find({
            where: { dailyShareId: In(shareIds), userId },
          }),
        ])
      : [[], []];

    // Map으로 변환하여 O(1) 조회
    const emotionsMap = new Map<string, { type: string; count: number }[]>();
    for (const emotion of allEmotions) {
      const key = emotion.dailyShareId;
      if (!emotionsMap.has(key)) {
        emotionsMap.set(key, []);
      }
      emotionsMap.get(key)!.push({ type: emotion.type, count: parseInt(emotion.count) });
    }

    const myEmotionMap = new Map<string, string>();
    for (const emotion of myEmotions) {
      myEmotionMap.set(emotion.dailyShareId, emotion.emotionType);
    }

    // 결과 조합
    const itemsWithEmotions = items.map((share) => ({
      id: share.id,
      user: {
        id: share.user.id,
        nickname: share.user.nickname,
        profileImage: share.user.profileImage,
        userType: share.user.userType,
        userStatus: share.user.userStatus,
      },
      mood: share.mood,
      content: share.content,
      imageUrl: share.imageUrl,
      emotions: emotionsMap.get(share.id) || [],
      myEmotion: myEmotionMap.get(share.id) || null,
      createdAt: share.createdAt,
    }));

    return {
      items: itemsWithEmotions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const dailyShare = await this.dailyShareRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!dailyShare) {
      throw new NotFoundException('하루공유를 찾을 수 없습니다.');
    }

    if (dailyShare.isPrivate && dailyShare.userId !== userId) {
      throw new ForbiddenException('비공개 게시물입니다.');
    }

    // Get emotions grouped by type
    const emotions = await this.dailyEmotionRepository
      .createQueryBuilder('emotion')
      .select('emotion.emotionType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('emotion.dailyShareId = :dailyShareId', { dailyShareId: id })
      .groupBy('emotion.emotionType')
      .getRawMany();

    const myEmotion = await this.dailyEmotionRepository.findOne({
      where: { dailyShareId: id, userId },
    });

    return {
      id: dailyShare.id,
      user: {
        id: dailyShare.user.id,
        nickname: dailyShare.user.nickname,
        profileImage: dailyShare.user.profileImage,
        userType: dailyShare.user.userType,
      },
      mood: dailyShare.mood,
      content: dailyShare.content,
      imageUrl: dailyShare.imageUrl,
      isPrivate: dailyShare.isPrivate,
      emotions: emotions.map((e) => ({ type: e.type, count: parseInt(e.count) })),
      myEmotion: myEmotion?.emotionType || null,
      createdAt: dailyShare.createdAt,
    };
  }

  async update(id: string, userId: string, updateDto: UpdateDailyShareDto) {
    const dailyShare = await this.dailyShareRepository.findOne({ where: { id } });

    if (!dailyShare) {
      throw new NotFoundException('하루공유를 찾을 수 없습니다.');
    }

    if (dailyShare.userId !== userId) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    Object.assign(dailyShare, updateDto);
    await this.dailyShareRepository.save(dailyShare);

    return {
      id: dailyShare.id,
      content: dailyShare.content,
      isPrivate: dailyShare.isPrivate,
      updatedAt: dailyShare.updatedAt,
    };
  }

  async remove(id: string, userId: string) {
    const dailyShare = await this.dailyShareRepository.findOne({ where: { id } });

    if (!dailyShare) {
      throw new NotFoundException('하루공유를 찾을 수 없습니다.');
    }

    if (dailyShare.userId !== userId) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    await this.dailyShareRepository.remove(dailyShare);

    return { message: '삭제되었습니다.' };
  }

  async checkToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayShare = await this.dailyShareRepository.findOne({
      where: {
        userId,
        createdAt: Between(today, tomorrow),
      },
    });

    return {
      hasWrittenToday: !!todayShare,
      todayShare: todayShare
        ? {
            id: todayShare.id,
            mood: todayShare.mood,
            createdAt: todayShare.createdAt,
          }
        : null,
    };
  }
}
