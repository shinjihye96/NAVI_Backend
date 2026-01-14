import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CancerType } from '../entities/cancer-type.entity';

@Injectable()
export class CancerTypesService {
  constructor(
    @InjectRepository(CancerType)
    private cancerTypeRepository: Repository<CancerType>,
  ) {}

  async findAll() {
    const cancerTypes = await this.cancerTypeRepository.find({
      order: { id: 'ASC' },
    });

    return cancerTypes.map((type) => ({
      id: type.id,
      name: type.name,
    }));
  }
}
