import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { DailyShare } from '../entities/daily-share.entity';
import { Follow } from '../entities/follow.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(DailyShare)
    private dailyShareRepository: Repository<DailyShare>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const patient = await this.patientRepository.findOne({
      where: { userId },
      relations: ['cancerType'],
    });

    const [followersCount, followingCount, dailySharesCount] = await Promise.all([
      this.followRepository.count({ where: { followingId: userId } }),
      this.followRepository.count({ where: { followerId: userId } }),
      this.dailyShareRepository.count({ where: { userId } }),
    ]);

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      nickname: user.nickname,
      gender: user.gender,
      birthDate: user.birthDate,
      profileImage: user.profileImage,
      userType: user.userType,
      userStatus: user.userStatus,
      region: user.region,
      hospital: user.hospital,
      createdAt: user.createdAt,
      patient: patient
        ? {
            name: patient.name,
            gender: patient.gender,
            birthDate: patient.birthDate,
            cancerType: patient.cancerType?.name,
            cancerStage: patient.cancerStage,
            diagnosisDate: patient.diagnosisDate,
          }
        : null,
      stats: {
        followersCount,
        followingCount,
        dailySharesCount,
      },
    };
  }

  async updateMe(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (updateUserDto.nickname && updateUserDto.nickname !== user.nickname) {
      const existingNickname = await this.userRepository.findOne({
        where: { nickname: updateUserDto.nickname },
      });
      if (existingNickname) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    return {
      id: user.id,
      nickname: user.nickname,
      profileImage: user.profileImage,
      updatedAt: user.updatedAt,
    };
  }

  async getUserProfile(userId: string, currentUserId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const patient = await this.patientRepository.findOne({
      where: { userId },
      relations: ['cancerType'],
    });

    const [followersCount, followingCount, dailySharesCount, isFollowing] = await Promise.all([
      this.followRepository.count({ where: { followingId: userId } }),
      this.followRepository.count({ where: { followerId: userId } }),
      this.dailyShareRepository.count({ where: { userId } }),
      this.followRepository.findOne({
        where: { followerId: currentUserId, followingId: userId },
      }),
    ]);

    return {
      id: user.id,
      nickname: user.nickname,
      profileImage: user.profileImage,
      userType: user.userType,
      userStatus: user.userStatus,
      cancerType: patient?.cancerType?.name,
      diagnosisDate: patient?.diagnosisDate,
      stats: {
        followersCount,
        followingCount,
        dailySharesCount,
      },
      isFollowing: !!isFollowing,
    };
  }

  async checkNickname(nickname: string) {
    const existingUser = await this.userRepository.findOne({ where: { nickname } });
    return { available: !existingUser };
  }
}
