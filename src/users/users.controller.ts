import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('check-nickname')
  @ApiOperation({ summary: '닉네임 중복 확인', description: '닉네임 사용 가능 여부를 확인합니다.' })
  @ApiQuery({ name: 'nickname', description: '확인할 닉네임', example: '길동이' })
  async checkNickname(@Query('nickname') nickname: string) {
    const data = await this.usersService.checkNickname(nickname);
    return ApiResponse.success(data);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 정보 조회', description: '현재 로그인한 사용자의 정보를 조회합니다.' })
  async getMe(@Request() req: { user: { id: string } }) {
    const data = await this.usersService.getMe(req.user.id);
    return ApiResponse.success(data);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 정보 수정', description: '현재 로그인한 사용자의 정보를 수정합니다.' })
  async updateMe(
    @Request() req: { user: { id: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.usersService.updateMe(req.user.id, updateUserDto);
    return ApiResponse.success(data);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 프로필 조회', description: '특정 사용자의 프로필을 조회합니다.' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async getUserProfile(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.usersService.getUserProfile(userId, req.user.id);
    return ApiResponse.success(data);
  }
}
