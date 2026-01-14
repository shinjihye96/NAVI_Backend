import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../common/dto/api-response.dto';
import { EmotionTypeEntity } from '../entities/emotion-type.entity';

@Controller('emotion-types')
export class EmotionTypesController {
  constructor(
    @InjectRepository(EmotionTypeEntity)
    private emotionTypeRepository: Repository<EmotionTypeEntity>,
  ) {}

  @Get()
  async findAll() {
    const data = await this.emotionTypeRepository.find({
      select: ['type', 'label', 'imageUrl'],
      order: { id: 'ASC' },
    });
    return ApiResponse.success(data);
  }
}
