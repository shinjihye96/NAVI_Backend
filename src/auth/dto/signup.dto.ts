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
import { UserType, UserStatus, Gender } from '../../entities/user.entity';
import { CancerStage } from '../../entities/patient.entity';

export class PatientDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsNumber()
  cancerTypeId: number;

  @IsOptional()
  @IsEnum(CancerStage)
  cancerStage?: CancerStage;

  @IsDateString()
  diagnosisDate: string;

  @IsOptional()
  @IsDateString()
  recoveryDate?: string;
}

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  phone: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(12)
  nickname: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsEnum(UserType)
  userType: UserType;

  @IsEnum(UserStatus)
  userStatus: UserStatus;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  hospital?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PatientDto)
  patient?: PatientDto;
}
