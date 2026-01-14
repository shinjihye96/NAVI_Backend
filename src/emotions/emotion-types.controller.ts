import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '../common/dto/api-response.dto';
import { EMOTION_DATA } from '../common/constants/emotion.constants';

@Controller('emotion-types')
export class EmotionTypesController {
  @Get()
  findAll() {
    const data = Object.entries(EMOTION_DATA).map(([key, value]) => ({
      type: key,
      label: value.label,
      image: value.image,
    }));
    return ApiResponse.success(data);
  }
}
