/* eslint-disable @typescript-eslint/naming-convention */
// AppRole has excess values to what we desire to show, they will be filtered but need an empty entry here.
export const roleInfo = {
  ADMIN: 'An admin has full privileges to do anything.',
  EDITOR: 'An editor may not edit payout settings, but otherwise has full privileges.',
  READER: 'A reader may only look at the site, and cannot take any actions.',
  UNALLOCATED: 'This user has not been assigned a role.',
  API_CONSUMER: '',
  ANONYMOUS_PAYER: '',
  PAYER: '',
  JS_LIBRARY: '',
  LIMITED_PAYER: '',
  CHECKOUT_API_CONSUMER: '',
  EXTERNAL_API_CONSUMER: '',
  LIMITED_USER: '',
  CUSTOMER_ADMIN: '',
  CUSTOMER_MANAGER: '',
  CUSTOMER_PAYER: '',
  CUSTOMER_READER: '',
};
