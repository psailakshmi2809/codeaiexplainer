import { PayoutReportItem } from '../gql-types.generated';

export interface MonthlyPayoutReport {
  name: string;
  reports: PayoutReportItem[];
}
