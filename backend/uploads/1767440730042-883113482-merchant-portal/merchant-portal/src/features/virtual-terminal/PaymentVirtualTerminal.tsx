import {
  Box,
  Button,
  DialogContent,
  FormControl,
  Grid,
  InputLabel,
  Select,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
  InputAdornment,
  Card,
  CardActionArea,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  DialogActions,
  Paper,
  Container,
  Dialog,
  IconButton,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { v4 as uuid4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import CurrencyFormat from 'react-currency-format';
import {
  CardBrand,
  CurrencyType,
  Customer,
  Maybe,
  PaymentMethod,
  PaymentMethodStatus,
  PaymentMethodType,
  PaymentRequestAllocationInput,
  PaymentStatus,
  Token,
} from '../../gql-types.generated';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SearchIcon from '@mui/icons-material/Search';
import Amex from '../../Amex.svg';
import Diners from '../../Diners.svg';
import Discover from '../../Discover.svg';
import Mastercard from '../../Mastercard.svg';
import Jcb from '../../Jcb.svg';
import Visa from '../../Visa.svg';
import CreditCards from '../../credit_cards.svg';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BankIcon from '@mui/icons-material/AccountBalance';
import { Close, Edit } from '@mui/icons-material';
import { allCountries } from '../../util/Countries';
import NumberFormat from 'react-number-format';
import {
  checkIsAmountValid,
  checkIsCountryCodeValid,
  checkIsDescriptionValid,
  checkIsEmailValid,
  checkIsFullNameValid,
  checkIsMethodInfoValid,
  checkIsPaymentVirtualTerminalValid,
  checkIsPhoneNumberValid,
  checkIsPostalCodeValid,
  checkIsSearchEmailOrNameValid,
} from '../../util/PaymentVirtualTerminalValidators';
import ErrorIcon from '@mui/icons-material/Error';
import LoadingMask from '../../components/LoadingMask';
import PaymentMethodTimerBanner from '../../components/PaymentMethodTimerBanner';
// import WePayCreditCapture from '../../components/WepayCreditCapture';
import {
  selectTenantId,
  selectPaymentsFeatures,
  selectDefaultCurrency,
  selectPaymentRequestsFeatures,
  selectTenantAccount,
} from '../app/AppSlice';
import {
  fetchPaymentMethodsByEmailOrName,
  captureCreatePaymentForRequestsWithMethod,
  captureCreatePaymentWithMethod,
  captureCreatePaymentMethod,
  captureUpdatePaymentMethod,
  fetchPaymentMethodsByCustomer,
} from './PaymentVirtualTerminalActions';
import {
  selectMatchedMethods,
  selectRequestsToPay,
  selectIsQueryMethodsByEmailInFlight,
  selectCreatePaymentStatus,
  selectPaymentError,
  selectIsCustomerAmountValid,
  selectIsCustomerEmailValid,
  selectIsSearchEmailOrNameValid,
  selectIsCustomerPhoneValid,
  selectIsCustomerPostalValid,
  selectIsCustomerCountryCodeValid,
  selectIsCustomerNameValid,
  selectIsCustomerDescriptionValid,
  selectIsPaymentVirtualTerminalValid,
  selectIsMethodInfoValid,
  fetchIsCustomerCountryCodeValid,
  fetchIsCustomerNameValid,
  fetchIsPaymentVirtualTerminalValid,
  fetchIsMethodInfoValid,
  fetchIsCustomerDescriptionValid,
  fetchIsCustomerEmailValid,
  fetchIsSearchEmailOrNameValid,
  fetchIsCustomerPhoneValid,
  fetchIsCustomerAmountValid,
  fetchIsCustomerPostalValid,
  fetchCreatePaymentStatus,
  fetchPaymentError,
  fetchMatchedMethods,
  selectIsCreatePaymentInFlight,
  fetchCreatedPaymentMethod,
  selectCreatedPaymentMethod,
  fetchRequestsToPay,
  fetchCreatePaymentMethodError,
  selectCreatePaymentMethodError,
  fetchCreatePaymentSuccessMessage,
  selectHasReachedPaymentMethodLimit,
  fetchHasReachedPaymentMethodLimit,
  selectIsUpdatePaymentMethodInFlight,
  fetchUpdatePaymentMethodError,
  selectUpdatePaymentMethodError,
} from './PaymentVirtualTerminalSlice';
import { DataList } from '../../components/DataList';
import {
  DataGridProProps,
  useGridApiRef,
  GridCellEditCommitParams,
  GridColDef,
  GridRenderCellParams,
  GridRowModel,
  GridRowModelUpdate,
  GridValueFormatterParams,
} from '@mui/x-data-grid-pro';
import PartialPaymentEdit from '../../components/PartialPaymentEdit';
import AlarmIcon from '@mui/icons-material/AccessAlarm';
import { DateTime } from 'luxon';
import CustomerAutoComplete from '../../components/CustomerAutoComplete';
import { selectCustomerOptionList, selectCustomerOptionError, clearCustomerOptionList } from '../home/HomeSlice';
import { CustomerOption } from '../../custom-types/CustomerOption';
import InfoIcon from '@mui/icons-material/Info';
import { RoutePath } from '../../util/Routes';
import { ApteanPaySDKCreateTokenCardData, ApteanPaySDKError, ApteanPaySDKToken, useApteanPay } from '../../util/ApteanPay';
import EditPaymentMethodDialog from '../../components/EditPaymentMethodDialog';
import { Helmet } from 'react-helmet';
import AddBankDialog from '../../components/AddBankDialog';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogContent: {
      padding: 0,
    },
    terminalWrap: {
      padding: 0,
    },
    leftContainerMd: {
      padding: theme.spacing(0, 3, 1, 0),
      borderRight: `1px solid ${theme.palette.uxGrey.border}`,
    },
    rightContainerMd: {
      padding: theme.spacing(0, 0, 1, 3),
    },
    iFrameGridItem: {
      padding: theme.spacing(1, 0, 0, 0),
    },
    bankIframe: {
      width: '100%',
      padding: theme.spacing(0, 0, 0, 0),
      minHeight: 208,
    },
    saveCardCheckboxGridItem: {
      padding: theme.spacing(0, 0, 1, 0),
    },
    gridItem: {
      padding: theme.spacing(1, 0),
    },
    cardFrameContainer: {
      minHeight: 146,
      position: 'relative',
    },
    headingTextParent: {
      paddingBottom: theme.spacing(1),
      paddingTop: theme.spacing(1),
    },
    headingText: {
      fontWeight: 500,
    },
    cardHeading: {
      paddingTop: theme.spacing(1),
    },
    dialogContextError: {
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      height: 45,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyItems: 'center',
      padding: theme.spacing(0.5),
      margin: theme.spacing(1, 0),
    },
    errorIcon: {
      marginRight: 4,
    },
    total: {
      paddingLeft: theme.spacing(1),
      fontWeight: 'normal',
    },
    totalLabel: {
      paddingLeft: theme.spacing(1),
      fontWeight: 'bold',
    },
    helperText: {
      fontSize: 13,
      color: theme.palette.uxGrey.main,
    },
    saveCardHelperText: {
      fontSize: 16,
      color: theme.palette.uxGrey.main,
    },
    helperTextBottomPadding: {
      paddingBottom: theme.spacing(2),
    },
    methodDetailsText: {
      fontSize: 13,
      borderBottom: 'none',
      padding: 8,
    },
    methodDetailsRowText: {
      color: theme.palette.uxGrey.main,
      borderBottom: 'none',
      padding: 8,
    },
    paymetMethodCardAction: {
      padding: theme.spacing(0.5),
    },
    paymentMethodCardContainer: {
      width: '88px',
      height: '58px',
      margin: theme.spacing(0.5, 1, 0.5, 0),
    },
    paymentMethodCardContainerSelected: {
      width: '88px',
      height: '58px',
      margin: theme.spacing(0.5, 1, 0.5, 0),
      border: `solid 2px ${theme.palette.primary.main}`,
    },
    paymentMethodAddCardContainer: {
      width: '88px',
      height: '58px',
      margin: theme.spacing(0.5, 1, 0.5, 0),
      border: `dashed 1px ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.uxGrey.hover,
    },
    addCardIconContainer: {
      textAlign: 'center',
    },
    addCardIcon: {
      color: theme.palette.primary.main,
      fontSize: 28,
    },
    addCardText: {
      fontWeight: 500,
      fontSize: '14px',
      textAlign: 'center',
      color: theme.palette.primary.main,
    },
    columnFlexContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    },
    editDialogPaper: {
      width: 470,
      maxWidth: '90vw',
      height: 400,
      maxHeight: '90vh',
    },
    editDialogTitle: {
      paddingBottom: 0,
      position: 'relative',
    },
    editDialogIcon: {
      position: 'absolute',
      right: 20,
      top: 80,
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
    },
    editDialogContent: {
      paddingTop: theme.spacing(2),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    editDialogActions: {
      padding: theme.spacing(3),
      paddingTop: 0,
    },
    editMethodDetails: {
      marginBottom: theme.spacing(3),
      '& > p': {
        marginBottom: 0,
      },
    },
    terminalTitle: {
      padding: theme.spacing(2.5),
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      marginBottom: theme.spacing(1.5),
    },
    cardDialogTitle: {
      paddingBottom: 0,
      padding: theme.spacing(2.5),
    },
    spacedTitle: {
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    cardText: {
      fontWeight: 1000,
      fontSize: '14px',
      textAlign: 'right',
    },
    infoTitle: {
      paddingTop: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    cardTextDisabled: {
      fontWeight: 1000,
      fontSize: '14px',
      textAlign: 'right',
      color: theme.palette.uxGrey.disabled,
    },
    searchAdornment: {
      cursor: 'pointer',
    },
    dialogActions: {
      padding: theme.spacing(1, 2),
    },
    addCardContent: {
      paddingTop: theme.spacing(1),
    },
    cancelButton: {
      marginRight: theme.spacing(1),
    },
    snackBar: {
      minWidth: '100%',
      justifyContent: 'center',
    },
    snackBarMobile: {
      minWidth: '100%',
      justifyContent: 'center',
      left: 0,
      right: 0,
      bottom: 0,
    },
    snackBarAlert: {
      minWidth: '100%',
      justifyContent: 'center',
      fontWeight: 500,
      color: theme.palette.success.main,
    },
    requestListPaper: {
      // 3 rows plus column header height as default.
      height: 230,
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    requestListGridWrap: {
      height: '100%',
    },
    dataList: {
      height: '100%',
      width: '100%',
    },
    paymentTodayInput: {
      height: '100%',
      width: '100%',
    },
    removeButton: {
      marginLeft: theme.spacing(1),
    },
    timeIcon: {
      fontSize: '16px',
      position: 'absolute',
      zIndex: 1000,
      marginTop: '0px',
      marginLeft: '0px',
    },
    timeIconSelected: {
      color: theme.palette.primary.main,
    },
    dialogHidden: {
      display: 'none',
    },
    amountDiv: {
      display: 'flex',
    },
    infoText: {
      color: theme.palette.primary.main,
      display: 'flex',
      paddingTop: theme.spacing(0.5),
    },
    infoIcon: {
      marginRight: theme.spacing(0.5),
    },
  }),
);

const getPaymentMethodIcon = (
  paymentMethod: PaymentMethod | undefined,
  isDisabled: boolean,
  length: number,
  isCard?: boolean,
  methodToken?: Token,
): JSX.Element => {
  if (paymentMethod?.type === PaymentMethodType.PaymentBankUs) {
    return (
      <BankIcon
        style={{
          height: length,
          width: isCard ? length : length / 1.3,
          opacity: isDisabled ? 0.5 : 1,
          padding: isCard ? (length - length / 1.3) / 2 : 0,
        }}
      />
    );
  }
  const cardBrand = paymentMethod?.creditCard?.cardBrand || methodToken?.creditCard?.cardBrand;
  if (cardBrand === CardBrand.Amex) {
    return <img src={Amex} style={{ height: length, width: length, opacity: isDisabled ? 0.5 : 1 }} alt="Americant Express"></img>;
  }
  if (cardBrand === CardBrand.Diners) {
    return <img src={Diners} style={{ height: length, width: length, opacity: isDisabled ? 0.5 : 1 }} alt="Diners Club"></img>;
  }
  if (cardBrand === CardBrand.Discover) {
    return <img src={Discover} style={{ height: length, width: length, opacity: isDisabled ? 0.5 : 1 }} alt="Discover"></img>;
  }
  if (cardBrand === CardBrand.Jcb) {
    return <img src={Jcb} style={{ height: length, width: length, opacity: isDisabled ? 0.5 : 1 }} alt="JCB"></img>;
  }
  if (cardBrand === CardBrand.Mastercard) {
    return <img src={Mastercard} style={{ height: length, width: length, opacity: isDisabled ? 0.5 : 1 }} alt="Mastercard"></img>;
  }
  if (cardBrand === CardBrand.Visa) {
    return <img src={Visa} style={{ height: length, width: length, opacity: isDisabled ? 0.5 : 1 }} alt="Visa"></img>;
  }
  return <HelpOutlineIcon />;
};
interface NumberFormatCustomProps {
  onChange: (event: { target: { value: string } }) => void;
}

const PhoneNumberFormat = (props: NumberFormatCustomProps) => {
  const { onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      format="(###) ###-####"
    />
  );
};

const PaymentVirtualTerminal: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const history = useHistory();
  const vtGridApi = useGridApiRef();
  const iframeErrorMessage = 'An error occured. Please check the data submitted and try again.';
  const orderInfoHeaderText = 'Order Information';
  const paymentInfoHeaderText = 'Payment Information';
  const tenantId = useSelector(selectTenantId);
  const tenantAccount = useSelector(selectTenantAccount);
  const selectedRequestsToPay = useSelector(selectRequestsToPay);
  const matchedMethods = useSelector(selectMatchedMethods);
  const isQueryMethodsByEmailInFlight = useSelector(selectIsQueryMethodsByEmailInFlight);
  const defaultCurrency = useSelector(selectDefaultCurrency);
  const createPaymentStatus = useSelector(selectCreatePaymentStatus);
  const createPaymentMethodError = useSelector(selectCreatePaymentMethodError);
  const createPaymentError = useSelector(selectPaymentError);
  const isCustomerAmountValid = useSelector(selectIsCustomerAmountValid);
  const isCustomerEmailValid = useSelector(selectIsCustomerEmailValid);
  const isSearchEmailOrNameValid = useSelector(selectIsSearchEmailOrNameValid);
  const isCustomerPhoneValid = useSelector(selectIsCustomerPhoneValid);
  const isCustomerPostalValid = useSelector(selectIsCustomerPostalValid);
  const isCustomerCountryCodeValid = useSelector(selectIsCustomerCountryCodeValid);
  const isCustomerNameValid = useSelector(selectIsCustomerNameValid);
  const isCustomerDescriptionValid = useSelector(selectIsCustomerDescriptionValid);
  const isMethodInfoValid = useSelector(selectIsMethodInfoValid);
  const isPaymentVirtualTerminalValid = useSelector(selectIsPaymentVirtualTerminalValid);
  const isCreatePaymentInFlight = useSelector(selectIsCreatePaymentInFlight);
  const isUpdating = useSelector(selectIsUpdatePaymentMethodInFlight);
  const updateError = useSelector(selectUpdatePaymentMethodError);
  const createdPaymentMethod = useSelector(selectCreatedPaymentMethod);
  const paymentsFeatures = useSelector(selectPaymentsFeatures);
  const paymentRequestsFeatures = useSelector(selectPaymentRequestsFeatures);
  const customerOptionList = useSelector(selectCustomerOptionList);
  const customerOptionError = useSelector(selectCustomerOptionError);
  const hasReachedPaymentMethodLimit = useSelector(selectHasReachedPaymentMethodLimit);
  const [requestsToPay, setRequestsToPay] = useState<GridRowModel[]>();
  const [requestToEdit, setRequestToEdit] = useState<GridRowModel>();
  const [requestsToPayRows, setRequestsToPayRows] = useState<GridRowModel[]>();
  const [amount, setAmount] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [poNumber, setPONumber] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [searchEmailOrName, setSearchEmailOrName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('');
  const [methodTimeLimit, setMethodTimeLimit] = useState<number>(0);
  const [country, setCountry] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [isPaymentSubmitted, setIsPaymentSubmitted] = useState(false);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [iframeError, setIframeError] = useState<string | undefined>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | undefined>();
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  // Default save card for future use to TRUE.
  const [saveCard, setSaveCard] = useState<boolean>(true);
  const [editMethod, setEditMethod] = useState<PaymentMethod | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState<boolean>(false);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [queriedEmailOrName, setQueriedEmailOrName] = useState<string>('');
  const [isIframeVisible, setIsIframeVisible] = useState(false);
  const [paymentIdempotencyKey, setPaymentIdempotencyKey] = useState<string | undefined>();
  const [hasRequestsToPay, setHasRequestsToPay] = useState<boolean>(!!(selectedRequestsToPay && selectedRequestsToPay.length > 0));
  const [origTenantId, setOrigTenantId] = useState<string | undefined>(tenantId);
  const [vtCustomer, setVtCustomer] = useState<Customer | undefined>();
  const [customerOption, setCustomerOption] = useState<CustomerOption | undefined>(undefined);
  const [customerFieldTextValue, setCustomerFieldTextValue] = useState<string>('');
  const { apteanPay, sdkComponent, configure, mountComponent, cleanup } = useApteanPay();

  const isCustomerEnabled = !!tenantAccount?.settings?.features?.customers?.enabled;

  const paymentInformationHeaderText = `${vtCustomer && isCustomerEnabled ? 'Select a customer or' : ''} ${
    vtCustomer && isCustomerEnabled ? 'enter' : 'Enter'
  } an email address or name to search for an existing payment method.`;
  const orderInformationHeaderText = 'Create a reference to an order, or use Description to indicate what a payment is for.';

  const onConfirmChange = (event: ChangeEvent, checked: boolean) => {
    setIsConfirmed(checked);
  };
  const onSaveCardChange = (event: ChangeEvent, checked: boolean) => {
    setSaveCard(checked);
  };
  const handleCustomerCountryCodeValid = (valid: boolean) => {
    dispatch(fetchIsCustomerCountryCodeValid(valid));
  };
  const handleCustomerNameValid = (valid: boolean) => {
    dispatch(fetchIsCustomerNameValid(valid));
  };
  const handlePaymentVirtualTerminalValid = (valid: boolean) => {
    dispatch(fetchIsPaymentVirtualTerminalValid(valid));
  };
  const handleMethodInfoValid = (valid: boolean) => {
    dispatch(fetchIsMethodInfoValid(valid));
  };
  const handleCustomerDescriptionValid = (valid: boolean) => {
    dispatch(fetchIsCustomerDescriptionValid(valid));
  };
  const handleCustomerEmailValid = (valid: boolean) => {
    dispatch(fetchIsCustomerEmailValid(valid));
  };
  const handleSearchEmailOrNameValid = (valid: boolean) => {
    dispatch(fetchIsSearchEmailOrNameValid(valid));
  };
  const handleCustomerPhoneValid = (valid: boolean) => {
    dispatch(fetchIsCustomerPhoneValid(valid));
  };
  const handleCustomerAmountValid = (valid: boolean) => {
    dispatch(fetchIsCustomerAmountValid(valid));
  };
  const handleCustomerPostalValid = (valid: boolean) => {
    dispatch(fetchIsCustomerPostalValid(valid));
  };
  const clearPaymentStatus = () => {
    dispatch(fetchCreatePaymentStatus(undefined));
    dispatch(fetchPaymentError(undefined));
  };
  const clearMatchedMethods = () => {
    dispatch(fetchMatchedMethods());
    // Clear selected method.
    setSelectedPaymentMethod(undefined);
    setQueriedEmailOrName('');
  };
  const lookupMethodsFromEmailOrName = (emailOrName: string) => {
    setIsConfirmed(false);
    dispatch(fetchCreatedPaymentMethod(undefined));
    setSelectedPaymentMethod(undefined);
    if (emailOrName && tenantId && isSearchEmailOrNameValid) {
      dispatch(fetchPaymentMethodsByEmailOrName(emailOrName, tenantId));
    } else {
      clearMatchedMethods();
    }
    if (!createdPaymentMethod || (selectedPaymentMethod && createdPaymentMethod.id !== selectedPaymentMethod.id)) {
      // Clear the selected method
      setSelectedPaymentMethod(undefined);
    }
  };
  const lookupMethodsFromCustomer = (customerId: string) => {
    setIsConfirmed(false);
    if (customerId && tenantId) {
      dispatch(fetchPaymentMethodsByCustomer(customerId, tenantId));
    } else {
      clearMatchedMethods();
    }
    if (!createdPaymentMethod || (selectedPaymentMethod && createdPaymentMethod.id !== selectedPaymentMethod.id)) {
      // Clear the selected method
      setSelectedPaymentMethod(undefined);
    }
  };
  const resetStoreData = () => {
    dispatch(fetchRequestsToPay(undefined));
    dispatch(fetchCreatePaymentMethodError(undefined));
    dispatch(fetchPaymentError(undefined));
    dispatch(fetchMatchedMethods(undefined));
    dispatch(fetchCreatedPaymentMethod(undefined));
    dispatch(fetchHasReachedPaymentMethodLimit(false));
  };
  // Helper function to clear all data.
  const resetData = () => {
    setAmount('');
    setOrderNumber('');
    setInvoiceNumber('');
    setPONumber('');
    setDescription('');
    handleCustomerAmountValid(true);
    setSearchEmailOrName('');
    setSelectedPaymentMethod(undefined);
    setIsAddingMethod(false);
    setIsPaymentSubmitted(false);
    setVtCustomer(undefined);
    setHasRequestsToPay(false);
    handleCustomerDescriptionValid(true);
    handleSearchEmailOrNameValid(true);
    clearMatchedMethods();
    clearPaymentStatus();
    setSaveCard(true);
    setIsConfirmed(false);
    setRequestsToPay([]);
    resetStoreData();
  };

  const clearOneTimePaymentMethod = () => {
    if (createdPaymentMethod && !createdPaymentMethod.isLongLived) {
      // Clear the created payment method if it is not long lived.
      dispatch(fetchCreatedPaymentMethod(undefined));
      if (hasReachedPaymentMethodLimit) dispatch(fetchHasReachedPaymentMethodLimit(false));
    }
  };

  useEffect(() => {
    // When the component is first loaded check for payment requests to pay. If they exist, set it to a local state and clear it.
    // Keep the state local to this component.
    if (selectedRequestsToPay && selectedRequestsToPay?.length > 0) {
      setRequestsToPay(selectedRequestsToPay);
      setHasRequestsToPay(true);
      // Set customer associated to the requests as the context for the payment.
      // Since only one customer/email can be associated with payments being paid in the terminal, take the first requests customer/email and look up the methods.
      if (selectedRequestsToPay[0]?.customer?.name) {
        setVtCustomer(selectedRequestsToPay[0]?.customer as Customer);
      }
    } else {
      setVtCustomer(undefined);
    }
    // On unmount, reset data.
    return () => {
      resetData();
    };
  }, []);

  useEffect(() => {
    // Fetch shared methods for the customer if one exists for the vt state.
    if (vtCustomer && vtCustomer.id) {
      lookupMethodsFromCustomer(vtCustomer.id);
      setSaveCard(false);
    } else {
      setCustomerOption(undefined);
      setSaveCard(true);
      dispatch(fetchMatchedMethods(undefined));
      dispatch(fetchCreatedPaymentMethod(undefined));
      dispatch(fetchHasReachedPaymentMethodLimit(false));
    }
    clearOneTimePaymentMethod();
  }, [vtCustomer]);

  useEffect(() => {
    // Only perform this logic if no requests to pay are present (customer selection field is used).
    if (!hasRequestsToPay) {
      if (customerOption?.id !== vtCustomer?.id) {
        // Check if field value from the customer select field is different.
        setVtCustomer(customerOption as Customer);
      }
      if (!customerOption) {
        setVtCustomer(undefined);
        setCustomerFieldTextValue('');
      }
    }
  }, [customerOption?.id]);

  useEffect(() => {
    if (!matchedMethods || matchedMethods.length === 0) {
      setSelectedPaymentMethod(undefined);
    }
  }, [matchedMethods]);

  useEffect(() => {
    // If the tenant ID changes - user switches tenant, clear all data.
    if (tenantId) {
      if (customerOptionList) {
        dispatch(clearCustomerOptionList());
      }
      if (origTenantId !== tenantId) {
        resetData();
        setOrigTenantId(tenantId);
      }
    }
  }, [tenantId]);

  useEffect(() => {
    if (addCardOpen && tenantId) {
      configure(tenantId, vtCustomer?.id, 'card');
    }
  }, [addCardOpen, tenantId, vtCustomer?.id]);

  useEffect(() => {
    if (apteanPay && sdkComponent && addCardOpen) {
      setIframeError(undefined);
      setIsAddingMethod(true);
      mountComponent('js_sdk_card', '#js_sdk_button', () => {
        setIsAddingMethod(false);
      });
      setIsIframeVisible(true);
    }
  }, [sdkComponent]);
  useEffect(() => {
    if (addBankOpen && tenantId) {
      configure(tenantId, vtCustomer?.id, 'bank');
    }
  }, [addBankOpen, tenantId, vtCustomer?.id]);

  useEffect(() => {
    if (apteanPay && sdkComponent && addBankOpen) {
      console.log('Mounting bank component');
      setIsAddingBank(true);
      mountComponent('js_sdk_bank', '#js_sdk_button', () => {
        console.log('Bank component mounted');
        setIsAddingBank(false);
      });
    }
  }, [sdkComponent, addBankOpen]);

  const handlePaymentSuccessToast = (amount: string) => {
    const formatedAmount = parseFloat(amount).toFixed(2);
    let contactEmail = '';

    if (selectedPaymentMethod) {
      if (selectedPaymentMethod.type === PaymentMethodType.CreditCard) {
        contactEmail = selectedPaymentMethod.creditCard?.cardHolder?.email || '';
      } else if (selectedPaymentMethod.type === PaymentMethodType.PaymentBankUs) {
        contactEmail = selectedPaymentMethod.paymentBank?.accountHolder?.email || '';
      }
    }

    const messageText = `Your payment of ${
      defaultCurrency === CurrencyType.Cad ? 'CA' : ''
    }$${formatedAmount} was successfully submitted, and a confirmation email has been sent to ${
      contactEmail || 'the email associated with the chosen payment method.'
    }`;
    dispatch(fetchCreatePaymentSuccessMessage(messageText));
  };

  const makePaymentForRequests = (
    paymentRequests: GridRowModel[],
    paymentAmount: number,
    paymentMethod: PaymentMethod,
    customerCurrency: CurrencyType,
    orderNumber: string,
    customerPONumber: string,
    invoiceNumber: string,
    description: string,
  ) => {
    if (
      paymentIdempotencyKey &&
      paymentAmount &&
      paymentAmount >= 100 &&
      paymentMethod &&
      ((paymentMethod.type === PaymentMethodType.CreditCard && paymentMethod.creditCard) ||
        (paymentMethod.type === PaymentMethodType.PaymentBankUs && paymentMethod.paymentBank)) &&
      !isCreatePaymentInFlight &&
      tenantId
    ) {
      let address = { postalCode: '', country: '' };
      let phone = { countryCode: '', number: '' };

      if (paymentMethod.type === PaymentMethodType.CreditCard && paymentMethod.creditCard) {
        const { cardHolder } = paymentMethod.creditCard;
        address = {
          postalCode: cardHolder?.address?.postalCode || '',
          country: cardHolder?.address?.country || '',
        };
        phone = {
          countryCode: cardHolder?.phone?.countryCode || '',
          number: cardHolder?.phone?.number || '',
        };
      } else if (paymentMethod.type === PaymentMethodType.PaymentBankUs && paymentMethod.paymentBank) {
        const { accountHolder } = paymentMethod.paymentBank;
        address = {
          postalCode: accountHolder?.address?.postalCode || '',
          country: accountHolder?.address?.country || '',
        };
        phone = {
          countryCode: accountHolder?.phone?.countryCode || '',
          number: accountHolder?.phone?.number || '',
        };
      }

      const paymentRequestAllocation: PaymentRequestAllocationInput[] = [];
      let customerId = '';
      paymentRequests.forEach((p: GridRowModel) => {
        const { paymentToday, partialReason, id, customer } = p;
        // eslint-disable-next-line no-underscore-dangle
        if (id && paymentToday) {
          customerId = customer ? customer.id : customerId;
          paymentRequestAllocation.push({
            amount: paymentToday,
            paymentRequestId: id,
            partialPaymentReason: partialReason,
          });
        }
      });
      dispatch(
        captureCreatePaymentForRequestsWithMethod(
          paymentMethod,
          paymentAmount,
          paymentRequestAllocation,
          customerCurrency,
          {
            address,
            phone,
            lineItems: [
              {
                currency: customerCurrency,
                description,
                price: paymentAmount,
                quantity: 1,
              },
            ],
          },
          paymentIdempotencyKey,
          orderNumber,
          customerPONumber,
          invoiceNumber,
          description,
          customerId,
        ),
      );
    }
  };

  const makePayment = (
    paymentAmount: number,
    paymentMethod: PaymentMethod,
    customerCurrency: CurrencyType,
    orderNumber: string,
    customerPONumber: string,
    invoiceNumber: string,
    description: string,
  ) => {
    if (
      paymentIdempotencyKey &&
      paymentAmount &&
      paymentAmount >= 100 &&
      paymentMethod &&
      ((paymentMethod.type === PaymentMethodType.CreditCard && paymentMethod.creditCard) ||
        (paymentMethod.type === PaymentMethodType.PaymentBankUs && paymentMethod.paymentBank)) &&
      !isCreatePaymentInFlight &&
      tenantId
    ) {
      const customerId = vtCustomer ? vtCustomer.id : undefined;

      let address = { postalCode: '', country: '' };
      let phone = { countryCode: '', number: '' };

      if (paymentMethod.type === PaymentMethodType.CreditCard && paymentMethod.creditCard) {
        const { cardHolder } = paymentMethod.creditCard;
        address = {
          postalCode: cardHolder?.address?.postalCode || '',
          country: cardHolder?.address?.country || '',
        };
        phone = {
          countryCode: cardHolder?.phone?.countryCode || '',
          number: cardHolder?.phone?.number || '',
        };
      } else if (paymentMethod.type === PaymentMethodType.PaymentBankUs && paymentMethod.paymentBank) {
        const { accountHolder } = paymentMethod.paymentBank;
        address = {
          postalCode: accountHolder?.address?.postalCode || '',
          country: accountHolder?.address?.country || '',
        };
        phone = {
          countryCode: accountHolder?.phone?.countryCode || '',
          number: accountHolder?.phone?.number || '',
        };
      }

      dispatch(
        captureCreatePaymentWithMethod(
          paymentMethod,
          paymentAmount,
          customerCurrency,
          {
            address,
            phone,
            lineItems: [
              {
                currency: customerCurrency,
                description,
                price: paymentAmount,
                quantity: 1,
              },
            ],
          },
          paymentIdempotencyKey,
          orderNumber,
          customerPONumber,
          invoiceNumber,
          description,
          customerId,
        ),
      );
    }
  };

  useEffect(() => {
    const uid = uuid4();
    setPaymentIdempotencyKey(uid);
    handlePaymentVirtualTerminalValid(checkIsPaymentVirtualTerminalValid(amount, description, selectedPaymentMethod, isConfirmed));
    if (selectedPaymentMethod && !selectedPaymentMethod.isLongLived) {
      // Set the banner of the time remaining for cards which are not long lived.
      const limit = new Date(selectedPaymentMethod.createdAt).getTime() + 900000; // + 15 minutes from creation.
      setMethodTimeLimit(limit);
    } else {
      setMethodTimeLimit(0);
    }
  }, [amount, description, isConfirmed, selectedPaymentMethod]);

  useEffect(() => {
    const uid = uuid4();
    setPaymentIdempotencyKey(uid);
    handleMethodInfoValid(checkIsMethodInfoValid(customerEmail, customerName, country, postalCode, countryCode, phoneNumber));
  }, [customerEmail, customerName, country, postalCode, countryCode, phoneNumber]);

  useEffect(() => {
    if (createPaymentError) {
      setIsPaymentSubmitted(false);
    }
  }, [createPaymentError]);

  useEffect(() => {
    if (createPaymentMethodError) {
      setIsAddingMethod(false);
    }
  }, [createPaymentMethodError]);

  useEffect(() => {
    // when the selected method changes, uncheck confirmation.
    setIsConfirmed(false);
  }, [selectedPaymentMethod]);

  useEffect(() => {
    if (createdPaymentMethod && matchedMethods) {
      const updatedMethod = matchedMethods.find(m => m.id === createdPaymentMethod.id);
      if (updatedMethod) {
        setSelectedPaymentMethod(updatedMethod);
      }
    }
  }, [matchedMethods, createdPaymentMethod]);

  useEffect(() => {
    if (!createPaymentMethodError && createdPaymentMethod) {
      // Card was added, we have the method, close the dialog.
      setSelectedPaymentMethod(createdPaymentMethod);
      setIsAddingMethod(false);
      setAddCardOpen(false);
      setAddBankOpen(false);
    } else {
      setSelectedPaymentMethod(undefined);
      setMethodTimeLimit(0);
    }
  }, [createdPaymentMethod]);

  useEffect(() => {
    if (
      !createPaymentError &&
      createPaymentStatus &&
      createPaymentStatus?.payment?.status !== PaymentStatus.Failed &&
      createPaymentStatus?.payment?.status !== PaymentStatus.Canceled
    ) {
      handlePaymentSuccessToast(amount);
      setTimeout(() => {
        resetData();
        history.push(RoutePath.Payments);
      }, 2500);
    }
  }, [createPaymentStatus]);

  const handleCancelPayment = () => {
    resetData();
    history.push(RoutePath.Payments);
  };

  const makePaymentWithSelectedPaymentMethod = () => {
    const paymentAmount = Math.round(parseFloat(amount) * 100);
    if (paymentAmount >= 100) {
      if (selectedPaymentMethod) {
        if (requestsToPayRows && requestsToPayRows.length > 0) {
          makePaymentForRequests(
            requestsToPayRows,
            paymentAmount,
            selectedPaymentMethod,
            (defaultCurrency || 'USD') as CurrencyType,
            orderNumber.trim(),
            poNumber.trim(),
            invoiceNumber.trim(),
            description.trim(),
          );
        } else {
          makePayment(
            paymentAmount,
            selectedPaymentMethod,
            (defaultCurrency || 'USD') as CurrencyType,
            orderNumber.trim(),
            poNumber.trim(),
            invoiceNumber.trim(),
            description.trim(),
          );
        }
      }
    }
  };

  const onTokenCreate = (token?: ApteanPaySDKToken, errors?: ApteanPaySDKError[]) => {
    if (token && tenantId) {
      dispatch(captureCreatePaymentMethod(token.id, saveCard, tenantId, vtCustomer?.id));
    }
    if (errors) {
      const messages = errors.map(error => error.message).join('. ');
      setIframeError(messages || iframeErrorMessage);
    }
    setIsAddingMethod(false);
  };

  const onTokenCreateBank = (token?: ApteanPaySDKToken, errors?: ApteanPaySDKError[]) => {
    console.log('Token received:', token);
    if (token && tenantId) {
      dispatch(captureCreatePaymentMethod(token.id, saveCard, tenantId, vtCustomer?.id));
    }
    if (errors) {
      const messages = errors.map(error => error.message).join('. ');
      setIframeError(messages || iframeErrorMessage);
    }
    setIsAddingBank(false);
  };

  const handlePaymentSubmit = () => {
    if (selectedPaymentMethod) {
      setIsPaymentSubmitted(true);
      clearPaymentStatus();
      makePaymentWithSelectedPaymentMethod();
    }
  };

  //change event handlers
  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isCustomerAmountValid) {
      handleCustomerAmountValid(true);
    }

    const value = event.target.value.trim();
    setAmount(value);
  };

  const handleOrderNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setOrderNumber(value);
  };

  const handlePONumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setPONumber(value);
  };

  const handleInvoiceNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInvoiceNumber(value);
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isCustomerDescriptionValid) {
      handleCustomerDescriptionValid(true);
    }

    const { value } = event.target;
    setDescription(value);
  };

  const handleSearchEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value;
    const isSearchEmailOrNameValid = checkIsSearchEmailOrNameValid(email);
    handleSearchEmailOrNameValid(isSearchEmailOrNameValid);
    setSearchEmailOrName(email);
  };

  const handleCustomerEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isCustomerEmailValid) {
      handleCustomerEmailValid(true);
    }
    const value = event.target.value.trim();
    setCustomerEmail(value);
  };

  const handlePhoneNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isCustomerPhoneValid) {
      handleCustomerPhoneValid(true);
    }

    const value = event.target.value.trim();
    setPhoneNumber(value);
  };

  const handleCountryCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isCustomerCountryCodeValid) {
      handleCustomerCountryCodeValid(true);
    }

    const value = event.target.value.trim();
    setCountryCode(value);
  };

  const handleCountryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const countrySelected = event.target.value;
    const countryCode = countrySelected
      ? `+${
          allCountries.find(item => {
            return item.abbr === countrySelected;
          })?.code
        }`
      : '';
    setCountry(countrySelected);
    setCountryCode(countryCode);
    handleCustomerCountryCodeValid(true);

    if (postalCode) {
      handleCustomerPostalValid(checkIsPostalCodeValid(postalCode, countrySelected));
    }
  };

  const handlePostalCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isCustomerPostalValid) {
      handleCustomerPostalValid(true);
    }

    const postalValue = event.target.value;
    setPostalCode(postalValue);
  };

  const handleCustomerNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isCustomerNameValid) {
      handleCustomerNameValid(true);
    }

    const nameValue = event.target.value;
    setCustomerName(nameValue);
  };

  // onBlur validators
  const validateAmount = () => {
    handleCustomerAmountValid(checkIsAmountValid(amount));
  };

  const validateDescription = () => {
    handleCustomerDescriptionValid(checkIsDescriptionValid(description));
  };

  const validateSearchEmailOrName = () => {
    const isSearchEmailOrNameValid = checkIsSearchEmailOrNameValid(searchEmailOrName);
    handleSearchEmailOrNameValid(isSearchEmailOrNameValid);
    if (isSearchEmailOrNameValid) {
      // Only run query if the emails differ. User may hit enter or click the search end adornment and then click on a card returned.
      // This click will blur the field, causing the validate to execute again, which will re-query the methods. This prevents that double flow from occurring.
      if (queriedEmailOrName !== searchEmailOrName) {
        setQueriedEmailOrName(searchEmailOrName);
        lookupMethodsFromEmailOrName(searchEmailOrName);
      }
    }
  };

  const validateEmail = () => {
    const isEmailValid = checkIsEmailValid(customerEmail);
    handleCustomerEmailValid(isEmailValid);
  };

  const validatePhoneNumber = () => {
    handleCustomerPhoneValid(checkIsPhoneNumberValid(phoneNumber));
  };

  const validateCountryCode = () => {
    handleCustomerCountryCodeValid(checkIsCountryCodeValid(countryCode));
  };

  const validatePostalCode = () => {
    handleCustomerPostalValid(checkIsPostalCodeValid(postalCode, country));
  };

  const validateCustomerName = () => {
    handleCustomerNameValid(checkIsFullNameValid(customerName));
  };

  const resetModalData = () => {
    dispatch(fetchIsCustomerEmailValid(true));
    dispatch(fetchCreatePaymentMethodError(undefined));
    handleCustomerNameValid(true);
    handleCustomerPostalValid(true);
    setCustomerName('');
    setCountryCode('');
    setSaveCard(true);
    handleCustomerCountryCodeValid(true);
    handleCustomerPhoneValid(true);
    setCountry('');
    setPhoneNumber('');
    setPostalCode('');
    setCustomerEmail('');
    setIframeError(undefined);
    setIsIframeVisible(false);
  };

  const handleAddCard = () => {
    resetModalData();
    // populating only if full email value
    const isValidSearchEmailValue = checkIsEmailValid(searchEmailOrName);
    if (isValidSearchEmailValue) setCustomerEmail(searchEmailOrName);
    setSaveCard(!vtCustomer);
    setAddCardOpen(true);
  };

  const handleAddBank = () => {
    resetModalData();
    const isValidSearchEmailValue = checkIsEmailValid(searchEmailOrName);
    if (isValidSearchEmailValue) setCustomerEmail(searchEmailOrName);
    setAddBankOpen(true);
  };

  // Cancel button handling on the add card dialog. Closes dialog.
  const handleCancelCard = () => {
    setAddCardOpen(false);
    cleanup();
    resetModalData();
  };
  const handleCloseBank = () => {
    setAddBankOpen(false);
    cleanup();
    resetModalData();
  };

  // Save card from the add card dialog.
  const handleSaveCard = () => {
    if (apteanPay?.createTokenCallback && sdkComponent && isCustomerNameValid && isCustomerEmailValid) {
      setIframeError(undefined);
      // Validate ptt card fields.
      if (document.querySelector('.CollectJSInlineIframe')) {
        const isCardNumberValid = !!document.querySelector('#CollectJSInlineccnumber.CollectJSValid');
        const isCardExpValid = !!document.querySelector('#CollectJSInlineccexp.CollectJSValid');
        const isCardCvvValid = !!document.querySelector('#CollectJSInlinecvv.CollectJSValid');
        if (!isCardNumberValid || !isCardExpValid || !isCardCvvValid) {
          setIframeError('Please ensure card information is valid.');
          return;
        }
      }
      setIsAddingMethod(true);
      const cardData: ApteanPaySDKCreateTokenCardData = {
        emailAddress: customerEmail,
        name: customerName,
        addressZip: postalCode,
        addressCountry: country,
        phoneCountryCode: countryCode,
        phoneNumber,
      };
      apteanPay.createTokenCallback(sdkComponent, cardData, onTokenCreate);
      cleanup();
    }
  };

  const handleSaveBank = () => {
    if (apteanPay?.createTokenCallback && sdkComponent) {
      setIframeError(undefined);
      const isValidEmail = checkIsEmailValid(customerEmail);
      const isValidPostal = checkIsPostalCodeValid(postalCode, country);

      if (!isValidEmail || !isValidPostal) {
        setIframeError('Please fill all required fields correctly');
        return;
      }
      const bankData: ApteanPaySDKCreateTokenCardData = {
        emailAddress: customerEmail,
        addressZip: postalCode,
        addressCountry: country,
        phoneCountryCode: countryCode,
        phoneNumber,
      };
      setIsAddingBank(true);
      apteanPay.createTokenCallback(sdkComponent, bankData, onTokenCreateBank);
      cleanup();
    }
  };

  const handleEditSave = async (paymentMethodId: string, email: string, phone: string, countryCode: string) => {
    try {
      dispatch(fetchUpdatePaymentMethodError(undefined));

      await dispatch(
        captureUpdatePaymentMethod({
          paymentMethodId,
          email,
          phone,
          countryCode,
        }),
      );
      if (createdPaymentMethod && createdPaymentMethod.id === paymentMethodId) {
        let updatedCreatedPaymentMethod: PaymentMethod;
        if (createdPaymentMethod.type === PaymentMethodType.CreditCard) {
          updatedCreatedPaymentMethod = {
            ...createdPaymentMethod,
            creditCard: {
              ...createdPaymentMethod.creditCard,
              cardHolder: {
                ...createdPaymentMethod.creditCard?.cardHolder,
                email,
                phone: {
                  number: phone,
                  countryCode,
                },
              },
            },
          };
        } else {
          updatedCreatedPaymentMethod = {
            ...createdPaymentMethod,
            paymentBank: {
              ...createdPaymentMethod.paymentBank,
              accountHolder: {
                ...createdPaymentMethod.paymentBank?.accountHolder,
                email,
                phone: {
                  number: phone,
                  countryCode,
                },
              },
            },
          };
        }
        dispatch(fetchCreatedPaymentMethod(updatedCreatedPaymentMethod));
      }
      if (vtCustomer?.id && tenantId) {
        dispatch(fetchPaymentMethodsByCustomer(vtCustomer.id, tenantId));
      } else if (queriedEmailOrName && tenantId) {
        dispatch(fetchPaymentMethodsByEmailOrName(queriedEmailOrName, tenantId));
      }

      setSelectedPaymentMethod(prev => {
        if (!prev || prev.id !== paymentMethodId) return prev;

        if (prev.type === PaymentMethodType.CreditCard) {
          return {
            ...prev,
            creditCard: {
              ...prev.creditCard,
              cardHolder: {
                ...prev.creditCard?.cardHolder,
                email,
                phone: {
                  number: phone,
                  countryCode,
                },
              },
            },
          };
        }
        if (prev.type === PaymentMethodType.PaymentBankUs) {
          return {
            ...prev,
            paymentBank: {
              ...prev.paymentBank,
              accountHolder: {
                ...prev.paymentBank?.accountHolder,
                email,
                phone: {
                  number: phone,
                  countryCode,
                },
              },
            },
          };
        }
        return prev;
      });
    } catch (error) {
      dispatch(fetchUpdatePaymentMethodError(error as Error));
    }
  };

  const getAddCardDialog = () => {
    return (
      <Dialog
        aria-label={'modify user dialog'}
        open={addCardOpen}
        disableScrollLock
        aria-labelledby="add-card-modal-title"
        maxWidth={'sm'}
        className={isIframeVisible ? '' : classes.dialogHidden}
      >
        <LoadingMask loading={isAddingMethod} />
        <div className={classes.cardDialogTitle}>
          <Grid container alignItems={'center'} justifyItems={'center'}>
            <Grid item className={classes.infoTitle}>
              <Typography id={'add-card-modal-title'} variant="title">
                Credit Card Information
              </Typography>
            </Grid>
            <Grid item height={45}>
              <img src={CreditCards} alt="credit_cards"></img>
            </Grid>
          </Grid>
        </div>
        <DialogContent>
          {createPaymentMethodError && (
            <Box className={classes.dialogContextError}>
              <ErrorIcon className={classes.errorIcon} /> {createPaymentMethodError?.message}
            </Box>
          )}
          <Grid container spacing={2} className={classes.addCardContent}>
            <Grid item xs={12}>
              <TextField
                id="card-name-id"
                fullWidth
                variant="outlined"
                label="Name on Card"
                aria-required="true"
                autoComplete="off"
                value={customerName}
                error={!isCustomerNameValid}
                helperText={isCustomerNameValid ? null : 'Invalid Name'}
                InputProps={{
                  'aria-describedby': `${isCustomerNameValid ? undefined : 'name-on-card-helpertext-id'}`,
                }}
                FormHelperTextProps={{ id: 'name-on-card-helpertext-id' }}
                onChange={handleCustomerNameChange}
                onBlur={validateCustomerName}
                disabled={isAddingMethod}
                data-cy="name-on-card"
                inputProps={{
                  maxLength: 26,
                }}
              />
            </Grid>
            <Grid item container xs={12} className={classes.cardFrameContainer}>
              {iframeError && (
                <Box className={classes.dialogContextError}>
                  <ErrorIcon className={classes.errorIcon} /> {iframeError}
                </Box>
              )}
              <Grid item xs={12} className={classes.iFrameGridItem} id="js_sdk_card" sx={{ minHeight: 159 }} />
              <Grid item xs={12} className={classes.saveCardCheckboxGridItem}>
                <FormControlLabel
                  control={<Checkbox checked={saveCard} color="primary" onChange={onSaveCardChange} />}
                  label={`Save card ${vtCustomer ? 'to Customer Wallet' : 'for future use'}`}
                  data-cy={'save-card'}
                  labelPlacement="end"
                  classes={{ label: classes.saveCardHelperText }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Typography variant="subtitle1" className={classes.helperTextBottomPadding}>
            Billing Address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                id="email-address-id"
                fullWidth
                variant="outlined"
                label="Email Address"
                aria-required="true"
                autoComplete="off"
                type="email"
                value={customerEmail}
                error={!isCustomerEmailValid}
                helperText={isCustomerEmailValid ? null : 'Invalid Email Address'}
                InputProps={{
                  'aria-describedby': `${isCustomerEmailValid ? undefined : 'email-address-helpertext-id'}`,
                }}
                FormHelperTextProps={{ id: 'email-address-helpertext-id' }}
                onChange={handleCustomerEmailChange}
                onBlur={validateEmail}
                data-cy="add-card-customer-email"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth onChange={handleCountryChange} disabled={isAddingMethod}>
                <InputLabel id="LabelCountry">Country</InputLabel>
                <Select
                  displayEmpty={true}
                  labelId="LabelCountry"
                  value={country}
                  native
                  label={'Country'}
                  inputProps={{ 'aria-label': 'country' }}
                  data-cy="country"
                >
                  <option key={-1} value={''}></option>
                  {allCountries.map(country => {
                    return (
                      <option key={country.abbr} value={country.abbr}>
                        {country.name}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="postal-code-id"
                fullWidth
                variant="outlined"
                label="Postal Code"
                aria-required="true"
                autoComplete="off"
                error={!isCustomerPostalValid}
                helperText={isCustomerPostalValid ? null : 'Invalid Postal Code'}
                InputProps={{
                  'aria-describedby': `${isCustomerPostalValid ? undefined : 'postal-code-helpertext-id'}`,
                }}
                FormHelperTextProps={{ id: 'postal-code-helpertext-id' }}
                inputProps={{ maxLength: 10 }}
                value={postalCode}
                onChange={handlePostalCodeChange}
                onBlur={validatePostalCode}
                data-cy="postal-code"
                disabled={isAddingMethod}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                id="country-code-id"
                variant="outlined"
                fullWidth
                value={countryCode}
                aria-required="true"
                autoComplete="off"
                onChange={handleCountryCodeChange}
                onBlur={validateCountryCode}
                error={!isCustomerCountryCodeValid}
                helperText={isCustomerCountryCodeValid ? null : `Invalid Country Code.`}
                InputProps={{
                  'aria-describedby': `${isCustomerCountryCodeValid ? undefined : 'country-code-helpertext-id'}`,
                }}
                FormHelperTextProps={{ id: 'country-code-helpertext-id' }}
                label="Country Code"
                data-cy="country-code"
                disabled={isAddingMethod}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                id="phone-number-id"
                variant="outlined"
                fullWidth
                value={phoneNumber}
                type="tel"
                aria-required="true"
                autoComplete="off"
                error={!isCustomerPhoneValid}
                helperText={isCustomerPhoneValid ? null : `Invalid Phone Number.`}
                FormHelperTextProps={{ id: 'phone-number-helpertext-id' }}
                onChange={handlePhoneNumberChange}
                onBlur={validatePhoneNumber}
                label="Phone Number"
                data-cy="phone-number"
                InputProps={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  inputComponent: PhoneNumberFormat as any,
                  'aria-describedby': `${isCustomerPhoneValid ? undefined : 'phone-number-helpertext-id'}`,
                }}
                InputLabelProps={phoneNumber ? { shrink: true } : {}} //workaround for label overlap when a phone number is present
                disabled={isAddingMethod}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            className={classes.cancelButton}
            color="primary"
            variant="outlined"
            data-cy="cancel-add-card"
            onClick={handleCancelCard}
            disabled={isAddingMethod}
          >
            CANCEL
          </Button>
          <Button
            disabled={!isMethodInfoValid || isAddingMethod}
            color="primary"
            variant="contained"
            data-cy="save-new-card"
            onClick={handleSaveCard}
            id="js_sdk_button"
          >
            SAVE
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  const getBillingDetailsRow = (paymentMethod: PaymentMethod) => {
    const isCreditCard = paymentMethod.type === PaymentMethodType.CreditCard;
    const isBankAccount = paymentMethod.type === PaymentMethodType.PaymentBankUs;
    if (isCreditCard) {
      const method = paymentMethod.creditCard;
      const cardHolder = method?.cardHolder;
      const address = cardHolder?.address;
      const email = cardHolder?.email;
      return (
        <TableRow>
          <TableCell className={classes.methodDetailsRowText}>{cardHolder?.holderName}</TableCell>
          <TableCell className={classes.methodDetailsRowText}>{email}</TableCell>
          <TableCell className={classes.methodDetailsRowText}>{`${method?.expirationMonth}/${method?.expirationYear}`}</TableCell>
          <TableCell className={classes.methodDetailsRowText}>{`${address?.line1 ? address?.line1 : ''} ${
            address?.line2 ? address?.line2 : ''
          } ${address?.postalCode}, ${address?.country}`}</TableCell>
        </TableRow>
      );
    }
    if (isBankAccount) {
      const method = paymentMethod.paymentBank;
      const accountHolder = method?.accountHolder;
      return (
        <TableRow>
          <TableCell className={classes.methodDetailsRowText}>{accountHolder?.holderName}</TableCell>
          <TableCell className={classes.methodDetailsRowText}>{accountHolder?.email}</TableCell>
          <TableCell className={classes.methodDetailsRowText}>-</TableCell>
          <TableCell className={classes.methodDetailsRowText}>
            {`${accountHolder?.address?.postalCode || ''}, ${accountHolder?.address?.country || ''}`}
          </TableCell>
        </TableRow>
      );
    }
    return <></>;
  };

  const confirmLabel = 'Yes, I confirm the above payment and billing details are correct.';
  const getConfirmAriaLabel = () => {
    let details;
    const creditCard = selectedPaymentMethod?.creditCard;
    if (creditCard) {
      const cardHolder = creditCard?.cardHolder;
      const address = cardHolder?.address;
      details = `Name on Card=${cardHolder?.holderName} Email=${cardHolder?.email} Expiry=${creditCard.expirationMonth}/${
        creditCard.expirationYear
      } Billing Address=${address?.line1 || ''} ${address?.line2 || ''} ${address?.postalCode} ${address?.country}`;
    }
    return `${details || ''} ${confirmLabel}`;
  };

  const getPaymentMethodsHelperText = () => {
    // If no searchEmail or queriedEmailOrName, so base helper text.
    if (isQueryMethodsByEmailInFlight) {
      return '';
    }
    if (!selectedPaymentMethod && matchedMethods && matchedMethods?.length > 0) {
      return 'Select an existing payment method or add a new payment method.';
    }
    if (searchEmailOrName && queriedEmailOrName === searchEmailOrName && isSearchEmailOrNameValid) {
      // Valid, existing and current searched one.
      // No items.
      if (!matchedMethods || matchedMethods?.length <= 0) {
        return 'No payment methods (credit cards or bank accounts) are associated with the entered email or name. Search using a different email/name or add a new payment method.';
      }
      // If items exist, this will be hidden and cards will be shown.
    }
    if (!vtCustomer && (!isQueryMethodsByEmailInFlight || searchEmailOrName !== queriedEmailOrName)) {
      return 'Search for existing payment methods or add a new payment method.';
    }
    if (vtCustomer && (!matchedMethods || matchedMethods?.length <= 0)) {
      return 'Customer has no shared payment methods. You may add a new card for this payment.';
    }
    return '';
  };

  const getRequestsToPayRows = () => {
    let paymentTodayTotal = 0;
    // Need to use Grid Row Model instead of payment model to allow the new paymentToday field which is editable.
    const rows = requestsToPay?.map((row: Maybe<GridRowModel>) => {
      const node = row;
      // eslint-disable-next-line no-underscore-dangle
      const paymentRequest = node._raw;
      if (!node) {
        return {} as GridRowModel;
      }
      const discountEndDate = DateTime.fromISO(node.discountEndDate);
      const doesDiscountApply = discountEndDate.isValid && discountEndDate > DateTime.utc();
      const discountAmount = doesDiscountApply && node.discountAmount ? node.discountAmount : 0;
      const amountAfterDiscount = (paymentRequest?.totalDue || node.totalDue || 0) - discountAmount;
      const paymentToday = node.paymentToday || amountAfterDiscount;
      paymentTodayTotal += paymentToday || 0;
      let { referenceNumber } = node;
      referenceNumber = referenceNumber.length > 9 ? `***${referenceNumber.slice(-9)}` : referenceNumber;
      return {
        _raw: node,
        id: node.id,
        customer: node.customer,
        communications: node.communications,
        referenceNumber,
        editButton: node,
        discountAmount: node.discountAmount,
        discountEndDate: node.discountEndDate,
        dueDate: node.dueDate ? new Date(node.dueDate as string).toLocaleDateString() : '',
        rowTotalDue: amountAfterDiscount,
        totalDue: paymentRequest?.totalDue || node.totalDue || 0,
        payments: node.payments,
        partialReason: node.partialReason,
        paymentToday,
      } as GridRowModel;
    }) as GridRowModel[];
    setAmount((paymentTodayTotal / 100).toString());
    return rows;
  };

  const onCellEditCommit = (params: GridCellEditCommitParams) => {
    // When a cell edit ends, update the rows to recalculate the payment today total.
    if (params) {
      vtGridApi.current.updateRows([{ id: params.id, paymentToday: parseFloat(params.value) } as GridRowModelUpdate]);
      // Set the base array of rows so the rows get rebuilt with the new data.
      setRequestsToPay(vtGridApi.current.getSortedRows());
    }
  };

  const handleRequestRemove = (request: GridRowModel) => {
    // Remove the request from the requestsToPay array.
    if (request) {
      const filteredRows = requestsToPay?.filter(pR => pR.id !== request.id);
      setRequestsToPay(filteredRows && filteredRows.length > 0 ? filteredRows : undefined);
      const hasRequestsToPay = !!(filteredRows && filteredRows.length > 0);
      setHasRequestsToPay(hasRequestsToPay);
      if (!hasRequestsToPay) {
        setVtCustomer(undefined);
        dispatch(fetchMatchedMethods(undefined));
      }
    }
  };

  // Un-comment if inline editing is desired.
  // const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const newValue = event.target.value; // The new value entered by the user
  //   vtGridApi.current.setEditCellValue({
  //     id: event.target.id,
  //     field: 'paymentToday',
  //     value: parseFloat(newValue) * 100,
  //   } as GridCellEditCommitParams);
  // };

  const requestsToPayColumns: GridColDef[] = [
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'referenceNumber',
      sortable: false,
      headerName: 'Reference #',
      flex: 0.22,
      minWidth: 180,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'dueDate',
      sortable: false,
      headerName: 'Due Date',
      flex: 0.22,
      minWidth: 120,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'rowTotalDue',
      headerAlign: 'right',
      align: 'right',
      sortable: false,
      headerName: 'Amount',
      valueFormatter: (params: GridValueFormatterParams) => {
        return new Intl.NumberFormat('en', {
          style: 'currency',
          currency: defaultCurrency || 'USD',
          currencyDisplay: 'symbol',
        }).format((params.value || 0) / 100);
      },
      flex: 0.22,
      minWidth: 150,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'paymentToday',
      headerAlign: 'right',
      align: 'right',
      sortable: false,
      editable: false,
      type: 'number',
      headerName: 'Payment Today',
      flex: 0.22,
      minWidth: 200,
      valueFormatter: (params: GridValueFormatterParams) => {
        return new Intl.NumberFormat('en', {
          style: 'currency',
          currency: defaultCurrency || 'USD',
          currencyDisplay: 'symbol',
        }).format((params.value || 0) / 100);
      },
      // Remove commenting below if inline editing is desired.
      // editable: !!paymentsFeatures?.requirePartialPaymentReason,
      // eslint-disable-next-line react/display-name
      // renderEditCell: (params: GridRenderEditCellParams) => {
      //   if (params.id) {
      //     return (
      //       <TextField
      //         className={classes.paymentTodayInput}
      //         type="number"
      //         value={parseFloat(params.value) / 100}
      //         id={params.id.toString()}
      //         onChange={handleValueChange}
      //       />
      //     );
      //   }
      //   return null;
      // },
      // valueSetter: (params: GridValueSetterParams) => {
      //   return { ...params.row, paymentToday: (params.value / 100).toString() };
      // },
      // valueGetter: (params: GridValueGetterParams) => {
      //   return params.value;
      // },
      // valueParser: (value: unknown) => {
      //   return value;
      // },
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'removeButton',
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      headerName: '',
      flex: 0.3,
      minWidth: 200,
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams<Maybe<GridRowModel>>) => (
        <>
          {paymentRequestsFeatures?.partialPayment && (
            <Button
              variant={'text'}
              aria-label="Edit Request"
              data-cy="edit-request"
              onClick={() => {
                if (params.row) {
                  setRequestToEdit(params.row as GridRowModel);
                }
              }}
              startIcon={<Edit />}
            >
              Edit
            </Button>
          )}
          <Button
            variant={'text'}
            color={'error'}
            className={classes.removeButton}
            aria-label="Remove Request"
            data-cy="remove-request"
            onClick={() => {
              if (params.row) {
                handleRequestRemove(params.row as GridRowModel);
              }
            }}
            startIcon={<Close />}
          >
            Remove
          </Button>
        </>
      ),
    },
  ];

  const handleRequestClose = () => {
    setRequestToEdit(undefined);
  };

  const handleRequestSave = (editAmount: number, reason?: string | undefined) => {
    // Update the row being edited with the new values.
    if (requestToEdit) {
      vtGridApi.current.updateRows([{ id: requestToEdit.id, paymentToday: editAmount, partialReason: reason } as GridRowModelUpdate]);
      setRequestsToPay(vtGridApi.current.getSortedRows());
      handleRequestClose();
    }
  };

  const gridOptions: DataGridProProps = {
    rows: requestsToPayRows || [],
    'aria-label': 'Requests To Pay Table',
    columns: requestsToPayColumns,
    onCellEditCommit,
    apiRef: vtGridApi,
  };

  useEffect(() => {
    const rows = getRequestsToPayRows();
    // Build the rows again when the requests to pay changes.
    setRequestsToPayRows(rows);
  }, [requestsToPay]);

  const titleText = hasRequestsToPay ? 'Make Payment' : 'Add New Payment';
  const subtitleText = hasRequestsToPay ? 'Payment Summary' : 'Enter payment details';
  return (
    <Container className={classes.terminalWrap} role="region" aria-label={`${titleText} ${subtitleText}`}>
      <Helmet>
        <meta name="ai:viewId" content="payment"></meta>
        <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Payment"></meta>
        <title>Aptean Pay Merchant Portal - Payment</title>
      </Helmet>
      <LoadingMask loading={isPaymentSubmitted || (!isIframeVisible && addCardOpen)} />
      {isEditDialogOpen && (
        <EditPaymentMethodDialog
          open={isEditDialogOpen}
          method={editMethod}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={(email, phone, code) => {
            if (editMethod?.id) {
              handleEditSave(editMethod.id, email, phone, code);
            }
          }}
          isUpdating={isUpdating}
          updateError={updateError}
          getPaymentMethodIcon={getPaymentMethodIcon}
          checkIsEmailValid={checkIsEmailValid}
          checkIsPhoneNumberValid={checkIsPhoneNumberValid}
          checkIsCountryCodeValid={checkIsCountryCodeValid}
        />
      )}
      <Paper>
        <div className={classes.terminalTitle}>
          <Typography variant="subtitle2" className={classes.spacedTitle}>
            {titleText}
          </Typography>
          <Typography variant={'title'}>{subtitleText}</Typography>
        </div>
        <DialogContent>
          {hasRequestsToPay && (
            <Grid container alignContent={'stretch'} justifyContent={'stretch'}>
              <Paper className={classes.requestListPaper}>
                <Grid container className={classes.requestListGridWrap} alignContent={'stretch'} justifyContent={'stretch'}>
                  <DataList
                    gridOptions={gridOptions}
                    isSkeletonHidden
                    cypressTag="requests-to-pay-table-body"
                    noDataText="No requests to pay"
                  />
                </Grid>
              </Paper>
              {requestToEdit && (
                <PartialPaymentEdit
                  isOpen={!!requestToEdit}
                  row={requestToEdit}
                  saveChanges={handleRequestSave}
                  close={handleRequestClose}
                  needReason={!!paymentsFeatures?.requirePartialPaymentReason}
                />
              )}
            </Grid>
          )}
          <Box className={classes.dialogContent}>
            {createPaymentError && (
              <Box className={classes.dialogContextError}>
                <ErrorIcon className={classes.errorIcon} /> {createPaymentError?.message}
              </Box>
            )}
            <Grid container>
              <Grid item xs={12} md={5} className={matches ? classes.gridItem : classes.leftContainerMd}>
                <Grid container spacing={1}>
                  {!hasRequestsToPay && (
                    <Grid item container xs={12}>
                      <Grid item xs={12} className={classes.headingTextParent}>
                        <Typography className={classes.headingText} variant="subtitle1">
                          Payment Amount
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <CurrencyFormat
                          id="payment-amount-id"
                          displayType="input"
                          customInput={TextField}
                          decimalScale={2}
                          allowNegative={false}
                          fullWidth
                          variant="outlined"
                          label={`${defaultCurrency === CurrencyType.Cad ? 'CA' : ''}$ Enter A Payment Amount`}
                          aria-required="true"
                          autoComplete="off"
                          error={!isCustomerAmountValid}
                          value={amount}
                          onChange={handleAmountChange}
                          onBlur={validateAmount}
                          helperText={
                            isCustomerAmountValid
                              ? null
                              : `Amount must be between ${defaultCurrency === CurrencyType.Cad ? 'CA' : ''}$1 - ${
                                  defaultCurrency === CurrencyType.Cad ? 'CA' : ''
                                }$10,000,000`
                          }
                          inputProps={{
                            'aria-describedby': `${isCustomerAmountValid ? undefined : 'payment-amount-helpertext-id'}`,
                            maxLength: 11,
                          }}
                          FormHelperTextProps={{ id: 'payment-amount-helpertext-id' }}
                          disabled={isPaymentSubmitted}
                          data-cy="payment-amount"
                        />
                      </Grid>
                    </Grid>
                  )}
                  <Grid item container xs={12}>
                    <Grid item xs={12} padding={theme.spacing(!hasRequestsToPay ? 3 : 1, 0, 2, 0)}>
                      <Typography className={classes.headingText} variant="subtitle1">
                        {orderInfoHeaderText}
                      </Typography>
                      <Typography className={classes.helperText} variant="body1">
                        {orderInformationHeaderText}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      container
                      xs={12}
                      role="region"
                      aria-describedby="order-info-header"
                      aria-label={`${orderInfoHeaderText} ${orderInformationHeaderText}`}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            id="description-id"
                            fullWidth
                            variant="outlined"
                            label="Description"
                            aria-required="true"
                            autoComplete="off"
                            value={description}
                            onChange={handleDescriptionChange}
                            onBlur={validateDescription}
                            error={!isCustomerDescriptionValid}
                            helperText={isCustomerDescriptionValid ? null : 'Invalid Description'}
                            InputProps={{
                              'aria-describedby': `${isCustomerDescriptionValid ? undefined : 'description-helpertext-id'}`,
                            }}
                            FormHelperTextProps={{ id: 'description-helpertext-id' }}
                            disabled={isPaymentSubmitted}
                            data-cy="description"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            id="order-id"
                            fullWidth
                            variant="outlined"
                            label="Order# (Optional)"
                            aria-required="false"
                            autoComplete="off"
                            value={orderNumber}
                            onChange={handleOrderNumberChange}
                            disabled={isPaymentSubmitted}
                            data-cy="order-number"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            id="customer-po-id"
                            fullWidth
                            variant="outlined"
                            label="Customer PO# (Optional)"
                            aria-required="false"
                            autoComplete="off"
                            value={poNumber}
                            onChange={handlePONumberChange}
                            disabled={isPaymentSubmitted}
                            data-cy="customer-po-number"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            id="invoice-id"
                            fullWidth
                            variant="outlined"
                            label="Invoice# (Optional)"
                            aria-required="false"
                            autoComplete="off"
                            value={invoiceNumber}
                            onChange={handleInvoiceNumberChange}
                            disabled={isPaymentSubmitted}
                            data-cy="invoice-number"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={7} className={matches ? classes.gridItem : classes.rightContainerMd}>
                <Grid container spacing={1}>
                  <Grid item container xs={12}>
                    {!vtCustomer && (
                      <Grid item xs={12} alignItems="center" className={classes.cardHeading}>
                        <Typography className={classes.headingText} variant="subtitle1">
                          {paymentInfoHeaderText}
                        </Typography>
                        <Typography variant={'body1'} className={`${classes.helperText} ${classes.helperTextBottomPadding}`}>
                          {paymentInformationHeaderText}
                        </Typography>
                      </Grid>
                    )}
                    <Grid
                      item
                      container
                      xs={12}
                      spacing={2}
                      role="region"
                      aria-label={`${paymentInfoHeaderText} ${paymentInformationHeaderText}`}
                    >
                      {!hasRequestsToPay && isCustomerEnabled && (
                        <Grid item xs={12} md={9} lg={8}>
                          <CustomerAutoComplete
                            fieldValue={customerFieldTextValue}
                            setFieldValue={setCustomerFieldTextValue}
                            customerOption={customerOption}
                            setCustomerOption={setCustomerOption}
                            customerOptionList={customerOptionList}
                            hasCustomerOptionError={Boolean(customerOptionError)}
                          />
                        </Grid>
                      )}
                      {!vtCustomer && (
                        <Grid item xs={12} md={9} lg={8}>
                          {/* Custom email lookup Component */}
                          <TextField
                            id="email-or-name-id"
                            fullWidth
                            variant="outlined"
                            label="Enter Email or Name on Card"
                            aria-required="true"
                            autoComplete="off"
                            value={searchEmailOrName}
                            error={!isSearchEmailOrNameValid}
                            helperText={isSearchEmailOrNameValid ? null : 'Please enter at least 3 characters.'}
                            onKeyPress={(event: KeyboardEvent) => {
                              if (event.key === 'Enter') {
                                validateSearchEmailOrName();
                              }
                            }}
                            InputProps={{
                              'aria-describedby': `${isSearchEmailOrNameValid ? undefined : 'email-or-name-helpertext-id'}`,
                              endAdornment: (
                                <InputAdornment className={classes.searchAdornment} onClick={validateSearchEmailOrName} position="end">
                                  <SearchIcon></SearchIcon>
                                </InputAdornment>
                              ),
                            }}
                            FormHelperTextProps={{ id: 'email-or-name-helpertext-id' }}
                            onChange={handleSearchEmailChange}
                            onBlur={validateSearchEmailOrName}
                            disabled={isPaymentSubmitted}
                            data-cy="search-email-or-name"
                          />
                        </Grid>
                      )}
                    </Grid>
                    <Grid item container xs={12} alignItems="center" className={classes.cardHeading}>
                      <Typography className={classes.headingText} variant="subtitle1">
                        {vtCustomer ? `${vtCustomer.name} Payment Methods` : 'Payment Method'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant={'body1'} className={classes.helperText}>
                        {getPaymentMethodsHelperText()}
                      </Typography>
                    </Grid>
                    <Grid item container xs={12} alignItems="center" className={classes.cardHeading}>
                      <PaymentMethodTimerBanner timeLimit={methodTimeLimit} clearOneTimePaymentMethod={clearOneTimePaymentMethod} />
                      {/* Card snake - take from payer portal and adjust*/}
                      <Grid
                        hidden={isQueryMethodsByEmailInFlight || !matchedMethods || matchedMethods.length <= 0}
                        item
                        container
                        xs={12}
                        role="region"
                        aria-label={getPaymentMethodsHelperText()}
                      >
                        {createdPaymentMethod && (
                          <Card
                            key={'short-lived'}
                            variant={createdPaymentMethod.id === selectedPaymentMethod?.id ? 'elevation' : 'outlined'}
                            className={
                              createdPaymentMethod.id === selectedPaymentMethod?.id
                                ? classes.paymentMethodCardContainerSelected
                                : classes.paymentMethodCardContainer
                            }
                            sx={{ position: 'relative' }}
                          >
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                left: 4,
                                top: 4,
                                zIndex: 2,
                                backgroundColor: theme.palette.background.paper,
                                '&:hover': {
                                  backgroundColor: theme.palette.action.hover,
                                },
                                pointerEvents: 'auto',
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                setEditMethod(createdPaymentMethod);
                                setIsEditDialogOpen(true);
                              }}
                              data-cy={`edit-method-created`}
                            >
                              <Edit fontSize="small" color="action" />
                            </IconButton>
                            <CardActionArea
                              className={classes.paymetMethodCardAction}
                              onClick={() => {
                                if (selectedPaymentMethod && selectedPaymentMethod.id === createdPaymentMethod.id) {
                                  // If same, unselect.
                                  setSelectedPaymentMethod(undefined);
                                } else {
                                  setSelectedPaymentMethod(createdPaymentMethod);
                                }
                              }}
                              data-cy={`saved-payment-method-${createdPaymentMethod.isLongLived ? 'longlived' : 'shortlived'}-${
                                createdPaymentMethod.id === selectedPaymentMethod?.id ? 'selected' : 'unselected'
                              }`}
                            >
                              <Grid item container xs={12}>
                                <Grid item xs={4}>
                                  {!createdPaymentMethod.isLongLived && (
                                    <AlarmIcon
                                      className={`${classes.timeIcon} ${
                                        selectedPaymentMethod && selectedPaymentMethod.id === createdPaymentMethod.id
                                          ? classes.timeIconSelected
                                          : undefined
                                      }`}
                                    />
                                  )}
                                </Grid>

                                <Grid item container xs={8} justifyContent="flex-end">
                                  {getPaymentMethodIcon(createdPaymentMethod, false, 32)}
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography className={classes.cardText}>{`**** ${
                                    createdPaymentMethod?.creditCard?.lastFour || createdPaymentMethod?.paymentBank?.lastFour
                                  }`}</Typography>
                                </Grid>
                              </Grid>
                            </CardActionArea>
                          </Card>
                        )}
                        {matchedMethods?.map((paymentMethod, index) => {
                          const isDisabled = paymentMethod?.status !== PaymentMethodStatus.Verified;
                          const isSelected = selectedPaymentMethod?.id === paymentMethod?.id;
                          const createdCardMatch = createdPaymentMethod && paymentMethod.id === createdPaymentMethod.id;
                          if (!createdCardMatch) {
                            return (
                              <Card
                                key={index}
                                variant={isSelected ? 'elevation' : 'outlined'}
                                className={
                                  isSelected ? classes.paymentMethodCardContainerSelected : classes.paymentMethodCardContainer
                                }
                                sx={{ position: 'relative' }}
                              >
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    left: 4,
                                    top: 4,
                                    zIndex: 2,
                                    backgroundColor: theme.palette.background.paper,
                                    '&:hover': {
                                      backgroundColor: theme.palette.action.hover,
                                    },
                                    pointerEvents: 'auto',
                                  }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditMethod(paymentMethod || undefined);
                                    setIsEditDialogOpen(true);
                                  }}
                                  data-cy={`edit-method-${index}`}
                                >
                                  <Edit fontSize="small" color="action" />
                                </IconButton>
                                <CardActionArea
                                  disabled={isDisabled}
                                  className={classes.paymetMethodCardAction}
                                  onClick={() => {
                                    if (selectedPaymentMethod && selectedPaymentMethod.id === paymentMethod.id) {
                                      // If same, unselect.
                                      setSelectedPaymentMethod(undefined);
                                    } else {
                                      setSelectedPaymentMethod(paymentMethod);
                                    }
                                  }}
                                  data-cy={`saved-payment-method-${index}-${isSelected ? 'selected' : 'unselected'}`}
                                >
                                  <Grid item container xs={12}>
                                    <Grid item container xs={12} justifyContent="flex-end">
                                      {getPaymentMethodIcon(paymentMethod, isDisabled, 32)}
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Typography className={isDisabled ? classes.cardTextDisabled : classes.cardText}>{`**** ${
                                        paymentMethod?.creditCard?.lastFour || paymentMethod?.paymentBank?.lastFour
                                      }`}</Typography>
                                    </Grid>
                                  </Grid>
                                </CardActionArea>
                              </Card>
                            );
                          }
                          return null;
                        })}
                        {tenantAccount?.settings?.supportedPaymentMethods?.includes(PaymentMethodType.CreditCard) && (
                          <Card variant="outlined" className={classes.paymentMethodAddCardContainer}>
                            <CardActionArea
                              className={classes.paymetMethodCardAction}
                              onClick={() => {
                                handleAddCard();
                              }}
                              data-cy="add-credit-card"
                            >
                              <Grid item container xs={12}>
                                <Grid item xs={12} className={classes.addCardIconContainer}>
                                  <CreditCardIcon className={classes.addCardIcon} />
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography className={classes.addCardText}>Add Card</Typography>
                                </Grid>
                              </Grid>
                            </CardActionArea>
                          </Card>
                        )}
                        {tenantAccount?.settings?.supportedPaymentMethods?.includes(PaymentMethodType.PaymentBankUs) && (
                          <Card variant="outlined" className={classes.paymentMethodAddCardContainer}>
                            <CardActionArea
                              className={classes.paymetMethodCardAction}
                              onClick={handleAddBank}
                              data-cy="add-bank-account"
                            >
                              <Grid container>
                                <Grid item xs={12} className={classes.addCardIconContainer}>
                                  <BankIcon className={classes.addCardIcon} />
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography className={classes.addCardText}>Add Bank</Typography>
                                </Grid>
                              </Grid>
                            </CardActionArea>
                          </Card>
                        )}
                        {isQueryMethodsByEmailInFlight && <CircularProgress />}
                        {hasReachedPaymentMethodLimit && (
                          <Typography className={classes.infoText} variant="body1">
                            <InfoIcon className={classes.infoIcon} fontSize="small" />
                            {'Payer has reached the maximum number of saved cards, you can use this card for single use only'}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item hidden={!selectedPaymentMethod} xs={12}>
                        <Table aria-label="selected method billing details" data-cy={'method-details'}>
                          <TableHead>
                            <TableRow>
                              <TableCell className={classes.methodDetailsText}>
                                {selectedPaymentMethod?.type === PaymentMethodType.PaymentBankUs ? 'Account Holder' : 'Name on Card'}
                              </TableCell>
                              <TableCell className={classes.methodDetailsText}>Email</TableCell>
                              <TableCell className={classes.methodDetailsText}>Expiry</TableCell>
                              <TableCell className={classes.methodDetailsText}>Billing Address</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>{selectedPaymentMethod && getBillingDetailsRow(selectedPaymentMethod)}</TableBody>
                        </Table>
                      </Grid>
                    </Grid>
                    {/* If a payment card is selected, require checkbox to be ticked for submitting */}
                    <Grid item hidden={!selectedPaymentMethod} xs={12} className={classes.gridItem}>
                      <FormControlLabel
                        control={<Checkbox checked={isConfirmed} color="primary" onChange={onConfirmChange} />}
                        label={confirmLabel}
                        aria-label={getConfirmAriaLabel()}
                        labelPlacement="end"
                        data-cy={'confirm-method-details'}
                        classes={{ label: classes.helperText }}
                      />
                    </Grid>
                  </Grid>
                  {getAddCardDialog()}
                  <AddBankDialog
                    key={addBankOpen ? 'open' : 'closed'}
                    open={addBankOpen}
                    onClose={handleCloseBank}
                    onSave={handleSaveBank}
                    isSaving={isAddingBank}
                    error={createPaymentMethodError}
                    formData={{
                      email: customerEmail,
                      country,
                      postalCode,
                      countryCode,
                      phoneNumber,
                    }}
                    // Update the onFormChange handler in PaymentVirtualTerminal.tsx
                    onFormChange={(field, value) => {
                      switch (field) {
                        case 'name':
                          setCustomerName(value);
                          break;
                        case 'email':
                          setCustomerEmail(value);
                          break;
                        case 'country':
                          setCountry(value);
                          break;
                        case 'postalCode':
                          setPostalCode(value);
                          break;
                        case 'countryCode':
                          setCountryCode(value);
                          break;
                        case 'phoneNumber':
                          setPhoneNumber(value);
                          break;
                        default:
                          // Handle unexpected field or do nothing
                          break;
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions className={classes.dialogActions}>
          <Grid container justifyContent="flex-end">
            <Grid item container xs={12} justifyContent="flex-end" className={classes.gridItem}>
              <div tabIndex={0} className={classes.amountDiv}>
                <Typography variant="h4" className={classes.totalLabel}>
                  {'Total: '}
                </Typography>
                <Typography variant="h4" className={classes.total} data-cy="amount">
                  {isCustomerAmountValid &&
                    new Intl.NumberFormat('en', {
                      style: 'currency',
                      currency: (defaultCurrency || 'USD') as CurrencyType,
                      currencyDisplay: 'symbol',
                    }).format(parseFloat(amount || '0'))}
                </Typography>
              </div>
            </Grid>
            <Grid item container xs={12} justifyContent="flex-end" className={classes.gridItem}>
              <Button
                variant="outlined"
                className={classes.cancelButton}
                color="primary"
                onClick={handleCancelPayment}
                disabled={isPaymentSubmitted}
                data-cy={'virtual-terminal-cancel-payment'}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={!isPaymentVirtualTerminalValid || isPaymentSubmitted}
                onClick={handlePaymentSubmit}
                data-cy={'virtual-terminal-submit-payment'}
              >
                Submit Payment
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Paper>
    </Container>
  );
};

export default PaymentVirtualTerminal;
