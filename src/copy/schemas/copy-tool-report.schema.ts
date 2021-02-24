import * as mongoose from 'mongoose';

export const CopyToolReportSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: [true, 'Account Id is blank'],
    },
    selfOrder: {
      type: Number,
      required: [true, 'Self order is blank'],
    },
    botOrder: {
      type: Number,
      required: [true, 'Bot order is blank'],
    },
    currentBalance: {
      type: String,
      required: [true, 'Current Balance is blank'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
