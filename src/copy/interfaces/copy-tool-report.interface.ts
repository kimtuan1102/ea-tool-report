import { Document } from 'mongoose';

export interface CopyToolReport extends Document {
  accountId: string;
  selfOrder: number;
  botOrder: number;
  currentBalance: number;
  initialBalance: number;
  percent: number;
  dollar: number;
  deposit: number;
  withdraw: number;
  telegram: string;
  expireDate: Date;
  phone: string;
  expireDateFormat: string;
}
