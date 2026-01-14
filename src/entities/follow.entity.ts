import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'follower_id' })
  followerId: string;

  @Column({ name: 'following_id' })
  followingId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.following)
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @ManyToOne(() => User, (user) => user.followers)
  @JoinColumn({ name: 'following_id' })
  following: User;
}
