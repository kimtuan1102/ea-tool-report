export interface PushReportPayload {
  accountId: string;
  selfOrder: number;
  botOrder: number;
  percent?: number;
  dollar?: number;
  currentBalance: number;
}
