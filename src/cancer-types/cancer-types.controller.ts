import { Controller, Get } from '@nestjs/common';
import { CancerTypesService } from './cancer-types.service';
import { ApiResponse } from '../common/dto/api-response.dto';

@Controller('cancer-types')
export class CancerTypesController {
  constructor(private readonly cancerTypesService: CancerTypesService) {}

  @Get()
  async findAll() {
    const data = await this.cancerTypesService.findAll();
    return ApiResponse.success(data);
  }
}
