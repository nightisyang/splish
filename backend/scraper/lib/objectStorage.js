const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { HeadObjectCommand, PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const config = require('../config');
const { listCatalogAssets } = require('./imageHandler');

function storageConfig(environment = process.env) {
  return {
    endpoint: environment.R2_ENDPOINT,
    region: environment.R2_REGION || 'auto',
    bucket: environment.R2_BUCKET,
    accessKeyId: environment.R2_ACCESS_KEY_ID,
    secretAccessKey: environment.R2_SECRET_ACCESS_KEY,
    publicBaseUrl: environment.R2_PUBLIC_BASE_URL?.replace(/\/$/, '')
  };
}

function validateStorageConfig(value) {
  const missing = Object.entries({
    R2_ENDPOINT: value.endpoint,
    R2_BUCKET: value.bucket,
    R2_ACCESS_KEY_ID: value.accessKeyId,
    R2_SECRET_ACCESS_KEY: value.secretAccessKey,
    R2_PUBLIC_BASE_URL: value.publicBaseUrl
  }).filter(([, field]) => !field).map(([name]) => name);
  if (missing.length) throw new Error(`Missing object-storage settings: ${missing.join(', ')}`);
}

function contentType(filename) {
  const extension = path.extname(filename).toLowerCase();
  return ({
    '.gif': 'image/gif', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg',
    '.png': 'image/png', '.webp': 'image/webp'
  })[extension] || 'application/octet-stream';
}

function fileSha256(filepath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filepath);
    stream.on('error', reject);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

function buildUploadPlan(records) {
  return listCatalogAssets(records).map(asset => {
    const filepath = path.join(config.paths.images, asset.filename);
    const stat = fs.statSync(filepath);
    return {
      filename: asset.filename,
      filepath,
      key: `images/${asset.filename.split(path.sep).join('/')}`,
      size: stat.size
    };
  });
}

async function publishCatalogAssets(records, options = {}) {
  const settings = storageConfig();
  const plan = buildUploadPlan(records);
  const totalBytes = plan.reduce((sum, item) => sum + item.size, 0);
  if (!options.apply) return { dryRun: true, objects: plan.length, totalBytes };
  validateStorageConfig(settings);
  const client = new S3Client({
    endpoint: settings.endpoint,
    region: settings.region,
    credentials: {
      accessKeyId: settings.accessKeyId,
      secretAccessKey: settings.secretAccessKey
    }
  });
  const result = { dryRun: false, objects: plan.length, totalBytes, uploaded: 0, skipped: 0, failed: 0, failures: [] };
  let nextIndex = 0;
  let processed = 0;

  async function worker() {
    while (nextIndex < plan.length) {
      const item = plan[nextIndex++];
      try {
        const sha256 = await fileSha256(item.filepath);
        let current = null;
        if (!options.force) {
          try {
            current = await client.send(new HeadObjectCommand({ Bucket: settings.bucket, Key: item.key }));
          } catch (error) {
            if (error?.$metadata?.httpStatusCode !== 404 && error?.name !== 'NotFound') throw error;
          }
        }
        if (current?.Metadata?.sha256 === sha256 && current.ContentLength === item.size) {
          result.skipped++;
        } else {
          await client.send(new PutObjectCommand({
            Bucket: settings.bucket,
            Key: item.key,
            Body: fs.createReadStream(item.filepath),
            ContentLength: item.size,
            ContentType: contentType(item.filename),
            CacheControl: 'public, max-age=86400',
            Metadata: { sha256 }
          }));
          result.uploaded++;
        }
      } catch (error) {
        result.failed++;
        result.failures.push({ key: item.key, error: error.message });
      }
      processed++;
      if (options.verbose && processed % 100 === 0) {
        console.log(`Published ${processed}/${plan.length}: ${result.uploaded} uploaded, ${result.skipped} unchanged, ${result.failed} failed`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(options.concurrency || 4, 8)) }, () => worker()));
  result.publicBaseUrl = settings.publicBaseUrl;
  return result;
}

module.exports = { buildUploadPlan, contentType, publishCatalogAssets, storageConfig, validateStorageConfig };
