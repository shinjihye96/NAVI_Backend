import { DataSource } from 'typeorm';

const SUPABASE_URL = 'https://iepvbzrhkfbcnjqqqqok.supabase.co';
const BUCKET_NAME = 'emotions';

const dataSource = new DataSource({
  type: 'postgres',
  url: 'postgresql://postgres.iepvbzrhkfbcnjqqqqok:RgSBFetmpIlwojzx@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

const updates = [
  { type: 'sun', filename: 'sun.png' },
  { type: 'sun_cloud', filename: 'sun_and_cloud.png' },
  { type: 'cloud', filename: 'cloud.png' },
  { type: 'rain', filename: 'rain.png' },
  { type: 'lightning', filename: 'lightning.png' },
];

async function updateUrls() {
  await dataSource.initialize();
  console.log('Connected to database\n');

  for (const { type, filename } of updates) {
    const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;

    const result = await dataSource.query(
      `UPDATE emotion_types SET image_url = $1 WHERE type = $2`,
      [imageUrl, type]
    );

    console.log(`✅ ${type} -> ${imageUrl}`);
  }

  console.log('\n--- Updated URLs ---');
  const rows = await dataSource.query('SELECT type, label, image_url FROM emotion_types ORDER BY id');
  console.table(rows);

  await dataSource.destroy();
}

updateUrls().catch(console.error);
