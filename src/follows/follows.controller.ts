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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
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
  async getFollowing(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.followsService.getFollowing(userId, req.user.id, paginationDto);
    return ApiResponse.success(data);
  }
}
