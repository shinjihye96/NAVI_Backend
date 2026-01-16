import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { DailyShare } from './daily-share.entity';

export enum ReactionType {
  HEART = 'heart',
  THUMBS_UP = 'thumbsUp',
  PRAY = 'pray',
  SAD = 'sad',
  CHEER = 'cheer',
}

@Entity('post_reactions')
@Unique(['dailyShareId', 'userId', 'reactionType'])
export class PostReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'daily_share_id' })
  dailyShareId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'reaction_type', type: 'varchar' })
  reactionType: ReactionType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => DailyShare, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_share_id' })
  dailyShare: DailyShare;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
