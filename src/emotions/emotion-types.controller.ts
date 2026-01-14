import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../common/dto/api-response.dto';
import { EmotionTypeEntity } from '../entities/emotion-type.entity';

@ApiTags('Emotions')
@Controller('emotion-types')
export class EmotionTypesController {
  constructor(
    @InjectRepository(EmotionTypeEntity)
    private emotionTypeRepository: Repository<EmotionTypeEntity>,
  ) {}

  @Get()
  async findAll() {
    const data = await this.emotionTypeRepository.find({
      order: { id: 'ASC' },
    });
    return ApiResponse.success(
      data.map(({ id, type, label, imageUrl }) => ({ id, type, label, imageUrl })),
    );
  }
}
