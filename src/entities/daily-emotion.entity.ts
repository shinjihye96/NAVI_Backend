import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { DailyShare } from './daily-share.entity';

export enum EmotionType {
  CELEBRATE = 'celebrate',
  PRAY = 'pray',
  CHEER = 'cheer',
  SAD = 'sad',
  HAPPY = 'happy',
  HEART = 'heart',
}

@Entity('daily_emotions')
export class DailyEmotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'daily_share_id' })
  dailyShareId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'emotion_type' })
  emotionType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => DailyShare, (dailyShare) => dailyShare.emotions)
  @JoinColumn({ name: 'daily_share_id' })
  dailyShare: DailyShare;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
