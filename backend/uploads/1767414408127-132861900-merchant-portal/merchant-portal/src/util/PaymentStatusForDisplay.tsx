import { Refund, RefundStatus, Maybe, PendingReasonCode } from '../gql-types.generated';
import { DateTime } from 'luxon';
const PaymentStatusForDisplay = (
  status: string | undefined,
  amount: number,
  refunds: Maybe<Refund>[] | undefined,
  createdAt: string,
  immediateCapture?: boolean | null,
  pendingReasonCode?: PendingReasonCode | null,
): string | undefined => {
  if (refunds && refunds.length > 0) {
    if (refunds[refunds.length - 1]?.status === RefundStatus.Failed) {
      return 'Refund Failed';
    }

    let refundedAmount = 0;
    for (let refundIndex = 0; refundIndex < refunds.length; refundIndex += 1) {
      if (refunds[refundIndex]?.status === RefundStatus.Completed) {
        refundedAmount += refunds[refundIndex]?.amount || 0;
      }
      if (refunds[refundIndex]?.status === RefundStatus.Pending) {
        return 'Refund Pending';
      }
    }
    if (refundedAmount === amount) {
      return 'Fully Refunded';
    }

    return 'Partially Refunded';
  }
  if (immediateCapture === false && status === 'Pending' && pendingReasonCode === PendingReasonCode.PendingCapture) {
    const createdDate = DateTime.fromISO(createdAt).toUTC();
    const today = DateTime.local().toUTC();
    const expiryDate = createdDate.plus({ days: 7 });
    if (today >= expiryDate) return 'Expired';
  }
  return status;
};

export { PaymentStatusForDisplay };
