import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReactionsService } from './reactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Emotion Types')
@ApiBearerAuth()
@Controller('emotion-types')
@UseGuards(JwtAuthGuard)
export class EmotionTypesController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Get()
  @ApiOperation({
    summary: '이모지 타입 목록 조회',
    description: '사용 가능한 이모지 타입 목록을 반환합니다.',
  })
  async getEmotionTypes() {
    const data = await this.reactionsService.getEmotionTypes();
    return ApiResponse.success(data);
  }
}
