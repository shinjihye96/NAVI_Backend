import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User, Gender } from './user.entity';
import { CancerType } from './cancer-type.entity';

export enum CancerStage {
  STAGE_1 = 'stage_1',
  STAGE_2 = 'stage_2',
  STAGE_3 = 'stage_3',
  STAGE_4 = 'stage_4',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  @Column({ name: 'cancer_type_id' })
  cancerTypeId: number;

  @Column({ name: 'cancer_stage', nullable: true })
  cancerStage: string;

  @Column({ name: 'diagnosis_date', type: 'date' })
  diagnosisDate: Date;

  @Column({ name: 'recovery_date', type: 'date', nullable: true })
  recoveryDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.patient)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CancerType)
  @JoinColumn({ name: 'cancer_type_id' })
  cancerType: CancerType;
}
