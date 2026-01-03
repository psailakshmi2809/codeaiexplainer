import { gqlClient } from '../../components/AppProvider';
import {
  PaymentMethodHolderInput,
  CurrencyType,
  RiskMetadataPaymentInput,
  PaymentMethodType,
  VirtualTerminalMode,
  MutationStatusCode,
  PaymentMethodStatus,
  PaymentStatus,
  PaymentMethod,
  PaymentRequestAllocationInput,
} from '../../gql-types.generated';
import { createPaymentMethod } from '../../gql/MutationCreatePaymentMethod';
import { convertPayfacPaymentMethodToken } from '../../gql/MutationConvertPayfacPaymentMethodToken';
import { createPayment } from '../../gql/MutationCreatePayment';
import { createPaymentForRequests } from '../../gql/MutationCreatePaymentForRequests';
import { queryPaymentMethodByToken } from '../../gql/QueryPaymentMethodByToken';
import { AppDispatch, RootState } from '../../store';
import { captureCustomerOptionError } from '../home/HomeSlice';
import {
  fetchPaymentError,
  fetchCreatePaymentMethodError,
  fetchCreatePaymentStatus,
  fetchIsCreatePaymentInFlight,
  fetchMatchedMethods,
  fetchIsQueryMethodsByEmailInFlight,
  fetchCreatedPaymentMethod,
  fetchIsCreatePaymentMethodInFlight,
  fetchHasReachedPaymentMethodLimit,
  fetchIsUpdatePaymentMethodInFlight,
  fetchUpdatePaymentMethodError,
} from './PaymentVirtualTerminalSlice';
import { queryPaymentMethods } from '../../gql/QueryPaymentMethods';
import { GraphQLError } from 'graphql';
import { ServiceErrorReasonCode } from '../../util/ReasonCodes';
import { updatePaymentMethod } from '../../gql/UpdatePaymentMethod';
import { selectTenantId } from '../app/AppSlice';

// function to check whether a payment method has finished processing
const waitForPaymentMethodProcessing = async (token: string): Promise<PaymentMethod | undefined> => {
  let status = PaymentMethodStatus.Processing;
  let paymentMethod;
  let i = 0;
  while (i < 30 && status === PaymentMethodStatus.Processing) {
    // eslint-disable-next-line no-await-in-loop
    const paymentMethods = await queryPaymentMethodByToken(gqlClient, token);
    paymentMethod = paymentMethods?.nodes[0];
    const currentStatus = paymentMethod?.status;
    if (currentStatus) status = currentStatus;

    // wait 500 ms before next query
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => setTimeout(resolve, 500));

    i += 1;
  }

  return paymentMethod || undefined;
};

const createLongLivedPaymentMethod = async (
  paymentMethodId: string,
  resourceId: string,
): Promise<{ paymentMethodId?: string; hasReachedLimit?: boolean }> => {
  try {
    const createStatus = await createPaymentMethod(gqlClient, paymentMethodId, resourceId);
    if (createStatus?.code === MutationStatusCode.Error) {
      // check if status ok, if not throw error.
      throw new Error('An error occurrred saving the payment method. Please verify the information and try again.');
    }
    return { paymentMethodId: createStatus?.paymentMethod?.id };
  } catch (e) {
    let hasReachedLimit = false;
    if (e?.graphQLErrors && e.graphQLErrors[0]) {
      const error = e.graphQLErrors[0] as GraphQLError;
      const { extensions: { exception: { reasonCode = undefined } = {} } = {} } = error;
      if (reasonCode === ServiceErrorReasonCode.PaymentMethodMaxAttachLimit) {
        hasReachedLimit = true;
      }
    }
    if (hasReachedLimit) {
      return { paymentMethodId: undefined, hasReachedLimit: true };
      // eslint-disable-next-line no-else-return
    }
    throw e;
  }
};
export const captureUpdatePaymentMethod =
  (payload: { paymentMethodId: string; email: string; phone: string; countryCode: string }) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    dispatch(fetchIsUpdatePaymentMethodInFlight(true));
    dispatch(fetchUpdatePaymentMethodError(undefined));

    try {
      const state = getState();
      const tenantId = selectTenantId(state);

      if (!tenantId) {
        throw new Error('Tenant ID missing');
      }

      // Get fresh data instead of using state values
      const { virtualTerminal } = state;
      const response = await updatePaymentMethod(
        gqlClient,
        payload.paymentMethodId,
        false,
        tenantId,
        tenantId,
        undefined,
        payload.email,
        {
          number: payload.phone.replace(/\D/g, ''),
          countryCode: payload.countryCode,
        },
      );

      if (response?.code !== 'SUCCESS') {
        throw new Error(response?.message || 'Update failed');
      }

      if (response.paymentMethod) {
        // Update matched methods with fresh array
        const updatedMethods =
          virtualTerminal.matchedMethods?.map(method =>
            method.id === response.paymentMethod?.id ? response.paymentMethod : method,
          ) || [];

        dispatch(fetchMatchedMethods(updatedMethods));

        // Update created payment method reference
        if (virtualTerminal.createdPaymentMethod?.id === response.paymentMethod.id) {
          dispatch(fetchCreatedPaymentMethod(response.paymentMethod));
        }
      }

      dispatch(fetchIsUpdatePaymentMethodInFlight(false));
    } catch (error) {
      dispatch(fetchUpdatePaymentMethodError(error as Error));
      dispatch(fetchIsUpdatePaymentMethodInFlight(false));
    }
  };
