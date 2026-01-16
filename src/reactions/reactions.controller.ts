import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReactionsService } from './reactions.service';
import { ToggleReactionDto } from './dto/toggle-reaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Reactions')
@ApiBearerAuth()
@Controller('daily-shares/:dailyShareId/reactions')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @ApiOperation({
    summary: '리액션 토글',
    description: '하루공유에 리액션을 추가하거나 제거합니다. 같은 리액션을 다시 보내면 제거됩니다.',
  })
  @ApiParam({
    name: 'dailyShareId',
    description: '하루공유 ID',
    example: 'uuid-string',
  })
  async toggle(
    @Param('dailyShareId') dailyShareId: string,
    @Request() req: { user: { id: string } },
    @Body() dto: ToggleReactionDto,
  ) {
    const data = await this.reactionsService.toggle(
      dailyShareId,
      req.user.id,
      dto,
    );
    return ApiResponse.success(data);
  }

  @Get('my')
  @ApiOperation({
    summary: '내 리액션 조회',
    description: '해당 하루공유에 내가 남긴 리액션 목록을 조회합니다.',
  })
  @ApiParam({
    name: 'dailyShareId',
    description: '하루공유 ID',
    example: 'uuid-string',
  })
  async getMyReactions(
    @Param('dailyShareId') dailyShareId: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.reactionsService.getMyReactions(
      dailyShareId,
      req.user.id,
    );
    return ApiResponse.success(data);
  }

  @Get('counts')
  @ApiOperation({
    summary: '리액션 카운트 조회',
    description: '해당 하루공유의 리액션 타입별 개수를 조회합니다.',
  })
  @ApiParam({
    name: 'dailyShareId',
    description: '하루공유 ID',
    example: 'uuid-string',
  })
  async getReactionCounts(@Param('dailyShareId') dailyShareId: string) {
    const data = await this.reactionsService.getReactionCounts(dailyShareId);
    return ApiResponse.success(data);
  }
}
