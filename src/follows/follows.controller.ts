import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Follows')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('follows/:userId')
  @ApiOperation({ summary: '팔로우', description: '특정 사용자를 팔로우합니다.' })
  @ApiParam({ name: 'userId', description: '팔로우할 사용자 ID', example: 'uuid-string' })
  async follow(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.followsService.follow(req.user.id, userId);
    return ApiResponse.success(data);
  }

  @Delete('follows/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '언팔로우', description: '특정 사용자를 언팔로우합니다.' })
  @ApiParam({ name: 'userId', description: '언팔로우할 사용자 ID', example: 'uuid-string' })
  async unfollow(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.followsService.unfollow(req.user.id, userId);
    return ApiResponse.success(data);
  }

  @Get('users/:userId/followers')
  @ApiOperation({ summary: '팔로워 목록 조회', description: '특정 사용자의 팔로워 목록을 조회합니다.' })
  @ApiParam({ name: 'userId', description: '사용자 ID', example: 'uuid-string' })
  @SwaggerResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        success: true,
        data: {
          items: [
            {
              id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              nickname: '힘내는환자',
              profileImage: 'https://example.com/profile1.jpg',
              userType: '환자',
              isFollowing: true,
            },
            {
              id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
              nickname: '응원하는보호자',
              profileImage: null,
              userType: '보호자',
              isFollowing: false,
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            totalCount: 2,
            totalPages: 1,
          },
        },
      },
    },
  })
  async getFollowers(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.followsService.getFollowers(userId, req.user.id, paginationDto);
    return ApiResponse.success(data);
  }

  @Get('users/:userId/following')
  @ApiOperation({ summary: '팔로잉 목록 조회', description: '특정 사용자가 팔로우하는 목록을 조회합니다.' })
  @ApiParam({ name: 'userId', description: '사용자 ID', example: 'uuid-string' })
  @SwaggerResponse({
    status: 200,
    description: '성공',
    schema: {
      example: {
        success: true,
        data: {
          items: [
            {
              id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
              nickname: '건강한환자',
              profileImage: 'https://example.com/profile2.jpg',
              userType: '환자',
              isFollowing: true,
            },
            {
              id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
              nickname: '희망의보호자',
              profileImage: 'https://example.com/profile3.jpg',
              userType: '보호자',
              isFollowing: true,
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            totalCount: 2,
            totalPages: 1,
          },
        },
      },
    },
  })
  async getFollowing(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.followsService.getFollowing(userId, req.user.id, paginationDto);
    return ApiResponse.success(data);
  }
}
