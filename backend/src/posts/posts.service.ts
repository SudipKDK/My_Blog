import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<PostDocument> {
    const slug = createPostDto.slug + '-' + randomBytes(2).toString('hex');
    const post = new this.postModel({ ...createPostDto, slug });
    return post.save();
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: PostDocument[], total: number, page: number, limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.postModel.countDocuments().exec()
    ]);
    return { data, total, page, limit };
  }

  async findAllPublished(page: number = 1, limit: number = 10): Promise<{ data: PostDocument[], total: number, page: number, limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.postModel.find({ published: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.postModel.countDocuments({ published: true }).exec()
    ]);
    return { data, total, page, limit };
  }

  async findOneBySlug(slug: string): Promise<PostDocument> {
    const post = await this.postModel.findOne({ slug }).exec();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findOneById(id: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).exec();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<PostDocument> {
    const post = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { returnDocument: 'after' })
      .exec();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async remove(id: string): Promise<PostDocument> {
    const post = await this.postModel.findByIdAndDelete(id).exec();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
