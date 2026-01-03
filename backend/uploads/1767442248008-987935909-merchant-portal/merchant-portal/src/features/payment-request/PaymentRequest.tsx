import {
  Box,
  Button,
  TextField,
  Theme,
  Typography,
  Grid,
  Paper,
  Divider,
  DialogContent,
  Chip,
  ListItem,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { createStyles, makeStyles } from '@mui/styles';
import { useDropzone, FileRejection, ErrorCode, FileError } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import React, { useRef, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import CurrencyFormat from 'react-currency-format';
import ErrorIcon from '@mui/icons-material/Error';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { DatePicker } from '@mui/lab';
import { DateTime } from 'luxon';
import LoadingMask from '../../components/LoadingMask';
import CustomerAutoComplete from '../../components/CustomerAutoComplete';
import { CustomerOption } from '../../custom-types/CustomerOption';
import { Link } from '@mui/material';
import { ServiceErrorReasonCode } from '../../util/ReasonCodes';
import { InvoiceFileUpload, selectCustomerOptionError } from '../home/HomeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { CapabilityStatus, CurrencyType, IntegrationMode } from '../../gql-types.generated';
import {
  selectSendPaymentRequestError,
  selectSendPaymentRequestGQLError,
  selectIsPaymentRequestFormValid,
  selectIsRecipientEmailValid,
  selectIsAmountValid,
  selectIsRefNumValid,
  selectPaymentRequestStatus,
  selectSendPaymentRequestInFlight,
  selectInvoices,
  selectIsLoadingInvoices,
  selectInvoiceUploadTotal,
  selectInvoiceUploadIndex,
  clearSendPaymentRequestGQLError,
  clearSendPaymentRequestError,
  captureInvoiceArray,
  clearInvoices,
  clearPaymentRequestStatus,
  fetchInvoiceUploadIndex,
  fetchInvoiceUploadTotal,
  fetchIsAmountValid,
  fetchIsLoadingInvoices,
  fetchIsPaymentRequestFormValid,
  fetchIsRecipientEmailValid,
  fetchIsRefNumValid,
} from './PaymentRequestSlice';
import { fetchPaymentRequestSuccessMessage, selectDefaultCurrency, selectTenantAccount } from '../app/AppSlice';
import { uploadDocuments, upsertPaymentRequest } from './PaymentRequestActions';
import { RoutePath } from '../../util/Routes';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles<Theme, { isCustomerEnabled: boolean }>(theme =>
  createStyles({
    paper: {
      textAlign: 'start',
      position: 'relative',
      padding: 0,
      alignSelf: 'flex-start',
    },
    contentBox: {
      padding: theme.spacing(1, 2.5, 2.5, 2.5),
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
    warningAlertText: {
      fontSize: 16,
      color: theme.palette.warning.dark,
    },
    cancelButton: {
      marginRight: theme.spacing(1),
    },
    spacedTitle: {
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    header: {
      padding: theme.spacing(2.5),
      margin: 0,
    },
    headerSuccessIcon: {
      lineHeight: 1,
      paddingRight: 8,
    },
    headerErrorIcon: {
      lineHeight: 1,
      paddingRight: 8,
    },
    errorHeader: {
      padding: theme.spacing(1, 3),
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.error.light,
    },
    successHeader: {
      padding: theme.spacing(1, 3),
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.success.light,
    },
    settingsErrorHeader: {
      padding: theme.spacing(1.5, 3),
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.error.light,
    },
    settingsErrorHeaderText: {
      height: '100%',
      maxWidth: '85%',
      color: theme.palette.error.main,
    },
    errorHeaderText: {
      height: '100%',
      maxWidth: '85%',
      color: theme.palette.error.main,
    },
    errorHeaderTypography: {
      fontWeight: 500,
    },
    successHeaderText: {
      height: '100%',
      maxWidth: '85%',
      color: theme.palette.success.main,
    },
    settingErrorIcon: {
      fontSize: '1.5rem',
      color: theme.palette.error.main,
    },
    errorIcon: {
      fontSize: '2rem',
      color: theme.palette.error.main,
    },
    successIcon: {
      fontSize: '2rem',
      color: theme.palette.success.main,
    },
    hidden: {
      display: 'none',
    },
    textField: {
      '&.selectEmptyMissing .MuiOutlinedInput-notchedOutline': {
        border: '1px solid',
        borderColor: theme.palette.error.main,
      },
      '&.selectEmptyMissing label': {
        color: theme.palette.error.main,
      },
      '& .Mui-disabled': {
        backgroundColor: theme.palette.uxGrey.hover,
      },
    },
    headerPaymentBanner: {
      display: 'flex',
      alignItems: 'center',
      '&:hover': {
        cursor: 'pointer',
        textDecoration: 'underline',
      },
    },
    autoFillCustomer: {
      cursor: 'pointer',
    },
    dialogCloseContainer: {
      textAlign: 'end',
    },
    dialogCloseButton: {
      color: theme.palette.uxGrey.main,
    },
    dialogTitleText: {
      padding: 0,
      margin: 0,
    },
    divider: {
      height: '1px',
      width: '100%',
      background: theme.palette.uxGrey.focus,
      marginTop: 16,
      marginBottom: 16,
    },
    orDivider: {
      height: 0,
      width: '100%',
      border: `solid 0.5px ${theme.palette.uxGrey.border}`,
    },
    orCircle: {
      border: `solid 1.5px ${theme.palette.uxGrey.border}`,
      borderRadius: '50%',
      height: '28px',
      width: '28px',
      marginTop: '-14px',
      textAlign: 'center',
      background: '#FFFFFF',
      marginLeft: 'auto',
      marginRight: 'auto',
      color: theme.palette.uxGrey.disabled,
      fontSize: '14px',
      fontWeight: 500,
      padding: '2px 0px 4px 0px',
    },
    orContainer: {
      marginTop: 30,
      height: 43,
    },
    dropContent: {
      width: '100%',
      display: 'flex',
      minHeight: ({ isCustomerEnabled }) => (isCustomerEnabled ? 140 : 95),
      [theme.breakpoints.down('md')]: {
        minHeight: '30vh',
      },
      justifyContent: 'center',
    },
    dropZoneOverlay: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      margin: 'auto',
      pointerEvents: 'none',
      height: '100%',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
      },
    },
    dropZoneOverlaySvg: {
      marginTop: 40,
      color: theme.palette.primary.main,
    },
    dropZoneOverlayText: {
      padding: '0px 24px',
      [theme.breakpoints.up('xs')]: {
        alignContent: 'flex-start',
      },
      [theme.breakpoints.down('md')]: {
        fontSize: '.8em',
        alignContent: 'center',
        marginTop: 0,
        textAlign: 'center',
        marginLeft: 0,
      },
      textAlign: 'center',
    },
    dropZoneTextLine1: {
      fontSize: '1.15em',
      textAlign: 'center',
    },
    browseText: {
      color: theme.palette.primary.main,
    },
    uploadTitle: {
      padding: '16px 0px 12px 0px',
      color: theme.palette.uxGrey.disabled,
    },
    invoiceUploadPaper: {
      position: 'relative',
    },
    dropArea: {
      width: '100%',
    },
    dropAreaShrunk: {
      width: '160px',
      [theme.breakpoints.down('md')]: {
        width: '100%',
        height: 124,
      },
    },
    dropAreaOverlayShrunk: {
      width: '160px',
      [theme.breakpoints.down('md')]: {
        width: '100%',
        height: 200,
      },
    },
    dropSection: {
      height: '100%',
      width: '100%',
      minHeight: 'unset',
      border: '1px dashed #00000099',
      borderRadius: 4,
      backgroundColor: theme.palette.background.default,
    },
    dropButton: {
      height: '100%',
      width: '100%',
      cursor: 'pointer',
    },
    invoiceChips: {
      maxHeight: 138,
      overflow: 'auto',
      width: 'calc(100% - 160px)',
      padding: '0px 16px',
      '& .MuiListItem-gutters': {
        padding: 4,
        marginBottom: 4,
      },
      [theme.breakpoints.down('md')]: {
        width: '100%',
        padding: 4,
        maxHeight: 142,
      },
    },
    invalidInvoiceChip: {
      '&.MuiListItem-root': {
        '& .MuiChip-root': {
          color: theme.palette.error.main,
          border: `1px solid ${theme.palette.error.main}`,
        },
      },
    },
    invoiceChip: {
      '&.MuiListItem-root': {
        width: 'unset',
        height: 30,
      },
      '& .MuiChip-root': {
        border: `1px solid ${theme.palette.uxGrey.focus}`,
        background: 'transparent',
      },
    },
    clearAllButton: {
      float: 'right',
    },
    subHeaders: {
      paddingBottom: theme.spacing(1),
    },
  }),
);

const maxSize = 10048576;
const maxFiles = 100;
const PaymentRequest: React.FC = () => {
  const tenantAccount = useSelector(selectTenantAccount);
  const isCustomerEnabled = !!tenantAccount?.settings?.features?.customers?.enabled;
  const classes = useStyles({ isCustomerEnabled });
  const dispatch = useDispatch();
  const history = useHistory();
  const defaultCurrency = useSelector(selectDefaultCurrency) || 'USD';
  const hasCustomerOptionError = !!useSelector(selectCustomerOptionError);
  const hasCardPaymentsEnabled = tenantAccount?.capabilities?.cardPayments === CapabilityStatus.Active;
  const hasAccountPayoutsEnabled = tenantAccount?.capabilities?.accountPayouts === CapabilityStatus.Active;
  const paymentsEnabled =
    tenantAccount?.capabilities?.cardPayments === CapabilityStatus.Active &&
    tenantAccount.settings?.cardPayments?.refundPolicy &&
    tenantAccount.capabilities.accountPayouts === CapabilityStatus.Active;
  const hasRefundPolicy = !!tenantAccount?.settings?.cardPayments?.refundPolicy;
  const defaultAdditionalInfo = tenantAccount?.settings?.customEmailSettings?.paymentRequestDefaultText;
  const sendPaymentRequestError = useSelector(selectSendPaymentRequestError);
  const sendPaymentRequestGQLError = useSelector(selectSendPaymentRequestGQLError);
  const isPaymentRequestFormValid = useSelector(selectIsPaymentRequestFormValid);
  const isRecipientEmailValid = useSelector(selectIsRecipientEmailValid);
  const isAmountValid = useSelector(selectIsAmountValid);
  const isRefNumValid = useSelector(selectIsRefNumValid);
  const paymentRequestStatus = useSelector(selectPaymentRequestStatus);
  const sendPaymentRequestInFlight = useSelector(selectSendPaymentRequestInFlight);
  const invoices = useSelector(selectInvoices);
  const isLoadingInvoices = useSelector(selectIsLoadingInvoices);
  const invoiceLoadTotal = useSelector(selectInvoiceUploadTotal);
  const invoiceLoadIndex = useSelector(selectInvoiceUploadIndex);
  const [successRecipient, setSuccessRecipient] = useState<string>();
  const [invoiceUploadProgress, setInvoiceUploadProgress] = React.useState(0);
  const [recipientCustomer, setRecipientCustomer] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const recipientPhone = '';
  const [additionalInfo, setAdditionalInfo] = useState<string>(defaultAdditionalInfo || '');
  const [amount, setAmount] = useState('');
  const [refNum, setRefNum] = useState('');
  const [requestState, setRequestState] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [customerOption, setCustomerOption] = useState<CustomerOption | undefined>(undefined);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [datePickerError, setDatePickerError] = useState<string | undefined>();
  const [fileInfoMessage, setFileInfoMessage] = useState<string | undefined>(undefined);
  const [infoCharCount, setInfoCharCount] = useState<number>(defaultAdditionalInfo?.length || 0);
  const [displayFileInfoToast, setDisplayFileInfoToast] = useState(false);
  const { previewSettings, mode: integrationMode } = tenantAccount?.settings?.integrationSettings || {};
  const emailRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLDivElement>(null);
  const refRef = useRef<HTMLDivElement>(null);
  const gridMdSize = isCustomerEnabled ? 6 : 12;
  // using js date as mui picker is expecting that
  const minDueDate = new Date();
  minDueDate.setDate(minDueDate.getDate() - 180); // Allow 180 days in the past
  const maxDueDate = new Date();
  maxDueDate.setDate(maxDueDate.getDate() + 90);
  // luxon min and max date for verification
  const luxonMinDueDate = DateTime.now().minus({ days: 180 }).startOf('day');
  const luxonMaxDueDate = DateTime.now().plus({ days: 90 }).endOf('day');
  const isLoading = isLoadingInvoices || sendPaymentRequestInFlight;
  const isCommunicationDisabled = !paymentsEnabled || recipientCustomer.trim().length > 0 || customerOption !== undefined;
  const handleDueDateChange = (date: Date | null) => {
    setDueDate(date);
  };
  const requestPaymentUploadFiles = (files: File[]) => {
    dispatch(uploadDocuments(files, 0));
  };
  const handlePaymentRequestFormValid = (valid: boolean) => {
    dispatch(fetchIsPaymentRequestFormValid(valid));
  };
  const handleRecipientEmailValid = (valid: boolean) => {
    dispatch(fetchIsRecipientEmailValid(valid));
  };
  const handleAmountValid = (valid: boolean) => {
    dispatch(fetchIsAmountValid(valid));
  };
  const handleRefNumValid = (valid: boolean) => {
    dispatch(fetchIsRefNumValid(valid));
  };
  const requestPaymentUpsertPaymentRequest = (
    referenceId: string,
    amount: number,
    invoice: string | undefined,
    invoices: string[],
    emailAddress?: string,
    phoneNumber?: string,
    dueDate?: DateTime,
    customerId?: string,
    additionalInfo?: string,
  ) => {
    const additionalInfoText = additionalInfo === defaultAdditionalInfo ? undefined : additionalInfo?.trim();
    dispatch(
      upsertPaymentRequest(referenceId, amount, invoice, invoices, emailAddress, phoneNumber, dueDate, customerId, additionalInfoText),
    );
  };

  const resetPaymentRequestStatus = () => {
    dispatch(clearPaymentRequestStatus());
  };

  const getPaymentRequestSuccessToastMessage = (amount: string, email: string, customerName: string) => {
    const formatedAmount = parseFloat(amount).toFixed(2);
    const amountText = defaultCurrency === CurrencyType.Cad ? `CA$${formatedAmount}` : `$${formatedAmount}`;
    let messageText = `Payment Request for ${amountText} has been generated successfully.`;
    messageText +=
      integrationMode === IntegrationMode.Manual || !!previewSettings?.enabled
        ? ''
        : ` A request will be sent to ${customerName.length ? `users of ${customerName}` : `email address '${email}'`}.`;
    return messageText;
  };

  const captureInvoiceAdjustment = (invoices: InvoiceFileUpload[]) => {
    dispatch(captureInvoiceArray(invoices));
  };
  const clearInvoiceData = () => {
    dispatch(clearInvoices());
    dispatch(fetchIsLoadingInvoices(false));
    dispatch(fetchInvoiceUploadIndex(0));
    dispatch(fetchInvoiceUploadTotal(0));
  };

  const handleFileUploadToast = (message: string) => {
    setFileInfoMessage(message);
    setDisplayFileInfoToast(true);
    setTimeout(() => {
      setDisplayFileInfoToast(false);
      setFileInfoMessage(undefined);
    }, 3000);
  };
  // Clear send payment request errors.
  const clearSendPaymentErrors = () => {
    dispatch(clearSendPaymentRequestGQLError());
    dispatch(clearSendPaymentRequestError());
  };
  const validateEmail = (value: string) => {
    if (!emailRef || !emailRef.current) {
      return false;
    }

    const testPassed = !!value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
    if (!testPassed || value.length === 0) {
      return false;
    }

    return true;
  };

  const validateCommunication = (emailValue: string, hasCustomer: boolean) => {
    if (hasCustomer) {
      if (emailValue) return false;
    } else {
      return validateEmail(emailValue);
    }
    return true;
  };

  const validateReference = (value: string) => {
    if (!refRef || !refRef.current) {
      return false;
    }

    const refFormat = RegExp(/^[a-zA-Z0-9-]*$/);
    const refPassed = refFormat.test(value);
    if (value.length === 0 || !refPassed) {
      return false;
    }

    return true;
  };

  const validateAmount = (value: string) => {
    if (!amountRef || !amountRef.current) {
      return false;
    }

    if (!value || parseFloat(value) <= 0 || value.indexOf('-') > -1 || parseInt(value) > 10000000) {
      return false;
    }

    return true;
  };

  const validateDueDate = (date: Date | null) => {
    if (date === null) {
      return true;
    }
    // testing the date validation using luxon
    const [day, month, year] = [date?.getDate(), (date?.getMonth() || 0) + 1, date?.getFullYear()];
    if (day && month && year) {
      const tempDate = DateTime.fromObject({ year, month, day }).endOf('day');

      return tempDate.isValid && !(tempDate < luxonMinDueDate || tempDate > luxonMaxDueDate);
    }

    return false;
  };

  const handleSettingsClick = () => {
    history.push('/settings');
  };
  const addErrorToDropZone = () => {
    // Add error outline to dropzone.
  };

  const removeErrors = () => {
    setRequestState('');
  };

  const handleRecipientEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isRecipientEmailValid) {
      handleRecipientEmailValid(true);
    }

    const value = event.target.value.trim();
    setRecipientEmail(value);
  };

  const handleAdditionalInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInfoCharCount(event.target.value.length);
    setAdditionalInfo(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAmountValid) {
      handleAmountValid(true);
    }

    const value = event.target.value.trim();
    setAmount(value);
  };

  const handleRefNumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isRefNumValid) {
      handleRefNumValid(true);
    }

    const value = event.target.value.trim();
    setRefNum(value);
  };

  const validateRecipientEmail = () => {
    if (recipientEmail.length === 0) {
      handleRecipientEmailValid(true);
    } else {
      handleRecipientEmailValid(validateEmail(recipientEmail));
    }
  };

  const validatePaymentRequestAmount = () => {
    if (amount.length === 0) {
      handleAmountValid(true);
    } else {
      handleAmountValid(validateAmount(amount));
    }
  };

  const validateReferenceNumber = () => {
    if (refNum.length === 0) {
      handleRefNumValid(true);
    } else {
      handleRefNumValid(validateReference(refNum));
    }
  };

  const handleSendClick = () => {
    let errors = 0;
    removeErrors();

    // Check if files exist.
    if (!invoices || invoices.length === 0) {
      addErrorToDropZone();
      errors += 1;
    }

    if (errors === 0) {
      const submitAmount = Math.round(parseFloat(amount) * 100);
      if (invoices && invoices.length > 0 && submitAmount) {
        const customerOptionId = customerOption?.id;
        if (customerOptionId || recipientEmail) {
          // changing to utc using luxon
          const tempDueDate = dueDate ? DateTime.fromISO(dueDate.toISOString()) : null;
          const date = tempDueDate === null ? undefined : tempDueDate.endOf('day').toUTC();
          // Get just the unique id of the invoices.
          const invoiceIds = invoices.map((invoice: InvoiceFileUpload) => {
            return invoice.id;
          });
          requestPaymentUpsertPaymentRequest(
            refNum,
            submitAmount,
            undefined,
            invoiceIds,
            recipientEmail,
            recipientPhone,
            date,
            customerOptionId,
            additionalInfo,
          );
          handlePaymentRequestFormValid(false);
        }
      }
    } else {
      setRequestState('error');
    }
  };

  const resetData = () => {
    setSuccessRecipient(undefined);
    setRecipientCustomer('');
    setRecipientEmail('');
    setAdditionalInfo(defaultAdditionalInfo || '');
    setAmount('');
    setRefNum('');
    setInfoCharCount(defaultAdditionalInfo?.length || 0);
    setDueDate(null);
    clearInvoiceData();
    setCustomerOption(undefined);
    resetPaymentRequestStatus();
    // When empty, it is false.
    handlePaymentRequestFormValid(false);
    handleRecipientEmailValid(true);
    handleAmountValid(true);
    handleRefNumValid(true);
    // Clear state.
    setRequestState('');
  };

  const handlePendingRequest = () => {
    // Show Success
    setRequestState('success');
    setSuccessRecipient(recipientEmail);
    setRecipientEmail('');
    setAdditionalInfo(defaultAdditionalInfo || '');
    setAmount('');
    setRefNum('');
    setDueDate(null);
    clearInvoiceData();
    setCustomerOption(undefined);
    setRecipientCustomer('');
    resetPaymentRequestStatus();
    handlePaymentRequestFormValid(false);
    // Clear state.
    setRequestState('');
  };
  const hasValidInvoice = () => {
    if (invoices && invoices.length > 0) {
      for (let i = 0; invoices.length; i += 1) {
        if (invoices[i].success) {
          return true;
        }
      }
    }
    return false;
  };
  const validateFields = () => {
    if (
      validateCommunication(recipientEmail, customerOption !== undefined) &&
      validateAmount(amount) &&
      validateReference(refNum) &&
      validateDueDate(dueDate) &&
      hasValidInvoice()
    ) {
      return true;
    }
    return false;
  };
  const handleCancelClick = () => {
    resetData();
    history.push(RoutePath.Requests);
  };
  useEffect(() => {
    // Initial load, remove all errors and values.
    resetData();
  }, [tenantAccount]);

  useEffect(() => {
    if (invoiceLoadTotal && invoiceLoadIndex && invoiceLoadIndex >= 0) {
      setInvoiceUploadProgress((invoiceLoadIndex / invoiceLoadTotal) * 100);
    } else {
      setInvoiceUploadProgress(0);
    }
  }, [invoiceLoadIndex, invoiceLoadTotal]);

  useEffect(() => {
    handlePaymentRequestFormValid(validateFields());
  }, [recipientEmail, amount, refNum, invoices, dueDate, customerOption]);

  useEffect(() => {
    handleAmountValid(true);
    if (paymentRequestStatus !== undefined) {
      const customerName = customerOption?.name || paymentRequestStatus.customerOption?.customerName || '';
      handlePendingRequest();
      dispatch(fetchPaymentRequestSuccessMessage(getPaymentRequestSuccessToastMessage(amount, recipientEmail, customerName)));
      history.push(RoutePath.Requests);
    }
  }, [paymentRequestStatus]);

  useEffect(() => {
    if (sendPaymentRequestError) {
      handlePaymentRequestFormValid(false);
    }
  }, [sendPaymentRequestError]);

  const setCustomerFromAutoFill = (existingCustomer: CustomerOption) => {
    setRecipientEmail('');
    setCustomerOption(existingCustomer);
    setRecipientCustomer(`${existingCustomer.name} - ${existingCustomer.customerNumber}`);
    if (clearSendPaymentErrors) {
      clearSendPaymentErrors();
    }
  };

  // Dropzone initiation and props.
  const { getRootProps, getInputProps, acceptedFiles, fileRejections } = useDropzone({
    maxFiles,
    maxSize,
    accept: ['application/pdf'],
  });
  const handleInvoiceChipDelete = (invoice: InvoiceFileUpload) => {
    if (invoice) {
      if (invoices && invoices.length > 0) {
        const adjustedInvoices = invoices.filter((i: InvoiceFileUpload) => {
          if (invoice.file === i.file) {
            return false;
          }
          return true;
        });
        if (adjustedInvoices) {
          // Remove the item from the array and capture the new array to the state.
          captureInvoiceAdjustment(adjustedInvoices);
        }
      }
    }
  };
  useEffect(() => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      // Do not allow duplicate files.
      // Sync invoiceObjects and invoices.
      // Only load files which are not in invoices already.
      const filteredObjects = acceptedFiles.filter((value: File) => {
        if (
          invoices &&
          invoices.findIndex(
            (invoice: InvoiceFileUpload) =>
              invoice &&
              invoice.file.type === value.type &&
              invoice.file.name === value.name &&
              invoice.file.size === value.size &&
              invoice.file.lastModified === value.lastModified,
          ) >= 0
        ) {
          handleFileUploadToast('A selected file is a duplicate, this file will be skipped.');
          return false;
        }
        return true;
      });
      // Check to ensure we are not loading over the max file count.
      // Check if we are exceeding the max files of 100.
      if (invoices && filteredObjects && filteredObjects.length + invoices.length > maxFiles) {
        if (maxFiles === invoices.length) {
          handleFileUploadToast(`File limit of ${maxFiles} has already been reached.`);
        } else {
          handleFileUploadToast(
            `This will exceed the maximum file limit. ${
              maxFiles - (invoices?.length || 0) > 0 ? `Only ${maxFiles - invoices.length} more may be uploaded.` : ``
            }`,
          );
        }
        return;
      }
      if (filteredObjects && filteredObjects.length > 0) {
        requestPaymentUploadFiles(filteredObjects);
      }
    }
  }, [acceptedFiles]);

  useEffect(() => {
    if (fileRejections && fileRejections.length > 0) {
      let overMax = false;
      let overMaxSize = false;
      let wrongFileType = false;
      fileRejections.every((rejection: FileRejection) => {
        rejection.errors.every((error: FileError) => {
          if (error.code === ErrorCode.TooManyFiles) {
            overMax = true;
            return false;
          }
          if (error.code === ErrorCode.FileTooLarge) {
            overMaxSize = true;
            return false;
          }
          if (error.code === ErrorCode.FileInvalidType) {
            wrongFileType = true;
            return false;
          }
          return true;
        });
        if (wrongFileType || overMaxSize || overMax) {
          return false;
        }
        return true;
      });
      if (overMaxSize) {
        // max file size.
        handleFileUploadToast('Some of the files exceed the max file size limit of 10MB.');
      }
      if (overMax) {
        // Over max file upload limit.
        if (invoices && invoices.length > 0) {
          handleFileUploadToast(
            `This will exceed the maximum file limit. Only ${maxFiles - (invoices?.length || 0)} more may be uploaded.`,
          );
        } else if (!invoices || invoices.length === 0) {
          handleFileUploadToast(`This will exceed the maximum file limit. Only ${maxFiles} files can be uploaded per request.`);
        }
      }
      if (wrongFileType) {
        // Only can use pdf files.
        handleFileUploadToast('Invalid file type found in files to upload. Only .pdf files may be uploaded.');
      }
    }
  }, [fileRejections]);

  useEffect(() => {
    setInvoiceTotal(invoices ? invoices.length : 0);
  }, [invoices]);

  const getAutoFillCustomerErrorText = (values: Record<string, unknown>[]) => {
    let customerNumber;
    let name;
    let id;
    values.forEach((value: Record<string, unknown>) => {
      if (value.key === 'customerNumber') {
        customerNumber = value.value;
      } else if (value.key === 'name') {
        name = value.value;
      } else if (value.key === 'id') {
        id = value.value;
      }
    });
    const existingCustomer = {
      name,
      customerNumber,
      id,
    } as CustomerOption;
    return (
      <>
        <Typography className={classes.errorHeaderTypography}>
          {`Unable to create payment request, email belongs to existing customer: ${existingCustomer.name}`}
        </Typography>
        <Typography className={classes.errorHeaderTypography}>
          <Link
            underline={'hover'}
            data-cy={'send-to-customer-autofill'}
            className={classes.autoFillCustomer}
            onClick={() => setCustomerFromAutoFill(existingCustomer)}
          >
            {`Click to use customer instead`}
          </Link>
        </Typography>
      </>
    );
  };
  const generateHeader = () => {
    if (requestState !== '') {
      // if error show red
      let subtitle;
      if (requestState !== 'success') {
        if (requestState === 'error') {
          subtitle = 'Failed to send, Invalid values';
        }
        if (requestState === 'fileSize') {
          subtitle = 'File uploaded exceeds max size (10MB)';
        }
        if (requestState === 'uploadError') {
          subtitle = 'Document Upload Failure, check connection and try again';
        }
        if (requestState === 'pdf') {
          subtitle = 'Invoice must be in pdf format';
        }
        if (subtitle) {
          return (
            <Box className={classes.errorHeader}>
              <Box className={classes.headerErrorIcon}>
                <ErrorIcon className={classes.errorIcon} />
              </Box>
              <Box className={classes.errorHeaderText} data-cy="payment-request-error">
                <Typography className={classes.errorHeaderTypography} variant="subtitle2">
                  {subtitle}
                </Typography>
              </Box>
            </Box>
          );
        }
      }
      // if submitted show green
      subtitle = `Payment Request Sent to ${successRecipient}`;
      return (
        <Box className={classes.successHeader}>
          <Box className={classes.headerSuccessIcon}>
            <SendIcon className={classes.successIcon} />
          </Box>
          <Box className={classes.successHeaderText}>
            <Typography variant="subtitle2">{subtitle}</Typography>
          </Box>
        </Box>
      );
    }
    if (!hasRefundPolicy) {
      return (
        <Box className={classes.settingsErrorHeader}>
          <Box className={classes.headerErrorIcon}>
            <ErrorIcon className={classes.settingErrorIcon} />
          </Box>
          <Box className={classes.settingsErrorHeaderText} data-cy="payment-request-error">
            <Typography className={classes.headerPaymentBanner} onClick={handleSettingsClick}>
              Please enter in your refund policy and save in Account Settings
            </Typography>
          </Box>
        </Box>
      );
    }
    if (!hasAccountPayoutsEnabled) {
      return (
        <Box className={classes.settingsErrorHeader}>
          <Box className={classes.headerErrorIcon}>
            <ErrorIcon className={classes.settingErrorIcon} />
          </Box>
          <Box className={classes.settingsErrorHeaderText} data-cy="payment-request-error">
            <Typography className={classes.headerPaymentBanner} onClick={handleSettingsClick}>
              Please update payout settings in Account Settings
            </Typography>
          </Box>
        </Box>
      );
    }
    if (!hasCardPaymentsEnabled) {
      return (
        <Box className={classes.settingsErrorHeader}>
          <Box className={classes.headerErrorIcon}>
            <ErrorIcon className={classes.settingErrorIcon} />
          </Box>
          <Box className={classes.settingsErrorHeaderText} data-cy="payment-request-error">
            <Typography>Sending payment requests have been disabled due to having card payments disabled</Typography>
          </Box>
        </Box>
      );
    }
    if (sendPaymentRequestError) {
      if (sendPaymentRequestError.includes('timeout')) {
        return (
          <Box className={classes.settingsErrorHeader}>
            <Box className={classes.headerErrorIcon}>
              <ErrorIcon className={classes.settingErrorIcon} />
            </Box>
            <Box className={classes.settingsErrorHeaderText} data-cy="payment-request-error">
              <Typography className={classes.errorHeaderTypography}>Timeout exceeded. Please try again</Typography>
            </Box>
          </Box>
        );
      }
      return (
        <Box className={classes.settingsErrorHeader}>
          <Box className={classes.headerErrorIcon}>
            <ErrorIcon className={classes.settingErrorIcon} />
          </Box>
          <Box className={classes.settingsErrorHeaderText} data-cy="payment-request-error">
            {!sendPaymentRequestGQLError ||
              (sendPaymentRequestGQLError.reasonCode !== ServiceErrorReasonCode.EmailAssociatedWithACustomer && (
                <Typography className={classes.errorHeaderTypography}>{sendPaymentRequestError}</Typography>
              ))}
            {sendPaymentRequestGQLError &&
              sendPaymentRequestGQLError.reasonCode === ServiceErrorReasonCode.EmailAssociatedWithACustomer &&
              sendPaymentRequestGQLError.values &&
              getAutoFillCustomerErrorText(sendPaymentRequestGQLError.values)}
          </Box>
        </Box>
      );
    }
    // otherwise show nothing
    return <></>;
  };

  const header = generateHeader();
  return (
    <Paper aria-label={'payment request screen'} className={classes.paper}>
      <Helmet>
        <meta name="ai:viewId" content="payment-request"></meta>
        <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Payment Request"></meta>
        <title>Aptean Pay Merchant Portal - Payment Request</title>
      </Helmet>
      {/* {file upload info} */}
      <Snackbar
        open={displayFileInfoToast}
        autoHideDuration={3000}
        onClose={() => {
          setDisplayFileInfoToast(false);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert className={classes.warningAlertText} icon={<InfoIcon />} severity="warning">
          {fileInfoMessage}
        </Alert>
      </Snackbar>
      <LoadingMask loading={isLoading} />
      <div className={classes.header}>
        <Typography variant={'subtitle2'} className={classes.spacedTitle}>
          Send a New Payment Request
        </Typography>
        <Typography variant={'title'}>Enter request details</Typography>
      </div>
      <Divider />
      <DialogContent className={classes.paper}>
        {header}
        <Box className={classes.contentBox}>
          <Grid container spacing={2}>
            <Grid item container xs={12} md={gridMdSize} alignContent={'start'}>
              <Typography className={classes.subHeaders} variant={'subtitle1'}>
                Send To
              </Typography>
              <Grid container spacing={2}>
                {isCustomerEnabled && (
                  <>
                    <Grid item xs={12}>
                      <CustomerAutoComplete
                        fieldValue={recipientCustomer}
                        setFieldValue={setRecipientCustomer}
                        paymentsDisabled={!paymentsEnabled}
                        customerOption={customerOption}
                        setCustomerOption={setCustomerOption}
                        hasCustomerOptionError={hasCustomerOptionError}
                        hasCommunication={recipientEmail.length > 0}
                      />
                    </Grid>
                    <Grid item xs={12} className={classes.orContainer}>
                      <div className={classes.orDivider} />
                      <div className={classes.orCircle}>OR</div>
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Email Address"
                    inputProps={{
                      'aria-label': 'email address',
                      'aria-describedby': `${isRecipientEmailValid ? undefined : 'email-helpertext-id'}`,
                    }}
                    FormHelperTextProps={{ id: 'email-helpertext-id' }}
                    aria-required="true"
                    className={classes.textField}
                    autoComplete="nope"
                    type="email"
                    value={recipientEmail}
                    error={!isRecipientEmailValid}
                    helperText={isRecipientEmailValid ? null : 'Invalid Email Address'}
                    onChange={handleRecipientEmailChange}
                    onBlur={validateRecipientEmail}
                    ref={emailRef}
                    disabled={isCommunicationDisabled}
                    data-cy="recipient-email"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item container xs={12} md={gridMdSize} alignContent={'start'}>
              <Typography className={classes.subHeaders} variant={'subtitle1'}>
                Payment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CurrencyFormat
                    id="amount-id"
                    displayType="input"
                    customInput={TextField}
                    decimalScale={2}
                    allowNegative={false}
                    fullWidth
                    variant="outlined"
                    label={`$ Amount (${defaultCurrency})`}
                    InputProps={{
                      'aria-label': `amount ${defaultCurrency}`,
                      'aria-describedby': `${isAmountValid ? undefined : 'amount-helpertext-id'}`,
                    }}
                    FormHelperTextProps={{ id: 'amount-helpertext-id' }}
                    aria-required="true"
                    autoComplete="off"
                    className={classes.textField}
                    error={!isAmountValid}
                    value={amount}
                    helperText={isAmountValid ? null : 'Invalid Amount'}
                    onChange={handleAmountChange}
                    onBlur={validatePaymentRequestAmount}
                    ref={amountRef}
                    disabled={!paymentsEnabled}
                    data-cy="amount"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Reference Number"
                    inputProps={{
                      'aria-label': 'reference number',
                      'aria-describedby': `${isRefNumValid ? undefined : 'reference-helpertext-id'}`,
                    }}
                    FormHelperTextProps={{ id: 'reference-helpertext-id' }}
                    aria-required="true"
                    className={classes.textField}
                    error={!isRefNumValid}
                    value={refNum}
                    helperText={isRefNumValid ? null : 'Invalid Reference Number'}
                    onChange={handleRefNumChange}
                    onBlur={validateReferenceNumber}
                    ref={refRef}
                    disabled={!paymentsEnabled}
                    data-cy="reference-number"
                  />
                </Grid>
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      clearable
                      value={dueDate}
                      onChange={handleDueDateChange}
                      maxDate={maxDueDate}
                      minDate={minDueDate}
                      disabled={!paymentsEnabled}
                      disablePast={false}
                      onError={reason => {
                        if (reason) {
                          switch (reason) {
                            case 'minDate':
                            case 'disablePast':
                              setDatePickerError('Due date must be in the future');
                              break;
                            case 'disableFuture':
                            case 'maxDate':
                              setDatePickerError('Due date cannot be more than 90 days in the future');
                              break;
                            default:
                              setDatePickerError('Invalid date format');
                              break;
                          }
                        } else {
                          setDatePickerError(undefined);
                        }
                      }}
                      inputFormat="MM/dd/yyyy"
                      label="Due Date (Optional)"
                      views={['day']}
                      renderInput={params => (
                        <TextField
                          variant="outlined"
                          helperText={datePickerError || ''}
                          fullWidth
                          {...params}
                          aria-label={'due date'}
                        />
                      )}
                      data-cy="due-date"
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows="3"
                    variant="outlined"
                    label={`Additional Information (Optional) (${infoCharCount}/400)`}
                    inputProps={{
                      'aria-label': 'additional info',
                      maxLength: 400,
                    }}
                    className={classes.textField}
                    aria-required="false"
                    autoComplete="nope"
                    value={additionalInfo}
                    onChange={handleAdditionalInfoChange}
                    disabled={!paymentsEnabled}
                    data-cy="additional-info"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Paper elevation={0} className={classes.invoiceUploadPaper}>
            <Grid container justifyContent={'flex-end'} alignItems={'center'}>
              <Grid item xs={!invoices || invoices.length <= 0 ? 12 : 10}>
                <Typography className={classes.uploadTitle}>{`Upload invoices ${invoiceTotal}/${maxFiles}`}</Typography>
              </Grid>
              <Grid item justifyContent={'flex-end'} hidden={!invoices || invoices.length <= 0} xs={2}>
                <Button
                  variant="text"
                  className={classes.clearAllButton}
                  disableElevation
                  color="primary"
                  onClick={() => clearInvoiceData()}
                  data-cy="clear-all-files"
                >
                  Clear all
                </Button>
              </Grid>
            </Grid>
            {isLoadingInvoices && <LinearProgress variant="determinate" value={invoiceUploadProgress} />}
            <Grid container className={classes.dropContent}>
              <Grid item className={`${classes.dropArea} ${!invoices || invoices.length === 0 ? '' : classes.dropAreaShrunk}`}>
                <section className={classes.dropSection}>
                  <div {...getRootProps({ className: classes.dropButton })}>
                    <input data-cy="invoice-upload-input" {...getInputProps()} />
                    <div
                      className={`${classes.dropZoneOverlay} ${
                        !invoices || invoices.length === 0 ? '' : classes.dropAreaOverlayShrunk
                      }`}
                    >
                      <CloudUploadIcon className={classes.dropZoneOverlaySvg} fontSize={'large'} />
                      <div>
                        <div className={classes.dropZoneOverlayText}>
                          <div>
                            <span className={classes.dropZoneTextLine1}>
                              Drop your file here or <span className={classes.browseText}>Browse</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </Grid>
              {invoices && invoices.length > 0 && (
                <Grid item className={classes.invoiceChips}>
                  <Paper
                    elevation={0}
                    sx={{
                      display: 'flex',
                      justifyContent: 'start',
                      flexWrap: 'wrap',
                      listStyle: 'none',
                      p: 0.5,
                      m: 0,
                    }}
                    component="ul"
                  >
                    {invoices.map((value: InvoiceFileUpload, index: number) => {
                      return (
                        <ListItem key={index} className={`${classes.invoiceChip} ${!value.success ? classes.invalidInvoiceChip : ''}`}>
                          <Chip label={value.file.name} onDelete={() => handleInvoiceChipDelete(value)} />
                        </ListItem>
                      );
                    })}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
          <Grid item xs={12}>
            <Divider orientation="horizontal" className={classes.divider} />
          </Grid>
          <Grid item container justifyContent={'flex-end'} xs={12}>
            <Grid item>
              <Button
                className={classes.cancelButton}
                variant="outlined"
                disableElevation
                color="primary"
                onClick={handleCancelClick}
                data-cy="cancel-payment-request"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disableElevation
                color="primary"
                onClick={handleSendClick}
                disabled={!isPaymentRequestFormValid}
                data-cy="send-payment"
              >
                SEND REQUEST
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Paper>
  );
};

export default PaymentRequest;
