export enum Permission {
  MerchantAccountCreate = 'aptean.payments/ezpay/merchantaccount/create',
  MerchantAccountRead = 'aptean.payments/ezpay/merchantaccount/read',
  MerchantAccountUpdate = 'aptean.payments/ezpay/merchantaccount/update',
  MerchantAccountDelete = 'aptean.payments/ezpay/merchantaccount/delete',
  MerchantPayoutCreate = 'aptean.payments/ezpay/merchantpayout/create',
  MerchantPayoutRead = 'aptean.payments/ezpay/merchantpayout/read',
  MerchantPayoutUpdate = 'aptean.payments/ezpay/merchantpayout/update',
  MerchantPayoutDelete = 'aptean.payments/ezpay/merchantpayout/delete',
  MerchantPayoutSettingCreate = 'aptean.payments/ezpay/merchantpayoutsetting/create',
  MerchantPayoutSettingRead = 'aptean.payments/ezpay/merchantpayoutsetting/read',
  MerchantPayoutSettingUpdate = 'aptean.payments/ezpay/merchantpayoutsetting/update',
  LegalEntityCreate = 'aptean.payments/ezpay/legalentity/create',
  LegalEntityRead = 'aptean.payments/ezpay/legalentity/read',
  LegalEntityUpdate = 'aptean.payments/ezpay/legalentity/update',
  LegalEntityVerificationUpdate = 'aptean.payments/ezpay/legalentityverification/update',
  PaymentRequestCreate = 'aptean.payments/ezpay/paymentrequest/create',
  PaymentRequestRead = 'aptean.payments/ezpay/paymentrequest/read',
  PaymentRequestUpdate = 'aptean.payments/ezpay/paymentrequest/update',
  PaymentRequestDelete = 'aptean.payments/ezpay/paymentrequest/delete',
  RefundCreate = 'aptean.payments/ezpay/refund/create',
  RefundRead = 'aptean.payments/ezpay/refund/read',
  RefundUpdate = 'aptean.payments/ezpay/refund/update',
  RefundDelete = 'aptean.payments/ezpay/refund/delete',
  UserCreate = 'aptean.payments/ezpay/user/create',
  UserRead = 'aptean.payments/ezpay/user/read',
  UserUpdate = 'aptean.payments/ezpay/user/update',
  UserDelete = 'aptean.payments/ezpay/user/delete',
}

export interface RolePermissionsMapping {
  [key: string]: string[];
  admin: string[];
  editor: string[];
  reader: string[];
  unallocated: string[];
}

const readerPermissions = [
  Permission.MerchantAccountRead,
  Permission.MerchantPayoutRead,
  Permission.MerchantPayoutSettingRead,
  Permission.LegalEntityRead,
  Permission.PaymentRequestRead,
  Permission.RefundRead,
  Permission.UserRead,
];
const editorPermissions = [
  ...readerPermissions,
  Permission.MerchantAccountCreate,
  Permission.MerchantAccountUpdate,
  Permission.LegalEntityCreate,
  Permission.LegalEntityUpdate,
  Permission.PaymentRequestCreate,
  Permission.PaymentRequestUpdate,
  Permission.RefundCreate,
  Permission.RefundUpdate,
  Permission.UserDelete,
  Permission.UserCreate,
  Permission.UserUpdate,
];
const adminPermissions = [
  ...editorPermissions,
  Permission.LegalEntityVerificationUpdate,
  Permission.MerchantPayoutUpdate,
  Permission.MerchantPayoutCreate,
  Permission.MerchantPayoutSettingUpdate,
  Permission.MerchantPayoutSettingCreate,
];
const getRolePermissionsMapping = (): RolePermissionsMapping => {
  return {
    admin: adminPermissions,
    editor: editorPermissions,
    reader: readerPermissions,
    unallocated: [],
  };
};

export const checkPermission = (permission: Permission, roleName?: string): boolean => {
  if (!roleName) {
    return false;
  }
  const roles = getRolePermissionsMapping();
  const roleKeys = Object.keys(roles);

  let hasPermission = false;
  roleKeys.forEach(role => {
    const perms = roles[role];
    if (role.toLowerCase() === roleName.toLowerCase()) {
      if (perms.some(perm => perm === permission)) {
        hasPermission = true;
      }
    }
  });

  return hasPermission;
};
