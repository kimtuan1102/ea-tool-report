import { Document } from 'mongoose';

export interface CopyToolReport extends Document {
  accountId: string;
  selfOrder: number;
  botOrder: number;
  currentBalance: string;
}
