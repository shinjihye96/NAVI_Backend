import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDailyShareDto {
  @ApiPropertyOptional({ description: '필터 (all: 전체, caregiver: 보호자, patient: 소아환아, recovered: 완치자)', enum: ['all', 'caregiver', 'patient', 'recovered'], example: 'all' })
  @IsOptional()
  @IsString()
  filter?: 'all' | 'caregiver' | 'patient' | 'recovered';

  @ApiPropertyOptional({ description: '날짜 필터 (YYYY-MM-DD)', example: '2024-01-01' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ description: '페이지 번호', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지당 항목 수', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;
}
