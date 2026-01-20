import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
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
  @ApiOperation({
    summary: '오늘의 질문 조회',
    description: '오늘 날짜 기준으로 활성화된 질문 중 1개를 반환합니다. expiresAt은 한국시간 자정 ISO 문자열입니다.'
  })
  @SwaggerResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          content: '오늘 가장 감사한 일은 무엇인가요?',
          hasAnswered: false,
          expiresAt: '2024-01-15T15:00:00.000Z'
        }
      }
    }
  })
  async getTodayQuestion(@Request() req: { user: { id: string } }) {
    const data = await this.dailyQuestionsService.getTodayQuestion(req.user.id);
    return ApiResponse.success(data);
  }

  @Post('answer')
  @ApiOperation({
    summary: '오늘의 질문 답변하기',
    description: '오늘의 질문에 답변합니다. 질문이 비활성화된 경우 QUESTION_INACTIVE 에러가 반환됩니다.'
  })
  @SwaggerResponse({
    status: 201,
    description: '성공',
    schema: {
      example: {
        success: true,
        data: {
          id: 1,
          questionId: 1,
          content: '오늘 가족과 함께한 시간이 감사했습니다.',
          imageUrl: 'https://example.com/image.jpg',
          weather: 'sunny',
          answeredDate: '2024-01-15',
          createdAt: '2024-01-15T06:30:00.000Z'
        }
      }
    }
  })
  @SwaggerResponse({
    status: 400,
    description: '질문이 비활성화됨',
    schema: {
      example: {
        success: false,
        error: {
          code: 'QUESTION_INACTIVE',
          message: '이 질문은 더 이상 활성 상태가 아닙니다. 새 질문을 확인해주세요.'
        }
      }
    }
  })
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
