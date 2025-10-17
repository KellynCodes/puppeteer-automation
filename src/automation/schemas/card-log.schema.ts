import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CardLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['add_card', 'update_card', 'login'] })
  action: string;

  @Prop({ required: true, enum: ['success', 'failed', 'pending'] })
  status: string;

  @Prop({ required: false })
  cardLast4Digits?: string;

  @Prop({ required: false })
  cardHolder?: string;

  @Prop({ required: false, type: Object })
  encryptedCardData?: any;

  @Prop({ required: false })
  errorMessage?: string;

  @Prop({ required: false, type: Object })
  errorDetails?: any;

  @Prop({ required: false })
  screenshotPath?: string;

  @Prop({ required: false })
  duration?: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const CardLogSchema = SchemaFactory.createForClass(CardLog);

CardLogSchema.index({ userId: 1, createdAt: -1 });
CardLogSchema.index({ status: 1 });
