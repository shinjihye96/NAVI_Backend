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
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('check-nickname')
  async checkNickname(@Query('nickname') nickname: string) {
    const data = await this.usersService.checkNickname(nickname);
    return ApiResponse.success(data);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: { user: { id: string } }) {
    const data = await this.usersService.getMe(req.user.id);
    return ApiResponse.success(data);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Request() req: { user: { id: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.usersService.updateMe(req.user.id, updateUserDto);
    return ApiResponse.success(data);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.usersService.getUserProfile(userId, req.user.id);
    return ApiResponse.success(data);
  }
}
