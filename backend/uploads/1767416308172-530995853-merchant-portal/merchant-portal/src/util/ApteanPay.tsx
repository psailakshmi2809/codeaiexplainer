import { useState } from 'react';
import theme from '../Theme';
import { APTEAN_API_SUBSCRIPTION_KEY, EZPAY_API_URL } from './Constants';
import { ApteanSSOProvider } from './ApteanSSOProvider';
import { CreditCard } from '../gql-types.generated';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/naming-convention
    ApteanPay: (
      apiKey: string,
      erpProductId: string,
      tenantId: string,
      options?: any,
      extendedArgs?: ApteanPaySDKExtendedArgs,
    ) => ApteanPaySDK;
  }
}

interface ApteanPaySDKExtendedArgs {
  headers?: ApteanPaySDKHeaders;
  customerId?: string;
}

interface ApteanPaySDKHeaders {
  bearerToken?: string;
  clientId?: string;
}

export interface ApteanPaySDK {
  components: (options?: any) => ApteanPaySDKComponents;
  createTokenCallback: (
    tokenComponent: ApteanPaySDKCardComponent | ApteanPaySDKBankComponent,
    data: ApteanPaySDKCreateTokenCardData,
    callback: (token?: ApteanPaySDKToken, errors?: ApteanPaySDKError[]) => void,
  ) => void;
}

interface ApteanPaySDKComponents {
  create: (componentType: 'card', options?: ApteanPaySDKCardComponentOptions) => ApteanPaySDKCardComponent;
  createBank: (options?: ApteanPaySDKBankComponentOptions) => ApteanPaySDKBankComponent;
}

export interface ApteanPaySDKCardComponent {
  mount: (domElementForCapture: string, domElementForSubmit: string | HTMLElement, onMountedCallback?: () => void) => void;
}

export interface ApteanPaySDKBankComponent {
  mount: (domElementForCapture: string, domElementForSubmit: string | HTMLElement, onMountedCallback?: () => void) => void;
}
interface ApteanPaySDKCardComponentOptions {
  customStyle: Record<string, unknown>;
  showLabels: boolean;
  showPlaceholders: boolean;
  showErrorMessages: boolean;
  showErrorMessagesWhenUnfocused: boolean;
}

interface ApteanPaySDKBankComponentOptions {
  customStyle: Record<string, unknown>;
  showLabels: boolean;
  showPlaceholders: boolean;
  showErrorMessages: boolean;
  showErrorMessagesWhenUnfocused: boolean;
}
export interface ApteanPaySDKCreateTokenCardData {
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressZip: string;
  addressCountry: string;
  emailAddress?: string;
  recurring?: boolean;
  phoneCountryCode?: string;
  phoneNumber?: string;
  virtualTerminalMode?: string;
}

export interface ApteanPaySDKToken {
  id: string;
  clientIp?: string;
  created: number;
  livemode: boolean;
  status?: ApteanPaySDKPaymentMethodStatus;
  type: 'card' | 'payment-bank-us';
  used: boolean;
  creditCard?: CreditCard;
}

export interface ApteanPaySDKError {
  type: ApteanPaySDKErrorType;
  code?: string;
  declineCode?: string;
  docUrl?: string;
  message?: string;
  param?: string;
}

enum ApteanPaySDKPaymentMethodStatus {
  DELETED = 'DELETED',
  PROCESSING = 'PROCESSING',
  PROCESSING_COMPLETE = 'PROCESSING_COMPLETE',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  UNVERIFIED = 'UNVERIFIED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  VERIFIED = 'VERIFIED',
  UNKNOWN = 'UNKNOWN',
}

type ApteanPaySDKErrorType =
  | 'api_connection_error'
  | 'api_error'
  | 'authentication_error'
  | 'card_error'
  | 'idempotency_error'
  | 'invalid_request_error'
  | 'rate_limit_error'
  | 'validation_error'
  | 'token_retrieval_error';

export const CustomStyle = {
  styles: {
    base: {
      'border-radius': '4px',
      height: '56px',
      'font-size': '16px',
      ':hover': {
        'border-color': theme.palette.uxGrey.dark,
      },
      ':focus': {
        border: `2px solid ${theme.palette.primary.main}`,
      },
    },
    valid: {
      ':hover': {
        'border-color': theme.palette.uxGrey.dark,
      },
      ':focus': {
        border: `2px solid ${theme.palette.primary.main}`,
      },
    },
    invalid: {
      'border-color': theme.palette.error.main,
      ':hover': {
        'border-color': theme.palette.error.main,
      },
      ':focus': {
        border: `2px solid ${theme.palette.error.main}`,
      },
      '::placeholder': {
        color: theme.palette.error.main,
      },
    },
    'expiration-slash': {
      base: {
        'font-size': '30px',
      },
    },
    'cvv-icon': {
      base: {
        display: 'none',
      },
    },
  },
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useApteanPay = () => {
  const [apteanPay, setApteanPay] = useState<ApteanPaySDK>();
  const [sdkComponent, setSDKComponent] = useState<ApteanPaySDKCardComponent | ApteanPaySDKBankComponent>();

  const configure = async (tenantId: string, customerId: string | undefined, componentType: 'card' | 'bank') => {
    setApteanPay(undefined);
    setSDKComponent(undefined);
    if (!window.ApteanPay) {
      return;
    }
    const apiKey = APTEAN_API_SUBSCRIPTION_KEY;
    const bearerToken = (await ApteanSSOProvider.getAccessToken()).accessToken;
    const extendedArgs = { customerId, headers: { bearerToken, clientId: '' }, baseUrl: EZPAY_API_URL };
    const sdk = window.ApteanPay(apiKey, '', tenantId, {}, extendedArgs);
    const components = sdk.components({});
    const componentOptions = {
      customStyle: CustomStyle,
      showLabels: false,
      showPlaceholders: true,
      showErrorMessages: true,
      showErrorMessagesWhenUnfocused: true,
    };
    let component;
    if (componentType === 'bank' && components.createBank) {
      component = components.createBank(componentOptions);
    }
    if (componentType === 'card' && components.create) {
      component = components.create('card', componentOptions);
    }
    setApteanPay(sdk);
    setSDKComponent(component);
  };

  const mountComponent = (cardContainer: string, buttonTrigger: string | HTMLElement, onMountedCallback?: () => void) => {
    if (!apteanPay || !sdkComponent) {
      return;
    }
    sdkComponent.mount(cardContainer, buttonTrigger, onMountedCallback);
  };
  const cleanup = () => {
    setApteanPay(undefined);
    setSDKComponent(undefined);
  };

  return { apteanPay, sdkComponent, configure, mountComponent, cleanup };
};
