import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { DailyAnswer } from './daily-answer.entity';

@Entity('daily_questions')
export class DailyQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  content: string;

  @Column({ name: 'question_order', type: 'int' })
  questionOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => DailyAnswer, (answer) => answer.question)
  answers: DailyAnswer[];
}
