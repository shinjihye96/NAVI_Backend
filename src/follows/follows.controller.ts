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
import { ApiTags } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Follows')
@Controller()
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('follows/:userId')
  async follow(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.followsService.follow(req.user.id, userId);
    return ApiResponse.success(data);
  }

  @Delete('follows/:userId')
  @HttpCode(HttpStatus.OK)
  async unfollow(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.followsService.unfollow(req.user.id, userId);
    return ApiResponse.success(data);
  }

  @Get('users/:userId/followers')
  async getFollowers(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.followsService.getFollowers(userId, req.user.id, paginationDto);
    return ApiResponse.success(data);
  }

  @Get('users/:userId/following')
  async getFollowing(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
    @Query() paginationDto: PaginationDto,
  ) {
    const data = await this.followsService.getFollowing(userId, req.user.id, paginationDto);
    return ApiResponse.success(data);
  }
}
