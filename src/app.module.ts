import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DailySharesModule } from './daily-shares/daily-shares.module';
import { EmotionsModule } from './emotions/emotions.module';
import { FollowsModule } from './follows/follows.module';
import { CancerTypesModule } from './cancer-types/cancer-types.module';
import { UploadModule } from './upload/upload.module';
import { DailyQuestionsModule } from './daily-questions/daily-questions.module';
import { ReactionsModule } from './reactions/reactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DailySharesModule,
    EmotionsModule,
    FollowsModule,
    CancerTypesModule,
    UploadModule,
    DailyQuestionsModule,
    ReactionsModule,
  ],
})
export class AppModule {}
