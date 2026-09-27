import { Injectable, Logger, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly config: ConfigService) {
    this.region = this.config.getOrThrow<string>('AWS_REGION');
    const accessKeyId = this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY');
    this.bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');

    this.client = new S3Client({
      region: this.region,
      credentials: { accessKeyId, secretAccessKey },
      // Automatically follow region redirects if the bucket is in a
      // different region than configured — prevents PermanentRedirect errors
      followRegionRedirects: true,
    });
  }

  /**
   * Validate bucket access on startup so misconfigurations surface immediately
   * instead of failing silently on the first upload attempt.
   */
  async onModuleInit() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 bucket "${this.bucket}" is accessible (region: ${this.region})`);
    } catch (err: any) {
      const status = err?.$metadata?.httpStatusCode;
      if (status === 301) {
        this.logger.warn(
          `S3 bucket "${this.bucket}" is in a different region than "${this.region}". ` +
          `Update AWS_REGION in your .env to match the bucket's region. ` +
          `Requests will be auto-redirected but this adds latency.`,
        );
      } else if (status === 403) {
        this.logger.warn(
          `S3 bucket "${this.bucket}" returned 403 Forbidden. ` +
          `Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.`,
        );
      } else if (status === 404) {
        this.logger.error(
          `S3 bucket "${this.bucket}" does not exist. ` +
          `Check your AWS_S3_BUCKET setting.`,
        );
      } else {
        this.logger.warn(`Could not verify S3 bucket "${this.bucket}": ${err.message}`);
      }
    }
  }

  /**
   * Upload a file buffer / stream to S3 and return its public URL.
   */
  async uploadFile(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<string> {
    const ext = extname(file.originalname).toLowerCase();
    const key = `${folder}/${randomUUID()}${ext}`;

    try {
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: Readable.from(file.buffer),
          ContentType: file.mimetype,
          ContentDisposition: 'inline',
          CacheControl: 'public, max-age=31536000, immutable',
          ACL: 'public-read',
        },
      });

      await upload.done();
    } catch (err: any) {
      this.logger.error('S3 upload failed', err);
      throw new InternalServerErrorException(this.classifyS3Error(err, 'upload'));
    }

    // Return the public object URL (region-specific endpoint)
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Delete an object from S3 by its full URL or key.
   */
  async deleteFile(urlOrKey: string): Promise<void> {
    const key = this.extractKeyFromUrl(urlOrKey);

    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      this.logger.log(`Deleted S3 object: ${key}`);
    } catch (err: any) {
      this.logger.error('S3 delete failed', err);
      throw new InternalServerErrorException(this.classifyS3Error(err, 'delete'));
    }
  }

  /**
   * Extract the S3 object key from a full URL or return as-is if already a key.
   */
  private extractKeyFromUrl(urlOrKey: string): string {
    if (!urlOrKey.startsWith('http')) {
      return urlOrKey;
    }

    try {
      const url = new URL(urlOrKey);
      // Handles both virtual-hosted style (bucket.s3.region.amazonaws.com/key)
      // and path style (s3.region.amazonaws.com/bucket/key)
      if (url.hostname.startsWith(`${this.bucket}.`)) {
        return decodeURIComponent(url.pathname.slice(1)); // remove leading /
      }
      // Path-style: /bucket/key
      const pathParts = url.pathname.split('/');
      if (pathParts[1] === this.bucket) {
        return decodeURIComponent(pathParts.slice(2).join('/'));
      }
    } catch {
      // Fall through to simple split
    }

    // Fallback: split on amazonaws.com/
    const parts = urlOrKey.split('.amazonaws.com/');
    return parts.length > 1 ? parts[1] : urlOrKey;
  }

  /**
   * Translate an S3/AWS error into a user-friendly message.
   */
  private classifyS3Error(err: any, operation: 'upload' | 'delete'): string {
    const statusCode = err?.$metadata?.httpStatusCode;
    const code = err?.Code ?? err?.name;

    // Region mismatch — the exact error the user hit
    if (code === 'PermanentRedirect' || statusCode === 301) {
      const endpoint = err?.Endpoint ?? '';
      return (
        `The S3 bucket is in a different region than configured. ` +
        `Please update AWS_REGION in your environment to match the bucket's region` +
        (endpoint ? ` (endpoint: ${endpoint}).` : '.')
      );
    }

    if (code === 'AccessDenied' || statusCode === 403) {
      return `Storage access denied. The server does not have permission to ${operation} files. Please contact the administrator.`;
    }

    if (code === 'NoSuchBucket') {
      return 'Storage bucket not found. The server is misconfigured. Please contact the administrator.';
    }

    if (code === 'NoSuchKey' && operation === 'delete') {
      return 'The file was already deleted or does not exist.';
    }

    if (code === 'TimeoutError' || err?.code === 'RequestTimeout') {
      return `The ${operation} timed out. The file may be too large or the connection is slow. Please try again.`;
    }

    if (err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED' || err?.code === 'ECONNRESET') {
      return 'Could not reach the storage service. Please check your internet connection and try again.';
    }

    if (code === 'EntityTooLarge' || statusCode === 413) {
      return 'The file exceeds the maximum size allowed by the storage service.';
    }

    if (code === 'SlowDown') {
      return 'The storage service is rate-limiting requests. Please wait a moment and try again.';
    }

    if (err?.message) {
      return `${operation === 'upload' ? 'Upload' : 'Delete'} failed: ${err.message}`;
    }

    return `An unexpected error occurred while ${operation === 'upload' ? 'uploading' : 'deleting'} the file.`;
  }
}
