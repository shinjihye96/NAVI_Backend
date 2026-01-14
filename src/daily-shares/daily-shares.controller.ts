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
import { DailySharesService } from './daily-shares.service';
import { CreateDailyShareDto } from './dto/create-daily-share.dto';
import { UpdateDailyShareDto } from './dto/update-daily-share.dto';
import { QueryDailyShareDto } from './dto/query-daily-share.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from '../common/dto/api-response.dto';

@Controller('daily-shares')
@UseGuards(JwtAuthGuard)
export class DailySharesController {
  constructor(private readonly dailySharesService: DailySharesService) {}

  @Post()
  async create(
    @Request() req: { user: { id: string } },
    @Body() createDto: CreateDailyShareDto,
  ) {
    const data = await this.dailySharesService.create(req.user.id, createDto);
    return ApiResponse.success(data);
  }

  @Get()
  async findAll(
    @Request() req: { user: { id: string } },
    @Query() queryDto: QueryDailyShareDto,
  ) {
    const data = await this.dailySharesService.findAll(req.user.id, queryDto);
    return ApiResponse.success(data);
  }

  @Get('today/check')
  async checkToday(@Request() req: { user: { id: string } }) {
    const data = await this.dailySharesService.checkToday(req.user.id);
    return ApiResponse.success(data);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.dailySharesService.findOne(id, req.user.id);
    return ApiResponse.success(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateDailyShareDto,
  ) {
    const data = await this.dailySharesService.update(id, req.user.id, updateDto);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.dailySharesService.remove(id, req.user.id);
    return ApiResponse.success(data);
  }
}
