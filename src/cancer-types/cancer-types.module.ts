import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancerTypesController } from './cancer-types.controller';
import { CancerTypesService } from './cancer-types.service';
import { CancerType } from '../entities/cancer-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CancerType])],
  controllers: [CancerTypesController],
  providers: [CancerTypesService],
})
export class CancerTypesModule {}
