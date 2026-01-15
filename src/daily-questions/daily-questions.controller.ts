import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DailyQuestionsService } from './daily-questions.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { QueryAnswerDto, QueryFeedDto } from './dto/query-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Daily Questions')
@ApiBearerAuth()
@Controller('daily-questions')
@UseGuards(JwtAuthGuard)
export class DailyQuestionsController {
  constructor(private readonly dailyQuestionsService: DailyQuestionsService) {}

  @Get('today')
  @ApiOperation({ summary: '오늘의 질문 조회', description: '오늘 날짜 기준으로 질문 1개를 반환합니다.' })
  async getTodayQuestion(@Request() req: { user: { id: string } }) {
    const data = await this.dailyQuestionsService.getTodayQuestion(req.user.id);
    return ApiResponse.success(data);
  }

  @Post('answer')
  @ApiOperation({ summary: '오늘의 질문 답변하기', description: '오늘의 질문에 답변합니다.' })
  async createAnswer(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateAnswerDto,
  ) {
    const data = await this.dailyQuestionsService.createAnswer(req.user.id, createDto);
    return ApiResponse.success(data);
  }

  @Get('my-answers')
  @ApiOperation({ summary: '내 답변 히스토리 조회', description: '내가 작성한 답변 목록을 조회합니다.' })
  async getMyAnswers(
    @Request() req: { user: { id: string } },
    @Query() queryDto: QueryAnswerDto,
  ) {
    const data = await this.dailyQuestionsService.getMyAnswers(req.user.id, queryDto);
    return ApiResponse.success(data);
  }

  @Get('feed')
  @ApiOperation({ summary: '오늘의 답변 피드 조회', description: '다른 사용자들의 답변 목록을 조회합니다.' })
  async getFeed(
    @Request() req: { user: { id: string } },
    @Query() queryDto: QueryFeedDto,
  ) {
    const data = await this.dailyQuestionsService.getFeed(req.user.id, queryDto);
    return ApiResponse.success(data);
  }
}
