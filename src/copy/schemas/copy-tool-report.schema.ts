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
    dollar: {
      type: Number,
      required: [true, 'Dollar is blank'],
      default: 0,
    },
    percent: {
      type: Number,
      required: [true, 'Percent is blank'],
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
    zalo: {
      type: String,
      required: [true, 'Zalo is blank'],
      default: '',
    },
    expireDate: {
      type: Date,
      required: [true, 'Expire date is blank'],
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
