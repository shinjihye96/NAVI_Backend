import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DailySharesService } from './daily-shares.service';
import { CreateDailyShareDto } from './dto/create-daily-share.dto';
import { UpdateDailyShareDto } from './dto/update-daily-share.dto';
import { QueryDailyShareDto } from './dto/query-daily-share.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Daily Shares')
@ApiBearerAuth()
@Controller('daily-shares')
@UseGuards(JwtAuthGuard)
export class DailySharesController {
  constructor(private readonly dailySharesService: DailySharesService) {}

  @Post()
  @ApiOperation({ summary: '하루공유 작성', description: '새로운 하루공유를 작성합니다.' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateDailyShareDto,
  ) {
    const data = await this.dailySharesService.create(req.user.id, createDto);
    return ApiResponse.success(data);
  }

  @Get()
  @ApiOperation({ summary: '하루공유 목록 조회', description: '하루공유 목록을 조회합니다. 필터링 및 페이지네이션을 지원합니다.' })
  async findAll(
    @Request() req: { user: { id: string } },
    @Query() queryDto: QueryDailyShareDto,
  ) {
    const data = await this.dailySharesService.findAll(req.user.id, queryDto);
    return ApiResponse.success(data);
  }

  @Get('today/check')
  @ApiOperation({ summary: '오늘 작성 여부 확인', description: '오늘 하루공유를 작성했는지 확인합니다.' })
  async checkToday(@Request() req: { user: { id: string } }) {
    const data = await this.dailySharesService.checkToday(req.user.id);
    return ApiResponse.success(data);
  }

  @Get(':id')
  @ApiOperation({ summary: '하루공유 상세 조회', description: '특정 하루공유의 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'id', description: '하루공유 ID', example: 'uuid-string' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.dailySharesService.findOne(id, req.user.id);
    return ApiResponse.success(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: '하루공유 수정', description: '자신이 작성한 하루공유를 수정합니다.' })
  @ApiParam({ name: 'id', description: '하루공유 ID', example: 'uuid-string' })
  async update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateDailyShareDto,
  ) {
    const data = await this.dailySharesService.update(id, req.user.id, updateDto);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '하루공유 삭제', description: '자신이 작성한 하루공유를 삭제합니다.' })
  @ApiParam({ name: 'id', description: '하루공유 ID', example: 'uuid-string' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.dailySharesService.remove(id, req.user.id);
    return ApiResponse.success(data);
  }
}
