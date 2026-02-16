import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: '알림 목록 조회',
    description:
      '로그인한 사용자의 알림 목록을 조회합니다. 카테고리별 필터링과 페이지네이션을 지원합니다.',
  })
  @SwaggerResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        success: true,
        data: {
          items: [
            {
              id: 'uuid',
              category: 'daily_share',
              type: 'daily_share_milestone',
              title: '하루공유 100개 달성',
              message:
                '포도님의 소중한 하루를 100번 공유했어요. 되돌아 보는 시간을 가져보세요!',
              isRead: false,
              referenceId: null,
              referenceType: null,
              createdAt: '2026-02-16T10:00:00.000Z',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            totalCount: 5,
            totalPages: 1,
          },
        },
      },
    },
  })
  async findAll(
    @Request() req: { user: { id: string } },
    @Query() queryDto: QueryNotificationDto,
  ) {
    const data = await this.notificationsService.findAll(
      req.user.id,
      queryDto,
    );
    return ApiResponse.success(data);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: '읽지 않은 알림 수 조회',
    description:
      '전체 및 카테고리별 읽지 않은 알림 수를 반환합니다. 알림 배지에 사용됩니다.',
  })
  @SwaggerResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        success: true,
        data: {
          total: 5,
          dailyShare: 2,
          community: 2,
          medicalSupport: 1,
        },
      },
    },
  })
  async getUnreadCount(@Request() req: { user: { id: string } }) {
    const data = await this.notificationsService.getUnreadCount(req.user.id);
    return ApiResponse.success(data);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '모든 알림 읽음 처리',
    description: '로그인한 사용자의 읽지 않은 모든 알림을 읽음 처리합니다.',
  })
  async markAllAsRead(@Request() req: { user: { id: string } }) {
    const data = await this.notificationsService.markAllAsRead(req.user.id);
    return ApiResponse.success(data);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '알림 읽음 처리',
    description: '특정 알림을 읽음 처리합니다.',
  })
  @ApiParam({ name: 'id', description: '알림 ID', example: 'uuid-string' })
  async markAsRead(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.notificationsService.markAsRead(req.user.id, id);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '알림 삭제',
    description: '특정 알림을 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '알림 ID', example: 'uuid-string' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.notificationsService.remove(req.user.id, id);
    return ApiResponse.success(data);
  }
}
