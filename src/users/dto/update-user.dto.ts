import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '닉네임 (2-12자)', example: '새닉네임' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(12)
  nickname?: string;

  @ApiPropertyOptional({ description: '프로필 이미지 URL', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiPropertyOptional({ description: '지역', example: '서울' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: '병원', example: '서울대병원' })
  @IsOptional()
  @IsString()
  hospital?: string;
}
