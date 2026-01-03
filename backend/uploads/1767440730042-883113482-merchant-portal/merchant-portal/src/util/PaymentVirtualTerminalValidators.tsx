import { PaymentMethod } from '../gql-types.generated';

export const checkIsAmountValid = (amountValue: string): boolean => {
  if (Number.isNaN(+amountValue) || !amountValue || parseFloat(amountValue) < 1 || parseInt(amountValue) > 10000000) {
    return false;
  }

  return true;
};

export const checkIsEmailValid = (emailValue: string): boolean => {
  const testPassed = !!emailValue.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
  if (!testPassed || emailValue.length === 0) {
    return false;
  }

  return true;
};

export const checkIsSearchEmailOrNameValid = (emailOrNameValue: string): boolean => {
  const emailOrName = emailOrNameValue.trim();
  if (emailOrName.length < 3) {
    return false;
  }
  return true;
};

export const checkIsPhoneNumberValid = (phoneNumberValue: string): boolean => {
  if (phoneNumberValue.length !== 10) {
    return false;
  }

  return true;
};

export const checkIsPostalCodeValid = (zipCodeValue: string, country: string | undefined | null): boolean => {
  if (zipCodeValue.trim().length === 0) {
    // Invalid if just spaces
    return false;
  }

  if (country === 'US') {
    return !!zipCodeValue.match(/(^\d{5}$)/);
  }
  if (country === 'CA') {
    return !!zipCodeValue.match(/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i); //https://stackoverflow.com/a/46761018
  }
  if (country === 'GB') {
    return !!zipCodeValue.match(/^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0A{2})$/i); //https://stackoverflow.com/a/51885364
  }
  // TODO: add cases for other commonly used countries
  return true;
};

export const checkIsCountryCodeValid = (countryCodeValue: string): boolean => {
  return !!countryCodeValue.match(/^\+?[0-9]{1,3}$/);
};

export const checkIsFullNameValid = (fullName: string): boolean => {
  const name = fullName.trim();
  const fullNameLength = name.length;

  // eslint-disable-next-line no-control-regex
  const nameFormat = RegExp(/^[^\x00-\x1f]+$/);
  const validFormat = nameFormat.test(name);

  if (validFormat === false || fullNameLength < 3 || fullNameLength > 26) {
    return false;
  }

  return true;
};

export const checkIsDescriptionValid = (description: string): boolean => {
  if (description.trim().length < 3) {
    return false;
  }

  return true;
};

export const checkIsMethodInfoValid = (
  customerEmail: string,
  customerName: string,
  country: string,
  postalCode: string,
  countryCode: string,
  phoneNumber: string,
): boolean => {
  const billingValid =
    country &&
    postalCode &&
    countryCode &&
    phoneNumber &&
    checkIsPostalCodeValid(postalCode, country) &&
    checkIsCountryCodeValid(countryCode) &&
    checkIsPhoneNumberValid(phoneNumber);
  const newCardInfoValid = customerEmail && customerName && checkIsEmailValid(customerEmail) && checkIsFullNameValid(customerName);
  return !!(billingValid && newCardInfoValid);
};

export const checkIsPaymentVirtualTerminalValid = (
  paymentAmount: string,
  description: string,
  selectedPaymentMethod?: PaymentMethod,
  isConfirmed?: boolean,
): boolean => {
  const selectedMethodValid = selectedPaymentMethod && isConfirmed;
  return !!(selectedMethodValid && paymentAmount && checkIsAmountValid(paymentAmount) && checkIsDescriptionValid(description));
};
