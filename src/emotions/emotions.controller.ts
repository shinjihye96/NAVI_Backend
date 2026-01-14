import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { EmotionsService } from './emotions.service';
import { CreateEmotionDto } from './dto/create-emotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Emotions')
@ApiBearerAuth()
@Controller('daily-shares/:dailyShareId/emotions')
@UseGuards(JwtAuthGuard)
export class EmotionsController {
  constructor(private readonly emotionsService: EmotionsService) {}

  @Post()
  @ApiOperation({ summary: '감정 추가', description: '하루공유에 감정을 추가합니다.' })
  @ApiParam({ name: 'dailyShareId', description: '하루공유 ID', example: 'uuid-string' })
  async create(
    @Param('dailyShareId') dailyShareId: string,
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateEmotionDto,
  ) {
    const data = await this.emotionsService.create(dailyShareId, req.user.id, createDto);
    return ApiResponse.success(data);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '감정 삭제', description: '하루공유에서 자신이 남긴 감정을 삭제합니다.' })
  @ApiParam({ name: 'dailyShareId', description: '하루공유 ID', example: 'uuid-string' })
  async remove(
    @Param('dailyShareId') dailyShareId: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.emotionsService.remove(dailyShareId, req.user.id);
    return ApiResponse.success(data);
  }
}
