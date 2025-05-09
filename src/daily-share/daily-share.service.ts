import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyShare } from './daily-share.entity';
import { CreateDailyShareDto } from './dto/create-daily-share.dto';
import { UpdateDailyShareDto } from './dto/update-daily-share.dto';
import { getDailyGreeting } from './get-daily-greeting';
import { MoodType } from './mood-type.enum';
import { ShareStatus } from './share-status.enum';

@Injectable()
export class DailyShareService {
  constructor(
    @InjectRepository(DailyShare)
    private readonly shareRepo: Repository<DailyShare>,
  ) {}

  findAll(): Promise<DailyShare[]> {
    return this.shareRepo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: number): Promise<DailyShare | null> {
    return this.shareRepo.findOne({ where: { id } });
  }

  async create(data: CreateDailyShareDto): Promise<DailyShare> {
    const newShare = this.shareRepo.create({
      moodStep: data.moodStep,
      content: data.content,
      image: data.image,
      user: {
        id: 1,
        name: '지혜',
        profileImage: '',
        userType: '환자',
      },
      emojis: {
        heart: { icon: '💚', count: 0 },
        like: { icon: '👍', count: 0 },
        pray: { icon: '🙏', count: 0 },
        sad: { icon: '😢', count: 0 },
        celebrate: { icon: '🎉', count: 0 },
      },
      isFollowed: false,
    });

    return this.shareRepo.save(newShare);
  }

  async update(id: number, data: UpdateDailyShareDto): Promise<DailyShare | null> {
    const found = await this.shareRepo.findOne({ where: { id } });
    if (!found) return null;

    const updated = this.shareRepo.merge(found, data);
    return this.shareRepo.save(updated);
  }

  async remove(id: number): Promise<DailyShare | null> {
    const found = await this.shareRepo.findOne({ where: { id } });
    if (!found) return null;

    await this.shareRepo.remove(found);
    return found;
  }

  async findMyShare() {
    const USER_ID = 1; // 로그인된 유저 ID를 실제론 토큰에서 꺼냄
    // 1) 전체를 조회해, 내 것만 필터
    const all = await this.shareRepo.find({ order: { createdAt: 'DESC' } });
    const mine = all.filter((s) => s.user.id === USER_ID);

    // 2) 내 프로필
    const profile = mine.length
      ? {
          id: mine[0].user.id,
          name: mine[0].user.name,
          profileImage: mine[0].user.profileImage,
        }
      : { id: USER_ID, name: 'NAVI', profileImage: '' };

      const todayStr = new Date().toDateString();
      const todayPosts = mine
        .map(s => ({
          moodStep: s.moodStep,
          content: s.content ?? '',
          image: s.image ?? '',
          createdAt: s.createdAt?.toISOString() ?? '',
        }))
        .filter(p => new Date(p.createdAt).toDateString() === todayStr);
    
      // 상태 판정
      let status: ShareStatus = ShareStatus.NONE;
      if (todayPosts.length === 0) {
        status = ShareStatus.NONE;
      } else if (todayPosts[0].content === '') {
        status = ShareStatus.WEATHER_ONLY;
      } else {
        status = ShareStatus.COMPLETED;
      }

    // posts 배열을 status별로 구성
    let post: {
      moodStep: string;
      content: string;
      image: string;
      createdAt: string;
    };

    switch (status) {
      case ShareStatus.NONE:
        post = {
          moodStep: '',
          content: '',
          image: '',
          createdAt: '',
        };
        break;
  
      case ShareStatus.WEATHER_ONLY:
        post = {
          moodStep: todayPosts[0].moodStep!,
          content: '',
          image: '',
          createdAt: todayPosts[0].createdAt!,
        };
        break;
  
      case ShareStatus.COMPLETED:
        post = {
          moodStep: todayPosts[0].moodStep!,
          content: todayPosts[0].content!,
          image: todayPosts[0].image!,
          createdAt: todayPosts[0].createdAt!,
        };
        break;
    }

    // 4) 하루 인사 메시지
    const message = post.moodStep ? getDailyGreeting(post.moodStep as MoodType) : '';

    return { profile, post, message, status };
  }
}
