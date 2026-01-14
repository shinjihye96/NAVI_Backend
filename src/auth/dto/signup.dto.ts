import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType, UserStatus, Gender } from '../../entities/user.entity';
import { CancerStage } from '../../entities/patient.entity';

export class PatientDto {
  @ApiProperty({ description: '환자 이름', example: '홍길동' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '성별', enum: Gender, example: 'male' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: '생년월일', example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ description: '암 종류 ID', example: 1 })
  @IsNumber()
  cancerTypeId: number;

  @ApiPropertyOptional({ description: '암 병기', enum: CancerStage, example: 'stage1' })
  @IsOptional()
  @IsEnum(CancerStage)
  cancerStage?: CancerStage;

  @ApiProperty({ description: '진단일', example: '2024-01-01' })
  @IsDateString()
  diagnosisDate: string;

  @ApiPropertyOptional({ description: '완치일', example: '2024-06-01' })
  @IsOptional()
  @IsDateString()
  recoveryDate?: string;
}

export class SignupDto {
  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '비밀번호 (8자 이상)', example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: '전화번호', example: '010-1234-5678' })
  @IsString()
  phone: string;

  @ApiProperty({ description: '이름', example: '홍길동' })
  @IsString()
  name: string;

  @ApiProperty({ description: '닉네임 (2-12자)', example: '길동이' })
  @IsString()
  @MinLength(2)
  @MaxLength(12)
  nickname: string;

  @ApiPropertyOptional({ description: '성별', enum: Gender, example: 'male' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: '생년월일', example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ description: '사용자 유형', enum: UserType, example: 'patient' })
  @IsEnum(UserType)
  userType: UserType;

  @ApiProperty({ description: '사용자 상태', enum: UserStatus, example: 'in_treatment' })
  @IsEnum(UserStatus)
  userStatus: UserStatus;

  @ApiPropertyOptional({ description: '지역', example: '서울' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: '병원', example: '서울대병원' })
  @IsOptional()
  @IsString()
  hospital?: string;

  @ApiPropertyOptional({ description: '환자 정보 (보호자인 경우)', type: PatientDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PatientDto)
  patient?: PatientDto;
}
