import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  coverImage: string;

  @Prop({ default: false })
  published: boolean;

}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ published: 1, createdAt: -1 });
