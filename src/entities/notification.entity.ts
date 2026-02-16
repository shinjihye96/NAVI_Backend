import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationCategory {
  DAILY_SHARE = 'daily_share',
  COMMUNITY = 'community',
  MEDICAL_SUPPORT = 'medical_support',
}

export enum NotificationType {
  DAILY_SHARE_MILESTONE = 'daily_share_milestone',
  NEW_COMMENT = 'new_comment',
  NEW_FOLLOWER = 'new_follower',
  POPULAR_POST = 'popular_post',
  APPOINTMENT_REMINDER = 'appointment_reminder',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar' })
  category: NotificationCategory;

  @Column({ type: 'varchar' })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @Column({ name: 'reference_type', nullable: true })
  referenceType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
