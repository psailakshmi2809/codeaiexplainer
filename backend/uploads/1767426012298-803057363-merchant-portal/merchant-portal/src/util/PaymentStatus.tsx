type EnumDisplay = {
  name: string;
  display: string;
};

export const paymentStatusDisplay: EnumDisplay[] = [
  { name: 'CANCELED', display: 'Canceled' },
  { name: 'COMPLETED', display: 'Completed' },
  { name: 'FAILED', display: 'Failed' },
  { name: 'PENDING', display: 'Pending' },
  { name: 'PARTIALLY_PAID', display: 'Partially Paid' },
  { name: 'PARTIALLY_REFUNDED', display: 'Partially Refunded' },
  { name: 'REFUND_FAILED', display: 'Refund Failed' },
  { name: 'REFUND_PENDING', display: 'Refund Pending' },
  { name: 'UNPAID', display: 'Unpaid' },
  { name: 'UNKNOWN', display: 'Unknown' },
  { name: 'CLOSED', display: 'Closed' },
  { name: 'REFUND_COMPLETED', display: 'Refunded' },
  { name: 'FULLY_REFUNDED', display: 'Fully Refunded' },
  { name: 'PENDING_AUTHORIZATION', display: 'Pending Authorization' },
];
