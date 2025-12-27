import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class ScheduleItem {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  daytime: string;

  @Prop({ required: true })
  hall: number;

  @Prop({ required: true })
  rows: number;

  @Prop({ required: true })
  seats: number;

  @Prop({ required: true })
  price: number;

  @Prop([String])
  taken: string[];
}

export const ScheduleItemSchema = SchemaFactory.createForClass(ScheduleItem);

@Schema({ timestamps: true })
export class Film extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  rating: number;

  @Prop({ required: true })
  director: string;

  @Prop([String])
  tags: string[];

  @Prop()
  about: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop()
  cover: string;

  @Prop({ type: [ScheduleItemSchema], default: [] })
  schedule: ScheduleItem[];
}

export const FilmSchema = SchemaFactory.createForClass(Film);
