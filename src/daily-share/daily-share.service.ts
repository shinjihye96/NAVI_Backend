import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { DailyShare } from './daily-share.entity';
import { CreateDailyShareDto } from './dto/create-daily-share.dto';
import { UpdateDailyShareDto } from './dto/update-daily-share.dto';
import { getDailyGreeting } from './get-daily-greeting';
import { MoodType } from './mood-type.enum';
import { ShareStatus } from './share-status.enum';
import { DAILY_SHARE_MOCK } from '../mock/daily_share.mock';

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

  // 임시 데이터터
  async insertMockData() {
  const existing = await this.shareRepo.count();
  if (existing > 0) {
    console.log('⚠️ 이미 데이터가 존재하여 mock 데이터를 삽입하지 않습니다.');
    return;
  }

  // ① DeepPartial<DailyShare>[] 타입으로 DTO 배열 생성
  const dtos: DeepPartial<DailyShare>[] = DAILY_SHARE_MOCK.map(item => ({
    moodStep: item.moodStep,
    content: item.content,
    image: item.img,
    user: {
      id: 1,
      name: item.user.name,
      profileImage: item.user.profileImg,
      userType: item.user.userType  as '환자' | '보호자',
    },
    emojis: item.emojis,
    isFollowed: item.isFollowed,
  }));

  // ② 배열 오버로드를 타도록 한 번에 넘기기
  const entities = this.shareRepo.create(dtos);

  // ③ 저장
  await this.shareRepo.save(entities);
  console.log('✅ mock 데이터가 성공적으로 삽입되었습니다.');
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

  private getMoodAssets(moodStep: MoodType | null) {
    const baseUrl = 'http://localhost:3000/static';

     switch (moodStep) {
      case MoodType.SUN:
        return {
          backgroundImage: `${baseUrl}/backgrounds/Sun.jpg`,
          icon: `${baseUrl}/icons/Sun.jpg`,
        };
      case MoodType.SUN_AND_CLOUD:
        return {
          backgroundImage: `${baseUrl}/backgrounds/Sun_and_Cloud.jpg`,
          icon: `${baseUrl}/icons/Sun_and_Cloud.jpg`,
        };
      case MoodType.CLOUD:
        return {
          backgroundImage: `${baseUrl}/backgrounds/Cloud.jpg`,
          icon: `${baseUrl}/icons/Cloud.jpg`,
        };
      case MoodType.RAIN:
        return {
          backgroundImage: `${baseUrl}/backgrounds/Rain.jpg`,
          icon: `${baseUrl}/icons/Rain.jpg`,
        };
      case MoodType.STORM:
        return {
          backgroundImage: `${baseUrl}/backgrounds/Lightning.jpg`,
          icon: `${baseUrl}/icons/Lightning.jpg`,
        };
      default:
        // moodStep이 null이거나 알 수 없는 값일 때
        return {
          backgroundImage: `${baseUrl}/backgrounds/None.jpg`,
          icon: `${baseUrl}/icons/None.jpg`,
        };
    }
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
    const moodAssets = this.getMoodAssets(post.moodStep as MoodType | null);

    return { profile, post, message, status, moodAssets };
  }
}
