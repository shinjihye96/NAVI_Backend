import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateDailyShareDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  content?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
