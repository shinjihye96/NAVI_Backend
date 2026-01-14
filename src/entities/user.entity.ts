import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Patient } from './patient.entity';
import { DailyShare } from './daily-share.entity';
import { Follow } from './follow.entity';

export enum UserType {
  PATIENT_CAREGIVER = 'patient_caregiver',
  RECOVERED_CAREGIVER = 'recovered_caregiver',
  PATIENT = 'patient',
  RECOVERED = 'recovered',
}

export enum UserStatus {
  FIGHTING = 'fighting',
  RECOVERED = 'recovered',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column()
  name: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  @Column({ name: 'profile_image', nullable: true })
  profileImage: string;

  @Column({ name: 'user_type', type: 'enum', enum: UserType })
  userType: UserType;

  @Column({ name: 'user_status', type: 'enum', enum: UserStatus })
  userStatus: UserStatus;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  hospital: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Patient, (patient) => patient.user)
  patient: Patient;

  @OneToMany(() => DailyShare, (dailyShare) => dailyShare.user)
  dailyShares: DailyShare[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];
}
