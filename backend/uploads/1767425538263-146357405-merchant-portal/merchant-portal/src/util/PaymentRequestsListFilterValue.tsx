import { PaymentRequestStatus } from '../gql-types.generated';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MAX_STATUS_COUNT = 9;

export interface AllPaymentRequestsStatusFilterValue {
  value: PaymentRequestStatus;
  display: string;
  isSelected: boolean;
}

export const PaymentRequestsStatusFilterValue: AllPaymentRequestsStatusFilterValue[] = [
  { value: PaymentRequestStatus.Completed, display: 'Completed', isSelected: true },
  { value: PaymentRequestStatus.Pending, display: 'Pending', isSelected: true },
  { value: PaymentRequestStatus.Unpaid, display: 'Unpaid', isSelected: true },
  { value: PaymentRequestStatus.PartiallyPaid, display: 'Partially Paid', isSelected: true },
  { value: PaymentRequestStatus.PartiallyRefunded, display: 'Partially Refunded', isSelected: true },
  { value: PaymentRequestStatus.RefundFailed, display: 'Refund Failed', isSelected: true },
  { value: PaymentRequestStatus.FullyRefunded, display: 'Fully Refunded', isSelected: true },
  { value: PaymentRequestStatus.Failed, display: 'Failed', isSelected: true },
  { value: PaymentRequestStatus.Closed, display: 'Closed', isSelected: true },
];

// added extra array to unselect faster [here everything as same as "PaymentRequestStatusFilterValue" just isSelected is false]
export const PaymentRequestsStatusFilterValueUnselected: AllPaymentRequestsStatusFilterValue[] = [
  { value: PaymentRequestStatus.Completed, display: 'Completed', isSelected: false },
  { value: PaymentRequestStatus.Pending, display: 'Pending', isSelected: false },
  { value: PaymentRequestStatus.Unpaid, display: 'Unpaid', isSelected: false },
  { value: PaymentRequestStatus.PartiallyPaid, display: 'Partially Paid', isSelected: false },
  { value: PaymentRequestStatus.PartiallyRefunded, display: 'Partially Refunded', isSelected: false },
  { value: PaymentRequestStatus.RefundFailed, display: 'Refund Failed', isSelected: false },
  { value: PaymentRequestStatus.FullyRefunded, display: 'Fully Refunded', isSelected: false },
  { value: PaymentRequestStatus.Failed, display: 'Failed', isSelected: false },
  { value: PaymentRequestStatus.Closed, display: 'Closed', isSelected: false },
];
