import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { DailyShare } from '../entities/daily-share.entity';
import { PostReaction } from '../entities/post-reaction.entity';
import { User, UserType } from '../entities/user.entity';
import { CreateDailyShareDto } from './dto/create-daily-share.dto';
import { UpdateDailyShareDto } from './dto/update-daily-share.dto';
import { QueryDailyShareDto } from './dto/query-daily-share.dto';
import { getKSTStartOfDay, getKSTEndOfDay } from '../common/utils/date.util';

@Injectable()
export class DailySharesService {
  constructor(
    @InjectRepository(DailyShare)
    private dailyShareRepository: Repository<DailyShare>,
    @InjectRepository(PostReaction)
    private postReactionRepository: Repository<PostReaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userId: string, createDto: CreateDailyShareDto) {
    // 한국 시간 기준 오늘 작성 여부 확인
    const todayStart = getKSTStartOfDay();
    const todayEnd = getKSTEndOfDay();

    const existingShare = await this.dailyShareRepository.findOne({
      where: {
        userId,
        createdAt: Between(todayStart, todayEnd),
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

    // Filter by date (한국 시간 기준)
    if (date) {
      const targetDate = new Date(date);
      const startDate = getKSTStartOfDay(targetDate);
      const endDate = getKSTEndOfDay(targetDate);
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

    // 리액션 데이터와 내 리액션 병렬 조회
    const [allReactions, myReactions] = shareIds.length > 0
      ? await Promise.all([
          this.postReactionRepository
            .createQueryBuilder('reaction')
            .select('reaction.daily_share_id', 'dailyShareId')
            .addSelect('reaction.reaction_type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('reaction.daily_share_id IN (:...shareIds)', { shareIds })
            .groupBy('reaction.daily_share_id')
            .addGroupBy('reaction.reaction_type')
            .getRawMany(),
          this.postReactionRepository.find({
            where: { dailyShareId: In(shareIds), userId },
          }),
        ])
      : [[], []];

    // Map으로 변환하여 O(1) 조회
    const reactionsMap = new Map<string, { type: string; count: number }[]>();
    for (const reaction of allReactions) {
      const key = reaction.dailyShareId;
      if (!reactionsMap.has(key)) {
        reactionsMap.set(key, []);
      }
      reactionsMap.get(key)!.push({ type: reaction.type, count: parseInt(reaction.count) });
    }

    const myReactionsMap = new Map<string, string[]>();
    for (const reaction of myReactions) {
      const key = reaction.dailyShareId;
      if (!myReactionsMap.has(key)) {
        myReactionsMap.set(key, []);
      }
      myReactionsMap.get(key)!.push(reaction.reactionType);
    }

    // 결과 조합
    const itemsWithReactions = items.map((share) => ({
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
      reactions: reactionsMap.get(share.id) || [],
      myReactions: myReactionsMap.get(share.id) || [],
      createdAt: share.createdAt,
    }));

    return {
      items: itemsWithReactions,
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

    // Get reactions grouped by type
    const reactions = await this.postReactionRepository
      .createQueryBuilder('reaction')
      .select('reaction.reaction_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('reaction.daily_share_id = :dailyShareId', { dailyShareId: id })
      .groupBy('reaction.reaction_type')
      .getRawMany();

    const myReactions = await this.postReactionRepository.find({
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
      reactions: reactions.map((e) => ({ type: e.type, count: parseInt(e.count) })),
      myReactions: myReactions.map((r) => r.reactionType),
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
    // 한국 시간 기준 오늘 작성 여부 확인
    const todayStart = getKSTStartOfDay();
    const todayEnd = getKSTEndOfDay();

    const todayShare = await this.dailyShareRepository.findOne({
      where: {
        userId,
        createdAt: Between(todayStart, todayEnd),
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
