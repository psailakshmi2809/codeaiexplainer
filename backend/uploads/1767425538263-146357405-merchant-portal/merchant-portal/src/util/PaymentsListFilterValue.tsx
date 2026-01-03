import { PaymentStatus, PaymentStatusExtended } from '../gql-types.generated';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MAX_STATUS_COUNT = 7;

export interface AllPaymentStatusFilterValue {
  value: PaymentStatus | PaymentStatusExtended;
  display: string;
  isSelected: boolean;
  // isExtended is added so we can differentiate between paymentStatus and paymentStatusExtended
  isExtended: boolean;
}

export const PaymentStatusFilterValue: AllPaymentStatusFilterValue[] = [
  { value: PaymentStatus.Completed, display: 'Completed', isSelected: true, isExtended: false },
  { value: PaymentStatus.Pending, display: 'Pending', isSelected: true, isExtended: false },
  { value: PaymentStatusExtended.PartiallyRefunded, display: 'Partially Refunded', isSelected: true, isExtended: true },
  { value: PaymentStatusExtended.Refunded, display: 'Fully Refunded', isSelected: true, isExtended: true },
  { value: PaymentStatus.Failed, display: 'Failed', isSelected: true, isExtended: false },
  { value: PaymentStatus.Canceled, display: 'Canceled', isSelected: true, isExtended: false },
];

// added extra array to unselect faster [here everything as same as "PaymentStatusFilterValue" just isSelected is false]
export const PaymentStatusFilterValueUnselected: AllPaymentStatusFilterValue[] = [
  { value: PaymentStatus.Completed, display: 'Completed', isSelected: false, isExtended: false },
  { value: PaymentStatus.Pending, display: 'Pending', isSelected: false, isExtended: false },
  { value: PaymentStatusExtended.PartiallyRefunded, display: 'Partially Refunded', isSelected: false, isExtended: true },
  { value: PaymentStatusExtended.Refunded, display: 'Fully Refunded', isSelected: false, isExtended: true },
  { value: PaymentStatus.Failed, display: 'Failed', isSelected: false, isExtended: false },
  { value: PaymentStatus.Canceled, display: 'Canceled', isSelected: false, isExtended: false },
];

interface EnumDateFilterValue {
  value: string;
  display: string;
}

export const DateFilterValue: EnumDateFilterValue[] = [
  { value: 'none', display: 'Select the Date Range' },
  { value: 'today', display: 'Today' },
  { value: 'yesterday', display: 'Yesterday' },
  { value: 'thisWeek', display: 'This Week' },
  { value: 'last7Days', display: 'Last 7 Days' },
  { value: 'thisMonth', display: 'This Month' },
  { value: 'last30Days', display: 'Last 30 Days' },
  { value: 'dateRange', display: 'Date Range' },
];
