import { Storage } from '@google-cloud/storage';
const fetch = require('node-fetch');
const storage = new Storage({ keyFilename: './third-nature-412206-ffe52cd8ea28.json' });
const bucketName = 'third-nature-412206_cloudbuild';

export async function uploadFileToGCS(url: string, originalFilename: string) {
  const bucket = storage.bucket(bucketName);
  let filename = originalFilename;
  let fileExists = await checkFileExists(bucket, filename);

  // 如果文件已存在，增加唯一標識符
  let count = 1;
  while (fileExists) {
    const extensionIndex = originalFilename.lastIndexOf('.');
    const nameWithoutExtension = extensionIndex > 0 ? originalFilename.substring(0, extensionIndex) : originalFilename;
    const extension = extensionIndex > 0 ? originalFilename.substring(extensionIndex) : '';
    filename = `${nameWithoutExtension}_${count}${extension}`;
    fileExists = await checkFileExists(bucket, filename);
    count++;
  }

  const file = bucket.file(filename);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

  if (response.body) {
    const stream = file.createWriteStream();
    stream.on('error', e => console.error(`Failed to upload ${filename}:`, e));
    stream.on('finish', () => console.log(`Successfully uploaded ${filename}`));

    response.body.pipe(stream);
  } else {
    throw new Error(`Response body is null for URL: ${url}`);
  }
}

export async function checkFileExists(bucket: any, filename: string): Promise<boolean> {
  const [exists] = await bucket.file(filename).exists();
  return exists;
}