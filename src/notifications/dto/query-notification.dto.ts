import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationCategory } from '../../entities/notification.entity';

export class QueryNotificationDto {
  @ApiPropertyOptional({
    description: '알림 카테고리 필터',
    enum: NotificationCategory,
    example: NotificationCategory.DAILY_SHARE,
  })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

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
