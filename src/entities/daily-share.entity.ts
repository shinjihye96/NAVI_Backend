import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { DailyEmotion } from './daily-emotion.entity';

export enum Mood {
  VERY_GOOD = 'very_good',
  GOOD = 'good',
  NORMAL = 'normal',
  BAD = 'bad',
  VERY_BAD = 'very_bad',
}

@Entity('daily_shares')
export class DailyShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  mood: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'is_private', default: false })
  isPrivate: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.dailyShares)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => DailyEmotion, (emotion) => emotion.dailyShare)
  emotions: DailyEmotion[];
}
