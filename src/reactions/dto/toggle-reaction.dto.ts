import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '../../entities/post-reaction.entity';

export class ToggleReactionDto {
  @ApiProperty({
    description: '리액션 타입',
    enum: ReactionType,
    example: 'heart',
  })
  @IsEnum(ReactionType)
  reactionType: ReactionType;
}
