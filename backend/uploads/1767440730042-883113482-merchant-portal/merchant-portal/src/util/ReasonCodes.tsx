/** Reason codes for sercive errors */
export enum ServiceErrorReasonCode {
  EmailAssociatedWithACustomer = 'EMAIL_ASSOCIATED_WITH_A_CUSTOMER',
  PaymentMethodMaxAttachLimit = 'PAYMENT_METHOD_MAX_ATTACH_LIMIT',
  // Many others exist, only providing ones which are used on the front end.
}
