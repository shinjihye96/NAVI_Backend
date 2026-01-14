import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDailyShareDto {
  @ApiPropertyOptional({ description: '내용 (최대 100자)', example: '오늘 하루도 힘내자!' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  content?: string;

  @ApiPropertyOptional({ description: '비공개 여부', example: false })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