export const captureCreatePaymentMethod =
  (token: string, saveCard: boolean, attachToResourceId: string, customerId?: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(fetchIsCreatePaymentMethodInFlight(true));
    try {
      const paymentMethod = await waitForPaymentMethodProcessing(token);
      const status = paymentMethod?.status;
      if (status !== PaymentMethodStatus.Processing) {
        if (status === PaymentMethodStatus.ProcessingError || status === PaymentMethodStatus.VerificationFailed) {
          throw new Error('Verify your billing address and credit card details and try again.');
        }
        let paymentMethodId: string | undefined = token;
        if (saveCard && paymentMethodId) {
          const resourceId = customerId || attachToResourceId;
          const { paymentMethodId: longLivedMethodId, hasReachedLimit } = await createLongLivedPaymentMethod(
            paymentMethodId,
            resourceId,
          );
          if (hasReachedLimit) {
            dispatch(fetchHasReachedPaymentMethodLimit(true));
          } else {
            paymentMethodId = longLivedMethodId;
          }
        }
        if (paymentMethodId) {
          const paymentMethodConnection = await queryPaymentMethodByToken(gqlClient, paymentMethodId);
          if (paymentMethodConnection) {
            dispatch(fetchCreatedPaymentMethod(paymentMethodConnection?.nodes[0] || undefined));
          } else {
            throw new Error('An error occurrred attempting to obtain the correct payment method from token.');
          }
        } else {
          throw new Error('An error occurrred attempting to obtain the correct payment method id. Id was undefined.');
        }
      }
      dispatch(fetchIsCreatePaymentMethodInFlight(false));
    } catch (e) {
      dispatch(fetchCreatePaymentMethodError(e));
      dispatch(fetchIsCreatePaymentMethodInFlight(false));
    }
  };

