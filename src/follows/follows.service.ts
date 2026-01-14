import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../entities/follow.entity';
import { User } from '../entities/user.entity';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('자신을 팔로우할 수 없습니다.');
    }

    const followingUser = await this.userRepository.findOne({
      where: { id: followingId },
    });

    if (!followingUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const existingFollow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      throw new ConflictException('이미 팔로우 중입니다.');
    }

    const follow = this.followRepository.create({
      followerId,
      followingId,
    });

    await this.followRepository.save(follow);

    return {
      id: follow.id,
      followingId: follow.followingId,
      createdAt: follow.createdAt,
    };
  }

  async unfollow(followerId: string, followingId: string) {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (!follow) {
      throw new NotFoundException('팔로우 관계를 찾을 수 없습니다.');
    }

    await this.followRepository.remove(follow);

    return { message: '언팔로우 되었습니다.' };
  }

  async getFollowers(userId: string, currentUserId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;

    const [follows, totalCount] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: ['follower'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const items = await Promise.all(
      follows.map(async (follow) => {
        const isFollowing = await this.followRepository.findOne({
          where: { followerId: currentUserId, followingId: follow.followerId },
        });

        return {
          id: follow.follower.id,
          nickname: follow.follower.nickname,
          profileImage: follow.follower.profileImage,
          userType: follow.follower.userType,
          isFollowing: !!isFollowing,
        };
      }),
    );

    return {
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getFollowing(userId: string, currentUserId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;

    const [follows, totalCount] = await this.followRepository.findAndCount({
      where: { followerId: userId },
      relations: ['following'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const items = await Promise.all(
      follows.map(async (follow) => {
        const isFollowing = await this.followRepository.findOne({
          where: { followerId: currentUserId, followingId: follow.followingId },
        });

        return {
          id: follow.following.id,
          nickname: follow.following.nickname,
          profileImage: follow.following.profileImage,
          userType: follow.following.userType,
          isFollowing: !!isFollowing,
        };
      }),
    );

    return {
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}
