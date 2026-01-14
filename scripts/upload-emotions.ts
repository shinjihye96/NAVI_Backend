import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://iepvbzrhkfbcnjqqqqok.supabase.co';
const SUPABASE_KEY = 'sb_publishable_10cWwmZ80_vuHuFnxbg1gg_2uMkjXIm';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const IMAGES_DIR = '/Users/sinjihye/Downloads/weather';
const BUCKET_NAME = 'emotions';

// 파일명 -> DB type 매핑
const FILE_TO_TYPE: Record<string, string> = {
  'sun.png': 'sun',
  'sun_and_cloud.png': 'sun_cloud',
  'cloud.png': 'cloud',
  'rain.png': 'rain',
  'lightning.png': 'lightning',
};

async function uploadImages() {
  console.log('Starting upload...\n');

  for (const [filename, type] of Object.entries(FILE_TO_TYPE)) {
    const filePath = path.join(IMAGES_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filename}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `${type}.png`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.log(`❌ Upload failed for ${filename}: ${error.message}`);
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    console.log(`✅ ${filename} -> ${type}`);
    console.log(`   URL: ${urlData.publicUrl}\n`);
  }

  console.log('Upload complete!');
  console.log('\n--- SQL to update emotion_types table ---\n');

  // Generate SQL update statements
  for (const [_, type] of Object.entries(FILE_TO_TYPE)) {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${type}.png`;
    console.log(`UPDATE emotion_types SET image_url = '${publicUrl}' WHERE type = '${type}';`);
  }
}

uploadImages().catch(console.error);
