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
import { DailyQuestion } from './daily-question.entity';

export enum Weather {
  SUNNY = 'sunny',
  PARTLY_CLOUDY = 'partly_cloudy',
  CLOUDY = 'cloudy',
  RAINY = 'rainy',
  LIGHTNING = 'lightning',
}

@Entity('daily_answers')
@Unique(['userId', 'questionId', 'answeredDate'])
export class DailyAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'question_id', type: 'int' })
  questionId: number;

  @Column({ type: 'varchar', length: 500 })
  content: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', length: 20 })
  weather: Weather;

  @Column({ name: 'answered_date', type: 'date' })
  answeredDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DailyQuestion)
  @JoinColumn({ name: 'question_id' })
  question: DailyQuestion;
}
