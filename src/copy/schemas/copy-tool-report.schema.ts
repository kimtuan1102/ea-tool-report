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
      type: Number,
      required: [true, 'Current Balance is blank'],
    },
    initialBalance: {
      type: Number,
      required: [true, 'Initial Balance is blank'],
      default: 0,
    },
    deposit: {
      type: Number,
      required: [true, 'Deposit is blank'],
      default: 0,
    },
    withdraw: {
      type: Number,
      required: [true, 'Withdraw is blank'],
      default: 0,
    },
    telegram: {
      type: String,
      required: [true, 'Telegram is blank'],
      default: '',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
