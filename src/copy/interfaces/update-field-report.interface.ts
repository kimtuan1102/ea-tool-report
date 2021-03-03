export interface UpdateFieldReportPayload {
  accountId: string;
  initialBalance: number;
  deposit: number;
  withdraw: number;
  percent?: number;
  dollar?: number;
  zalo: string;
}
