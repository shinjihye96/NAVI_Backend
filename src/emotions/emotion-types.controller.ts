import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
  @ApiOperation({ summary: '감정 타입 목록 조회', description: '사용 가능한 감정 타입 목록을 조회합니다.' })
  async findAll() {
    const data = await this.emotionTypeRepository.find({
      order: { id: 'ASC' },
    });
    return ApiResponse.success(
      data.map(({ id, type, label, imageUrl }) => ({ id, type, label, imageUrl })),
    );
  }
}