export const captureCreatePayment =
  (
    token: string,
    holder: PaymentMethodHolderInput,
    amount: number,
    currency: CurrencyType,
    riskMetadata: RiskMetadataPaymentInput,
    idempotencyKey: string,
    orderNumber: string,
    customerPONumber: string,
    invoiceNumber: string,
    description: string,
    saveCard: boolean,
    attachToResourceId: string,
  ) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(fetchPaymentError(undefined));
    dispatch(fetchCreatePaymentStatus(undefined));
    dispatch(fetchIsCreatePaymentInFlight(true));

    try {
      const convertStatus = await convertPayfacPaymentMethodToken(
        gqlClient,
        PaymentMethodType.CreditCard,
        token,
        holder,
        VirtualTerminalMode.Web,
      );
      if (convertStatus?.code === MutationStatusCode.Error) {
        throw new Error(convertStatus.error || convertStatus.message || 'Payment was canceled. Please try after sometime.');
      }

      if (convertStatus && convertStatus.token) {
        const paymentMethod = await waitForPaymentMethodProcessing(convertStatus.token.id);
        const status = paymentMethod?.status;

        if (status !== PaymentMethodStatus.Processing) {
          if (status === PaymentMethodStatus.ProcessingError || status === PaymentMethodStatus.VerificationFailed) {
            throw new Error('Verify your billing address and credit card details and try again.');
          }

          let paymentMethodId;
          paymentMethodId = convertStatus.token.id;
          if (saveCard) {
            const createStatus = await createPaymentMethod(gqlClient, paymentMethodId, attachToResourceId);
            if (createStatus?.code === MutationStatusCode.Error) {
              // check if status ok, if not throw error.
              throw new Error('An error occurrred saving the payment method. Please verify the information and try again.');
            }
            paymentMethodId = createStatus?.paymentMethod?.id;
          }
          if (paymentMethodId) {
            const createPaymentStatus = await createPayment(
              gqlClient,
              paymentMethodId,
              amount,
              currency,
              true,
              riskMetadata,
              false,
              idempotencyKey,
              orderNumber,
              customerPONumber,
              invoiceNumber,
              description,
            );
            if (createPaymentStatus?.code === MutationStatusCode.Error) {
              dispatch(
                fetchPaymentError({ name: 'Payment Failed', message: createPaymentStatus.error || createPaymentStatus.message || '' }),
              );
            }
            if (createPaymentStatus?.payment?.status === PaymentStatus.Canceled) {
              dispatch(
                fetchPaymentError({
                  name: 'Payment Cancelled',
                  message: createPaymentStatus.message || 'Payment was canceled. Please try after sometime.',
                }),
              );
            }
            if (createPaymentStatus) {
              dispatch(fetchCreatePaymentStatus(createPaymentStatus));
            }
          } else {
            throw new Error(
              '[captureCreatePayment] An error occurrred attempting to obtain the correct payment method id. Id was undefined.',
            );
          }
        }
      }
      dispatch(fetchIsCreatePaymentInFlight(false));
    } catch (e) {
      dispatch(fetchPaymentError(e));
      dispatch(fetchIsCreatePaymentInFlight(false));
    }
  };

export const captureCreatePaymentWithMethod =
  (
    paymentMethod: PaymentMethod,
    amount: number,
    currency: CurrencyType,
    riskMetadata: RiskMetadataPaymentInput,
    idempotencyKey: string,
    orderNumber: string,
    customerPONumber: string,
    invoiceNumber: string,
    description: string,
    customerId?: string,
  ) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(fetchPaymentError(undefined));
    dispatch(fetchCreatePaymentStatus(undefined));
    dispatch(fetchIsCreatePaymentInFlight(true));
    try {
      const paymentMethodId = paymentMethod.id;
      const createPaymentStatus = await createPayment(
        gqlClient,
        paymentMethodId,
        amount,
        currency,
        true,
        riskMetadata,
        false,
        idempotencyKey,
        orderNumber,
        customerPONumber,
        invoiceNumber,
        description,
        customerId,
      );
      if (createPaymentStatus?.code === MutationStatusCode.Error) {
        dispatch(
          fetchPaymentError({ name: 'Payment Failed', message: createPaymentStatus.error || createPaymentStatus.message || '' }),
        );
      }
      if (createPaymentStatus?.payment?.status === PaymentStatus.Canceled) {
        dispatch(
          fetchPaymentError({
            name: 'Payment Cancelled',
            message: createPaymentStatus.message || 'Payment was canceled. Please try after sometime.',
          }),
        );
      }
      if (createPaymentStatus) {
        dispatch(fetchCreatePaymentStatus(createPaymentStatus));
      }
      dispatch(fetchIsCreatePaymentInFlight(false));
    } catch (e) {
      dispatch(fetchPaymentError(e));
      dispatch(fetchIsCreatePaymentInFlight(false));
    }
  };

