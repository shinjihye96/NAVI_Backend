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
import { ApiTags } from '@nestjs/swagger';
import { EmotionsService } from './emotions.service';
import { CreateEmotionDto } from './dto/create-emotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Emotions')
@Controller('daily-shares/:dailyShareId/emotions')
@UseGuards(JwtAuthGuard)
export class EmotionsController {
  constructor(private readonly emotionsService: EmotionsService) {}

  @Post()
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
  async remove(
    @Param('dailyShareId') dailyShareId: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.emotionsService.remove(dailyShareId, req.user.id);
    return ApiResponse.success(data);
  }
}
