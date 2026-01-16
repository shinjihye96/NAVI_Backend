import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostReaction, ReactionType } from '../entities/post-reaction.entity';
import { DailyShare } from '../entities/daily-share.entity';
import { ToggleReactionDto } from './dto/toggle-reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(PostReaction)
    private postReactionRepository: Repository<PostReaction>,
    @InjectRepository(DailyShare)
    private dailyShareRepository: Repository<DailyShare>,
  ) {}

  async toggle(dailyShareId: string, userId: string, dto: ToggleReactionDto) {
    const dailyShare = await this.dailyShareRepository.findOne({
      where: { id: dailyShareId },
    });

    if (!dailyShare) {
      throw new NotFoundException('하루공유를 찾을 수 없습니다.');
    }

    const existingReaction = await this.postReactionRepository.findOne({
      where: {
        dailyShareId,
        userId,
        reactionType: dto.reactionType,
      },
    });

    if (existingReaction) {
      await this.postReactionRepository.remove(existingReaction);
      return {
        action: 'removed',
        reactionType: dto.reactionType,
      };
    }

    const reaction = this.postReactionRepository.create({
      dailyShareId,
      userId,
      reactionType: dto.reactionType,
    });

    await this.postReactionRepository.save(reaction);

    return {
      action: 'added',
      reactionType: dto.reactionType,
      id: reaction.id,
      createdAt: reaction.createdAt,
    };
  }

  async getMyReactions(dailyShareId: string, userId: string) {
    const reactions = await this.postReactionRepository.find({
      where: {
        dailyShareId,
        userId,
      },
    });

    return reactions.map((r) => r.reactionType);
  }

  async getReactionCounts(dailyShareId: string) {
    const counts = await this.postReactionRepository
      .createQueryBuilder('reaction')
      .select('reaction.reaction_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('reaction.daily_share_id = :dailyShareId', { dailyShareId })
      .groupBy('reaction.reaction_type')
      .getRawMany();

    return counts.map((c) => ({
      type: c.type,
      count: parseInt(c.count, 10),
    }));
  }

  async getReactionCountsForPosts(dailyShareIds: string[]) {
    if (dailyShareIds.length === 0) return new Map();

    const counts = await this.postReactionRepository
      .createQueryBuilder('reaction')
      .select('reaction.daily_share_id', 'dailyShareId')
      .addSelect('reaction.reaction_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('reaction.daily_share_id IN (:...dailyShareIds)', { dailyShareIds })
      .groupBy('reaction.daily_share_id')
      .addGroupBy('reaction.reaction_type')
      .getRawMany();

    const result = new Map<string, { type: string; count: number }[]>();

    for (const row of counts) {
      const existing = result.get(row.dailyShareId) || [];
      existing.push({
        type: row.type,
        count: parseInt(row.count, 10),
      });
      result.set(row.dailyShareId, existing);
    }

    return result;
  }

  async getMyReactionsForPosts(dailyShareIds: string[], userId: string) {
    if (dailyShareIds.length === 0) return new Map();

    const reactions = await this.postReactionRepository.find({
      where: dailyShareIds.map((id) => ({
        dailyShareId: id,
        userId,
      })),
    });

    const result = new Map<string, ReactionType[]>();

    for (const reaction of reactions) {
      const existing = result.get(reaction.dailyShareId) || [];
      existing.push(reaction.reactionType);
      result.set(reaction.dailyShareId, existing);
    }

    return result;
  }
}