export const captureCreatePaymentForRequestsWithMethod =
  (
    paymentMethod: PaymentMethod,
    paymentAmount: number,
    paymentRequestAllocation: PaymentRequestAllocationInput[],
    currency: CurrencyType,
    riskMetadata: RiskMetadataPaymentInput,
    idempotencyKey: string,
    orderNumber: string,
    customerPONumber: string,
    invoiceNumber: string,
    description: string,
    customerId: string,
  ) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(fetchPaymentError(undefined));
    dispatch(fetchCreatePaymentStatus(undefined));
    dispatch(fetchIsCreatePaymentInFlight(true));
    try {
      const paymentMethodId = paymentMethod.id;
      const createPaymentStatus = await createPaymentForRequests(
        gqlClient,
        paymentMethodId,
        paymentAmount,
        paymentRequestAllocation,
        currency,
        true,
        riskMetadata,
        false,
        idempotencyKey,
        orderNumber,
        customerPONumber,
        invoiceNumber,
        description,
        customerId,
      );
      if (createPaymentStatus?.code === MutationStatusCode.Error) {
        dispatch(
          fetchPaymentError({ name: 'Payment Failed', message: createPaymentStatus.error || createPaymentStatus.message || '' }),
        );
      }
      if (createPaymentStatus?.payment?.status === PaymentStatus.Canceled) {
        dispatch(
          fetchPaymentError({
            name: 'Payment Cancelled',
            message: createPaymentStatus.message || 'Payment was canceled. Please try after sometime.',
          }),
        );
      }
      if (createPaymentStatus) {
        dispatch(fetchCreatePaymentStatus(createPaymentStatus));
      }
      dispatch(fetchIsCreatePaymentInFlight(false));
    } catch (e) {
      dispatch(fetchPaymentError(e));
      dispatch(fetchIsCreatePaymentInFlight(false));
    }
  };
export const fetchPaymentMethodsByEmailOrName =
  (emailOrName: string, resourceId: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (dispatch: AppDispatch, getState: () => any): Promise<void> => {
    dispatch(fetchIsQueryMethodsByEmailInFlight(true));
    try {
      const state = getState();
      const supportedPaymentMethods: PaymentMethodType[] = state.app.tenantAccount?.settings?.supportedPaymentMethods || [];
      const shouldFilterByType = supportedPaymentMethods.length !== 2;

      let paymentMethodType;
      if (!shouldFilterByType) {
        paymentMethodType = undefined;
      } else if (supportedPaymentMethods.includes(PaymentMethodType.CreditCard)) {
        paymentMethodType = PaymentMethodType.CreditCard;
      } else {
        paymentMethodType = PaymentMethodType.PaymentBankUs;
      }

      const paymentMethodConnection = await queryPaymentMethods(
        gqlClient,
        paymentMethodType,
        resourceId,
        [PaymentMethodStatus.Verified],
        emailOrName,
        undefined,
      );

      const methods =
        paymentMethodConnection?.nodes?.filter((method): method is PaymentMethod => method !== null && method !== undefined) || [];

      dispatch(fetchMatchedMethods(methods));
      dispatch(fetchIsQueryMethodsByEmailInFlight(false));
    } catch (e) {
      dispatch(captureCustomerOptionError(e));
      dispatch(fetchIsQueryMethodsByEmailInFlight(false));
      dispatch(fetchMatchedMethods([]));
    }
  };

export const fetchPaymentMethodsByCustomer =
  (customerId: string, resourceId: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (dispatch: AppDispatch, getState: () => any): Promise<void> => {
    dispatch(fetchIsQueryMethodsByEmailInFlight(true));
    try {
      const state = getState();
      const supportedPaymentMethods: PaymentMethodType[] = state.app.tenantAccount?.settings?.supportedPaymentMethods || [];
      const shouldFilterByType = supportedPaymentMethods.length !== 2;

      let paymentMethodType: PaymentMethodType | undefined;
      if (!shouldFilterByType) {
        paymentMethodType = undefined;
      } else if (supportedPaymentMethods.includes(PaymentMethodType.CreditCard)) {
        paymentMethodType = PaymentMethodType.CreditCard;
      } else {
        paymentMethodType = PaymentMethodType.PaymentBankUs;
      }

      const paymentMethodConnection = await queryPaymentMethods(
        gqlClient,
        paymentMethodType,
        resourceId,
        [PaymentMethodStatus.Verified],
        undefined,
        customerId,
      );

      const methods =
        paymentMethodConnection?.nodes?.filter((method): method is PaymentMethod => method !== null && method !== undefined) || [];

      dispatch(fetchMatchedMethods(methods));
      dispatch(fetchIsQueryMethodsByEmailInFlight(false));
    } catch (e) {
      dispatch(captureCustomerOptionError(e));
      dispatch(fetchIsQueryMethodsByEmailInFlight(false));
      dispatch(fetchMatchedMethods([]));
    }
  };
