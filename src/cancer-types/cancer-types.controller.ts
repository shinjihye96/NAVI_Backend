import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CancerTypesService } from './cancer-types.service';
import { ApiResponse } from '../common/dto/api-response.dto';

@ApiTags('Cancer Types')
@Controller('cancer-types')
export class CancerTypesController {
  constructor(private readonly cancerTypesService: CancerTypesService) {}

  @Get()
  @ApiOperation({ summary: '암 종류 목록 조회', description: '등록 가능한 암 종류 목록을 조회합니다.' })
  async findAll() {
    const data = await this.cancerTypesService.findAll();
    return ApiResponse.success(data);
  }
}
