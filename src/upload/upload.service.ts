import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class UploadService {
  private supabase;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_KEY');

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 필요합니다.');
    }

    if (!this.supabase) {
      throw new BadRequestException('Supabase 설정이 필요합니다.');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const { data, error } = await this.supabase.storage
      .from('images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new BadRequestException('파일 업로드에 실패했습니다.');
    }

    const { data: urlData } = this.supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl };
  }
}
