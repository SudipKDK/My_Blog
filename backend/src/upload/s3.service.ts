import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly config: ConfigService) {
    const region = this.config.getOrThrow<string>('AWS_REGION');
    const accessKeyId = this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY');
    this.bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');

    this.client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
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
        },
      });

      await upload.done();
    } catch (err) {
      this.logger.error('S3 upload failed', err);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }

    // Return the public object URL
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  /**
   * Delete an object from S3 by its full URL or key.
   */
  async deleteFile(urlOrKey: string): Promise<void> {
    // Extract key from full URL if needed
    const key = urlOrKey.startsWith('http')
      ? urlOrKey.split('.amazonaws.com/')[1]
      : urlOrKey;

    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      this.logger.log(`Deleted S3 object: ${key}`);
    } catch (err) {
      this.logger.error('S3 delete failed', err);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }
}
