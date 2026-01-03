import {
  IconButton,
  Theme,
  Typography,
  Grid,
  useMediaQuery,
  TableContainer,
  Link,
  Button,
  Dialog,
  Tooltip,
  TextField,
  InputAdornment,
  Box,
  Paper,
  Tabs,
  Tab,
  DialogTitle,
  DialogContent,
  useTheme,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useState, useEffect } from 'react';
import {
  PaymentRequest,
  PaymentRequestStatus,
  CurrencyType,
  PaymentStatus,
  Payment,
  Maybe,
  PaymentRequestCommunication,
  PaymentRequestCommunicationStatus,
} from '../gql-types.generated';
import { paymentStatusDisplay } from '../util/PaymentStatus';
import CloseIcon from '@mui/icons-material/Close';
import CopyIcon from '@mui/icons-material/FileCopyOutlined';
import ErrorIcon from '@mui/icons-material/Error';
import { v4 as uuid4 } from 'uuid';
import CurrencyFormat from 'react-currency-format';
import LoadingMask from './LoadingMask';
import TabPanel from './TabPanel';
import { DateTime } from 'luxon';
import { DataGridPro, GridColDef, GridRenderCellParams, GridRowModel } from '@mui/x-data-grid-pro';
import DownloadInvoices from './DownloadInvoices';
import CommunicationUnsentIcon from '../CommunicationUnsent.svg';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogContent: {
      padding: theme.spacing(0, 0, 4, 0),
    },
    noPaddng: {
      padding: 0,
    },
    infoSections: {
      margin: 0,
      padding: theme.spacing(1.5),
    },
    contentSectionMd: {
      margin: 0,
      padding: theme.spacing(0.5, 1.5, 0, 2),
      marginRight: 48,
    },
    contentSectionSm: {
      margin: 0,
      padding: theme.spacing(0.5, 1.5, 0, 2),
      marginRight: 36,
    },
    titleText: {
      padding: 0,
      margin: 0,
    },
    referenceIdLink: {
      fontWeight: 'bold',
      margin: 0,
      wordWrap: 'break-word',
      wordBreak: 'break-all',
    },
    tooltip: {
      cursor: 'pointer',
      marginLeft: '0.3rem',
    },
    closeContainer: {
      textAlign: 'end',
    },
    closeButton: {
      color: theme.palette.uxGrey.main,
    },
    dialogContextError: {
      borderBottom: `1px solid ${theme.palette.uxGrey.border}`,
      padding: '8px 24px',
      backgroundColor: theme.palette.error.light,
      color: theme.palette.error.main,
      fontWeight: 500,
      display: 'flex',
      wordBreak: 'break-word',
    },
    dialogContextErrorIcon: {
      marginRight: 4,
    },
    label: {
      color: theme.palette.uxGrey.main,
    },
    value: {
      color: 'black',
    },
    cell: {
      color: theme.palette.uxGrey.main,
    },
    dialogButtons: {
      padding: theme.spacing(0.5, 0),
      marginBottom: theme.spacing(1),
    },
    amountField: {
      padding: theme.spacing(0, 2, 2, 0),
    },
    actionsGrid: {
      flexWrap: 'nowrap',
    },
    updateActions: {
      textAlign: 'end',
    },
    editCancel: {
      textAlign: 'end',
      display: 'inline-block',
      paddingTop: theme.spacing(0.5),
    },
    editSave: {
      textAlign: 'end',
      display: 'inline-block',
      marginLeft: theme.spacing(8),
      paddingTop: theme.spacing(0.5),
    },
    communicationTable: {
      width: '100%',
    },
    selectedTabSingle: {
      backgroundColor: theme.palette.uxBlue.activated,
      borderBottomWidth: 0,
    },
    selectedTab: {
      backgroundColor: theme.palette.uxBlue.activated,
    },
    tabRootPayment: {
      padding: theme.spacing(0, 6),
      minWidth: '50%',
    },
    tabRootCommunication: {
      padding: theme.spacing(0, 6),
      minWidth: '50%',
    },
    tabsIndicator: {
      height: 0,
      width: 0,
    },
    tabsIndicatorSingle: {
      height: '3px',
      color: theme.palette.primary.main,
    },
    tabsRoot: {
      borderBottom: `solid 3px ${theme.palette.primary.main}`,
    },
    tabRootSingle: {
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      borderBottomColor: theme.palette.uxGrey.focus,
    },
    cancelButton: {
      color: theme.palette.getContrastText(theme.palette.warning.main),
      backgroundColor: theme.palette.warning.main,
      '&:hover': {
        backgroundColor: theme.palette.error.main,
      },
    },
    remainingDiscount: {
      textDecoration: 'line-through',
      display: 'inline-block',
    },
    discountAmount: {
      display: 'inline-block',
      paddingLeft: theme.spacing(0.5),
    },
    creditReferenceText: {
      wordWrap: 'break-word',
      lineClamp: 1,
      boxOrient: 'vertical',
      display: 'box',
      overflow: 'hidden',
      wordBreak: 'break-all',
    },
    lastCellMd: {
      width: '40%',
    },
    referenceTooltip: {
      cursor: 'pointer',
      paddingBottom: 0,
    },
    referenceContent: {
      fontWeight: 'bold',
      margin: 0,
      wordWrap: 'break-word',
      wordBreak: 'break-all',
    },
    copyIcon: {
      fontSize: '1rem',
      marginLeft: 15,
    },
    contentHeaderText: {
      fontSize: '17px',
      fontWeight: 'bold',
    },
    closeTextField: {
      margin: theme.spacing(1, 0),
    },
    closeButtons: {
      paddingBottom: theme.spacing(1),
    },
    closeCancelButton: {
      marginRight: theme.spacing(1),
    },
    closeOrCompleteinfoSectionsMd: {
      margin: 0,
      padding: theme.spacing(3, 1.5, 1.5, 1.5),
      marginRight: 48,
      marginLeft: 44,
    },
    closeOrCompleteinfoSectionsSm: {
      margin: 0,
      padding: theme.spacing(3, 1.5, 1.5, 1.5),
      marginRight: 36,
      marginLeft: 32,
    },
    multiLineValue: {
      color: 'black',
      wordBreak: 'break-word',
      wordWrap: 'break-word',
    },
    actionButtonsContainerSm: {
      paddingLeft: 32,
      paddingTop: theme.spacing(1),
    },
    dialogWidth: {
      minWidth: 700,
      maxWidth: 700,
    },
    dataGrid: {
      '&.MuiDataGrid-root': {
        border: 'none',
      },
      '& .MuiDataGrid-cell:last-child': {
        paddingRight: 20,
      },
      '& .MuiDataGrid-columnHeader:last-child': {
        paddingRight: 20,
      },
      '& .MuiDataGrid-columnSeparator': {
        display: 'none !important',
      },
      '& .MuiDataGrid-columnHeader': {
        fontSize: '0.875rem',
        fontWeight: 500,
      },
      '& .MuiDataGrid-cell': {
        fontSize: '0.875rem',
      },
      '& div.MuiDataGrid-columnHeaderTitleContainer': {
        padding: 0,
      },
    },
    communicationContainer: {
      display: 'flex',
      width: '100%',
    },
    communicationText: {
      maxWidth: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    communicationUnsentIcon: {
      marginLeft: 8,
      width: '18px',
    },
    unsentMaxWidthText: {
      maxWidth: 'calc(100% - 27px)',
    },
    noPadding: {
      padding: 0,
    },
    dialogTitlePadding: {
      padding: 12,
    },
  }),
);

interface PaymentRequestDetailsProps {
  open: boolean;
  onClose: () => void;
  paymentRecord?: PaymentRequest;
  remind?: (paymentRequest: PaymentRequest) => void;
  defaultCurrency?: string | null;
  remindPressed: boolean;
  update?: (paymentRequest: PaymentRequest, amount: string) => void;
  updatePaymentRequestError?: Error;
  savePressed: boolean;
  setSavePressed?: (isSavePressed: boolean) => void;
  clearUpdatePaymentRequestError?: () => void;
  isFetchingPaymentById: boolean;
  historyDetailClicked?: (paymentId: string) => void;
  openModalFromPaymentHistory?: () => void;
  paymentById?: Payment;
  paymentByIdError?: Error;
  isCreditMemoEnabled: boolean;
  isClosingRequest?: boolean;
  setIsClosingRequest?: (isClosingRequest: boolean) => void;
  isCompletingRequest?: boolean;
  setIsCompletingRequest?: (isCompletingRequest: boolean) => void;
  closeOrCompleteRequest?: (paymentRequest: PaymentRequest | undefined, status: PaymentRequestStatus, statusReason: string) => void;
  isCloseOrCompleteWaiting: boolean;
  closeOrCompleteError?: Error;
  clearCloseOrCompleteError?: () => void;
  isLoadingRequestAfterUpdate?: boolean;
  requestAfterUpdateError?: Error;
  canUpdatePaymentRequest: boolean;
  hasPreviewWithNoEmail?: boolean;
}
const PaymentRequestDetails: React.FC<PaymentRequestDetailsProps> = props => {
  const classes = useStyles();
  const {
    paymentRecord,
    onClose,
    remind,
    defaultCurrency,
    open,
    remindPressed,
    update,
    updatePaymentRequestError,
    savePressed,
    setSavePressed,
    clearUpdatePaymentRequestError,
    isFetchingPaymentById,
    historyDetailClicked,
    openModalFromPaymentHistory,
    paymentById,
    paymentByIdError,
    isCreditMemoEnabled,
    isClosingRequest,
    setIsClosingRequest,
    isCompletingRequest,
    setIsCompletingRequest,
    closeOrCompleteRequest,
    isCloseOrCompleteWaiting,
    clearCloseOrCompleteError,
    isLoadingRequestAfterUpdate,
    closeOrCompleteError,
    requestAfterUpdateError,
    canUpdatePaymentRequest,
    hasPreviewWithNoEmail,
  } = props;
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const [referenceCopied, setReferenceCopied] = useState(false);
  const [isAmountEditable, setIsAmountEditable] = useState(false);
  const [isEditClicked, setIsEditClicked] = useState(false);
  const [amount, setAmount] = useState<string>('0.00');
  const [isValidAmount, setIsValidAmount] = useState(true);
  const [isPaymentExceeding, setIsPaymentExceeding] = useState(false);
  const [isPaymentBelow, setIsPaymentBelow] = useState(false);
  const [creditAmount, setCreditAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [requestRemainingBalance, setRequestRemainingBalance] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [closeReason, setCloseReason] = useState<string>('');
  const [completeReason, setCompleteReason] = useState<string>('');
  const [copiedTooltipOpen, setCopiedTooltipOpen] = useState(false);

  const hasPaymentsHistory = paymentRecord && paymentRecord.payments && paymentRecord.payments.length > 0;
  const hasCommmunicationHistory = paymentRecord && paymentRecord.communications && paymentRecord.communications.length > 0;
  const hasPaymentAndCommunicationHistory = hasPaymentsHistory && hasCommmunicationHistory;
  const isMediumSize = hasPaymentsHistory || hasCommmunicationHistory;
  const hasLoader = (isFetchingPaymentById ||
    remindPressed ||
    savePressed ||
    isCloseOrCompleteWaiting ||
    isLoadingRequestAfterUpdate) as boolean;

  const getIsDiscountValid = () => {
    const discountEndDate = DateTime.fromISO(paymentRecord?.discountEndDate);
    const hasPayments = paymentRecord?.payments && paymentRecord?.payments.length > 0;
    const lastIndex = hasPayments ? paymentRecord?.payments.length || 0 : 0;
    const lastPaymentDate = lastIndex
      ? DateTime.fromISO(paymentRecord?.payments[lastIndex - 1]?.attemptTimestamp || paymentRecord?.payments[lastIndex - 1]?.createdAt)
      : false;
    const unpaidDiscountEndValid = discountEndDate.isValid && discountEndDate > DateTime.utc();
    const paidDiscountEndValid =
      discountEndDate.isValid && lastPaymentDate && lastPaymentDate.isValid && discountEndDate >= lastPaymentDate;
    const unpaidStatus =
      paymentRecord?.status === PaymentRequestStatus.Unpaid ||
      paymentRecord?.status === PaymentRequestStatus.Failed ||
      paymentRecord?.status === PaymentRequestStatus.Canceled ||
      paymentRecord?.status === PaymentRequestStatus.PartiallyPaid;
    const paidStatus =
      paymentRecord?.status === PaymentRequestStatus.Completed ||
      paymentRecord?.status === PaymentRequestStatus.PartiallyRefunded ||
      paymentRecord?.status === PaymentRequestStatus.FullyRefunded ||
      paymentRecord?.status === PaymentRequestStatus.RefundFailed ||
      paymentRecord?.status === PaymentRequestStatus.RefundPending ||
      paymentRecord?.status === PaymentRequestStatus.Pending;
    const discountValid = (paidStatus && paidDiscountEndValid) || (unpaidStatus && unpaidDiscountEndValid);
    return discountValid;
  };
  const isDiscountValid = getIsDiscountValid();

  useEffect(() => {
    setPaidAmount(0);
    setCreditAmount(0);
    setRequestRemainingBalance(paymentRecord?.amount || 0);
  }, []);

  useEffect(() => {
    setIsAmountEditable(
      paymentRecord?.status === PaymentRequestStatus.Unpaid ||
        paymentRecord?.status === PaymentRequestStatus.Failed ||
        paymentRecord?.status === PaymentRequestStatus.Canceled,
    );
    setIsEditClicked(false);
    setIsValidAmount(true);
    setIsPaymentExceeding(false);
    setIsPaymentBelow(false);
    if (paymentRecord?.amount) setAmount((paymentRecord.amount / 100).toString());
    let remaining = paymentRecord?.amount || 0;

    if (paymentRecord?.payments && paymentRecord?.payments.length > 0) {
      let credit = 0;
      let paid = 0;

      paymentRecord.payments.forEach(paymentSnapshot => {
        if (paymentSnapshot?.status === PaymentStatus.Completed || paymentSnapshot?.status === PaymentStatus.Pending) {
          credit += paymentSnapshot?.creditAmount || 0;
          paid += paymentSnapshot?.amount || 0;
        }
      });

      setCreditAmount(credit);
      setPaidAmount(paid);
      remaining -= paid;
      remaining -= credit;
    } else {
      setPaidAmount(0);
      setCreditAmount(0);
    }
    setRequestRemainingBalance(remaining);
  }, [paymentRecord]);

  useEffect(() => {
    if (savePressed && updatePaymentRequestError && setSavePressed) setSavePressed(false);
  }, [updatePaymentRequestError]);

  useEffect(() => {
    if (openModalFromPaymentHistory && (paymentById || paymentByIdError)) {
      openModalFromPaymentHistory();
    }
  }, [paymentById, paymentByIdError]);

  const validateAmount = (value: string) => {
    const floatValue = Math.round(parseFloat(value) * 100);
    const paymentExceeding = paymentRecord?.amount ? floatValue >= paymentRecord?.amount : false;
    setIsPaymentExceeding(paymentExceeding);

    const paymentBelow = isDiscountValid && paymentRecord?.discountAmount ? floatValue < paymentRecord?.discountAmount + 100 : false;
    setIsPaymentBelow(paymentBelow);

    if (
      !value ||
      value.length === 0 ||
      Number.isNaN(floatValue) ||
      floatValue <= 0 ||
      value.indexOf('-') > -1 ||
      paymentExceeding ||
      paymentBelow
    ) {
      return false;
    }

    return true;
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (savePressed && setSavePressed) setSavePressed(false);
    const value = event.target.value.trim();
    setAmount(value);
    setIsValidAmount(validateAmount(value));
  };

  const handleEditClick = () => {
    if (savePressed && setSavePressed) setSavePressed(false);
    setIsEditClicked(true);
    setIsValidAmount(false);
    setIsPaymentExceeding(true);
    setIsPaymentBelow(false);
    if (paymentRecord?.amount) setAmount((paymentRecord.amount / 100).toString());
  };

  const handleOnClose = () => {
    onClose();
    if (isEditClicked) setIsEditClicked(false);
    if (tabValue === 1) setTabValue(0);
    setCloseReason('');
    setCompleteReason('');
  };

  const handleOnCancel = () => {
    setIsEditClicked(false);
    if (updatePaymentRequestError && clearUpdatePaymentRequestError) clearUpdatePaymentRequestError();
  };

  const handleTabChange = (_event: unknown, newValue: number) => {
    setTabValue(newValue);
  };

  const getPaymentMethod = (paymentRecord?: Payment | null) => {
    const isCreditPayment = (paymentRecord?.creditAmount &&
      paymentRecord.creditAmount > 0 &&
      (paymentRecord.amount === 0 || !paymentRecord?.amount)) as boolean;
    if (!isCreditPayment && paymentRecord?.paymentMethod?.creditCard) {
      return `${paymentRecord?.paymentMethod.creditCard.cardBrand?.substring(0, 1)}${paymentRecord?.paymentMethod.creditCard.cardBrand
        ?.substring(1)
        .toLowerCase()} ${paymentRecord?.paymentMethod.creditCard.lastFour}`;
    }
    if (!isCreditPayment && paymentRecord?.paymentMethod?.paymentBank) {
      return `Bank ${paymentRecord?.paymentMethod.paymentBank.lastFour}`;
    }
    return 'None';
  };

  const handleCloseClick = () => {
    if (setIsClosingRequest) {
      setIsClosingRequest(true);
      setCloseReason('');
    }
  };

  const handleCloseReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCloseReason(event.target.value);
  };

  const handleCloseRequestCancelClick = () => {
    if (setIsClosingRequest) {
      setIsClosingRequest(false);
      setCloseReason('');
      if (clearCloseOrCompleteError) clearCloseOrCompleteError();
    }
  };

  const handleCloseRequestClick = () => {
    if (closeReason && closeOrCompleteRequest) {
      closeOrCompleteRequest(paymentRecord, PaymentRequestStatus.Closed, closeReason);
    }
  };

  const handleCompleteClick = () => {
    if (setIsCompletingRequest) {
      setIsCompletingRequest(true);
      setCompleteReason('');
    }
  };

  const handleCompleteReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompleteReason(event.target.value);
  };

  const handleCompleteRequestCancelClick = () => {
    if (setIsCompletingRequest) {
      setIsCompletingRequest(false);
      setCloseReason('');
      if (clearCloseOrCompleteError) clearCloseOrCompleteError();
    }
  };

  const handleCompleteRequestClick = () => {
    if (completeReason && closeOrCompleteRequest) {
      closeOrCompleteRequest(paymentRecord, PaymentRequestStatus.Completed, completeReason);
    }
  };

  const communicationColumns: GridColDef[] = [
    {
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams) => {
        const { isUnsentCommunication } = params?.row;
        return (
          <div className={classes.communicationContainer}>
            <Typography
              variant="inherit"
              className={`${classes.communicationText} ${isUnsentCommunication ? classes.unsentMaxWidthText : undefined}`}
            >
              {params.value}
            </Typography>
            {isUnsentCommunication && <img src={CommunicationUnsentIcon} alt="not sent" className={classes.communicationUnsentIcon} />}
          </div>
        );
      },
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'contact',
      sortable: false,
      headerName: 'To',
      flex: 0.4,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'communicationType',
      sortable: false,
      headerName: 'Type',
      flex: 0.15,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'requestTimestamp',
      sortable: false,
      headerName: 'Date Sent',
      flex: 0.3,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      sortable: false,
      field: 'paymentUrl',
      headerName: '',
      headerAlign: 'center',
      align: 'center',
      minWidth: 120,
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams) => {
        // eslint-disable-next-line no-underscore-dangle
        const { row, api } = params;
        const index = api.getRowIndex(row.id);
        // Only render the Copy URL button in the first row of communications.
        // This button isn't meant to have high visibility, and each row would have the same url, so only show on first.
        if (row.paymentUrl && index === 0) {
          return (
            <Tooltip open={copiedTooltipOpen} title="Copied to clipboard">
              <Button
                variant="outlined"
                color="primary"
                data-cy="request-refund"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(row.paymentUrl);
                  }
                  setCopiedTooltipOpen(true);
                  setTimeout(() => {
                    setCopiedTooltipOpen(false);
                  }, 2000);
                }}
              >
                Copy URL
              </Button>
            </Tooltip>
          );
        }
        return <></>;
      },
    },
  ];

  const getCommunicationHistoryRows = () => {
    const communications = paymentRecord?.communications
      ?.slice()
      .sort((a: Maybe<PaymentRequestCommunication>, b: Maybe<PaymentRequestCommunication>) => {
        const aDate = DateTime.fromISO(a?.requestTimestamp || new Date(0).toISOString());
        const bDate = DateTime.fromISO(b?.requestTimestamp || new Date(0).toISOString());

        return aDate > bDate ? 1 : -1;
      });

    return communications?.map((row: Maybe<PaymentRequestCommunication>) => {
      const node = row;
      if (!node) {
        return {} as GridRowModel;
      }

      const isUnsentCommunication = node?.status === PaymentRequestCommunicationStatus.Unsent;
      return {
        _raw: node,
        id: node.id || uuid4(),
        contact: node.phoneNumber || node.email,
        communicationType: node.communicationType,
        requestTimestamp: node.sentTimestamp ? new Date(node.sentTimestamp as string).toLocaleDateString() : '',
        paymentUrl: paymentRecord?.paymentUrl,
        isUnsentCommunication,
      } as GridRowModel;
    }) as GridRowModel[];
  };
  const communicationHistory = () => {
    return (
      <Box data-cy="pr-details-comm-table">
        <DataGridPro
          rowHeight={58}
          aria-label="communications"
          hideFooterPagination
          hideFooter
          hideFooterSelectedRowCount
          className={classes.dataGrid}
          rows={getCommunicationHistoryRows()}
          columns={communicationColumns}
          autoHeight
        />
      </Box>
    );
  };
  const paymentHistoryRows: GridRowModel[] = [];
  let remainingBalanceCalc = paymentRecord?.amount || 0;
  paymentRecord?.payments?.forEach((payment: Maybe<Payment>, index) => {
    const paymentMethod = getPaymentMethod(payment);
    const node = payment;
    if (node) {
      const paymentDate = node?.attemptTimestamp || node?.createdAt;
      const statusCompletedOrPending = node?.status === PaymentStatus.Completed || node?.status === PaymentStatus.Pending;
      if (node?.amount && node.amount > 0) {
        remainingBalanceCalc -= statusCompletedOrPending ? node?.amount : 0;
        paymentHistoryRows.push({
          _raw: node,
          id: `${node.id}-${index}`,
          key: `${node.id}-${index}`,
          paymentId: node.id,
          creditAmount: new Intl.NumberFormat('en', {
            style: 'currency',
            currency: defaultCurrency || 'USD',
            currencyDisplay: 'symbol',
          }).format(0 / 100),
          referenceNumber: '',
          paymentDate: paymentDate ? new Date(paymentDate).toLocaleDateString() : '',
          paymentMethod,
          paymentMethodAmount: new Intl.NumberFormat('en', {
            style: 'currency',
            currency: defaultCurrency || 'USD',
            currencyDisplay: 'symbol',
          }).format(node?.amount / 100),
          balance: new Intl.NumberFormat('en', {
            style: 'currency',
            currency: defaultCurrency || 'USD',
            currencyDisplay: 'symbol',
          }).format(remainingBalanceCalc / 100),
          total: new Intl.NumberFormat('en', {
            style: 'currency',
            currency: defaultCurrency || 'USD',
            currencyDisplay: 'symbol',
          }).format((node?.amount || 0) / 100),
          status: paymentStatusDisplay.find(item => {
            return item.name === payment?.status;
          })?.display,
        } as GridRowModel);
      }
      if (node?.creditAmount && node.creditAmount > 0) {
        node?.creditMemoAllocation?.forEach((creditMemo, innerIndex) => {
          const creditAmount = creditMemo?.amount || 0;
          remainingBalanceCalc -= statusCompletedOrPending ? creditAmount : 0;
          paymentHistoryRows.push({
            _raw: node,
            id: `${node.id}-${index}-${innerIndex}`,
            key: `${node.id}-${index}-${innerIndex}`,
            paymentId: node.id,
            creditAmount: new Intl.NumberFormat('en', {
              style: 'currency',
              currency: defaultCurrency || 'USD',
              currencyDisplay: 'symbol',
            }).format((creditAmount || 0) / 100),
            referenceNumber: creditMemo?.referenceNumber,
            paymentDate: paymentDate ? new Date(paymentDate).toLocaleDateString() : '',
            paymentMethod: 'None',
            paymentMethodAmount: new Intl.NumberFormat('en', {
              style: 'currency',
              currency: defaultCurrency || 'USD',
              currencyDisplay: 'symbol',
            }).format(0 / 100),
            total: new Intl.NumberFormat('en', {
              style: 'currency',
              currency: defaultCurrency || 'USD',
              currencyDisplay: 'symbol',
            }).format((creditAmount || 0) / 100),
            balance: new Intl.NumberFormat('en', {
              style: 'currency',
              currency: defaultCurrency || 'USD',
              currencyDisplay: 'symbol',
            }).format(remainingBalanceCalc / 100),
            status: paymentStatusDisplay.find(item => {
              return item.name === node?.status;
            })?.display,
          } as GridRowModel);
        });
      }
    }
  });
  const paymentHistoryColumns: GridColDef[] = [
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'paymentId',
      sortable: false,
      headerName: 'Payment ID',
      minWidth: 120,
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams) => {
        // eslint-disable-next-line no-underscore-dangle
        const { row } = params;
        return (
          <Link
            underline={'hover'}
            href="#"
            onClick={() => {
              if (historyDetailClicked && row?.paymentId) historyDetailClicked(row?.paymentId);
            }}
            aria-label={`open payment details id ending with ${row?.paymentId?.slice(-4)}`}
            data-cy="payment-history-id"
          >{`***${row?.paymentId?.slice(-9)}`}</Link>
        );
      },
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'paymentDate',
      sortable: false,
      headerName: 'Payment Date',
      minWidth: 140,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'creditAmount',
      sortable: false,
      headerName: 'Credit Applied',
      hide: !isCreditMemoEnabled,
      headerAlign: 'right',
      align: 'right',
      minWidth: 140,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'paymentMethodAmount',
      sortable: false,
      headerName: 'Paid',
      hide: !isCreditMemoEnabled,
      headerAlign: 'right',
      align: 'right',
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'paymentMethod',
      sortable: false,
      headerName: 'Payment Method',
      minWidth: 160,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'total',
      sortable: false,
      headerName: 'Total',
      headerAlign: 'right',
      align: 'right',
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'balance',
      sortable: false,
      headerName: 'Balance',
      headerAlign: 'right',
      align: 'right',
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'referenceNumber',
      sortable: false,
      headerName: 'Details',
      hide: !isCreditMemoEnabled,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'status',
      sortable: false,
      headerName: 'Payment Status',
      minWidth: 150,
    },
  ];
  const paymentHistory = () => {
    return (
      <Box data-cy="pr-details-payment-history-table">
        <DataGridPro
          rowHeight={58}
          aria-label="payment history"
          hideFooterPagination
          hideFooter
          hideFooterSelectedRowCount
          className={classes.dataGrid}
          rows={paymentHistoryRows}
          columns={paymentHistoryColumns}
          autoHeight
        />
      </Box>
    );
  };

  const closePaymentRequest = () => {
    return (
      <>
        <Grid container>
          <Grid item xs={12}>
            <Typography className={classes.contentHeaderText}>Close Payment Request</Typography>
          </Grid>
          <Grid item xs={12} className={classes.closeTextField}>
            <TextField
              inputProps={{ 'aria-label': 'close payment request reason' }}
              variant="outlined"
              fullWidth
              placeholder={'Reason'}
              value={closeReason}
              onChange={handleCloseReasonChange}
              autoFocus
            />
          </Grid>
        </Grid>
        <Grid item container xs={12} justifyContent="flex-end" className={classes.closeButtons}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={handleCloseRequestCancelClick}
            className={classes.closeCancelButton}
          >
            CANCEL
          </Button>
          {/* close request apply */}
          <Button size="small" variant="contained" color="primary" onClick={handleCloseRequestClick} disabled={!closeReason}>
            CLOSE REQUEST
          </Button>
        </Grid>
      </>
    );
  };

  const completePaymentRequest = () => {
    return (
      <>
        <Grid container>
          <Grid item xs={12}>
            <Typography className={classes.contentHeaderText}>Complete Payment Request</Typography>
          </Grid>
          <Grid item xs={12} className={classes.closeTextField}>
            <TextField
              inputProps={{ 'aria-label': 'complete payment request reason' }}
              variant="outlined"
              fullWidth
              placeholder={'Reason'}
              value={completeReason}
              onChange={handleCompleteReasonChange}
              autoFocus
            />
          </Grid>
        </Grid>
        <Grid item container xs={12} justifyContent="flex-end" className={classes.closeButtons}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={handleCompleteRequestCancelClick}
            className={classes.closeCancelButton}
          >
            CANCEL
          </Button>
          {/* close request apply */}
          <Button size="small" variant="contained" color="primary" onClick={handleCompleteRequestClick} disabled={!completeReason}>
            COMPLETE REQUEST
          </Button>
        </Grid>
      </>
    );
  };

  return (
    <Dialog
      aria-label={'payment request details dialog'}
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleOnClose();
        }
      }}
      disableEscapeKeyDown={hasLoader}
      fullWidth={isMediumSize || matches}
      maxWidth={'md'}
      classes={{ paper: isMediumSize || matches ? '' : classes.dialogWidth }}
      aria-labelledby="modal-title"
    >
      <>
        <LoadingMask loading={hasLoader} />
        <DialogTitle classes={{ root: classes.dialogTitlePadding }}>
          <Grid container>
            <Grid item xs={10}>
              <Typography variant="subtitle2" className={classes.titleText} id="modal-title">
                PAYMENT REQUEST
              </Typography>
              <Typography className={classes.titleText}>
                <Tooltip
                  className={classes.referenceTooltip}
                  title={`${referenceCopied ? 'Copied' : 'Copy'} to clipboard`}
                  placement="bottom-start"
                >
                  <Link
                    underline={'hover'}
                    className={classes.referenceContent}
                    color="primary"
                    onClick={() => {
                      setReferenceCopied(true);
                      navigator.clipboard.writeText(paymentRecord?.referenceNumber || '');
                    }}
                    onMouseEnter={() => {
                      if (referenceCopied) setReferenceCopied(false);
                    }}
                    onFocus={() => {
                      if (referenceCopied) setReferenceCopied(false);
                    }}
                    href="#"
                    data-cy="payment-id-copy"
                  >
                    {paymentRecord?.referenceNumber}
                    <CopyIcon className={classes.copyIcon} />
                  </Link>
                </Tooltip>
              </Typography>
            </Grid>
            <Grid item xs={2} className={classes.closeContainer}>
              <IconButton
                aria-label="close"
                title="close"
                className={classes.closeButton}
                onClick={handleOnClose}
                data-cy="pr-details-close"
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent className={classes.noPadding}>
          <Box
            className={isCompletingRequest || isClosingRequest ? classes.noPaddng : classes.dialogContent}
            data-cy="payment-request-details-modal"
          >
            {updatePaymentRequestError && (
              <Box className={classes.dialogContextError} data-cy="refund-error-message">
                <ErrorIcon className={classes.dialogContextErrorIcon} />
                {updatePaymentRequestError.message}
              </Box>
            )}
            {closeOrCompleteError && (
              <Box className={classes.dialogContextError} data-cy="refund-error-message">
                <ErrorIcon className={classes.dialogContextErrorIcon} />
                {closeOrCompleteError.message}
              </Box>
            )}
            {requestAfterUpdateError && (
              <Box className={classes.dialogContextError} data-cy="refund-error-message">
                <ErrorIcon className={classes.dialogContextErrorIcon} />
                {requestAfterUpdateError.message}
              </Box>
            )}
            <Box className={matches ? classes.contentSectionSm : classes.contentSectionMd}>
              <Grid container>
                <Grid container item xs={12} md={9}>
                  <Grid container spacing={1}>
                    {paymentRecord?.orderNumber ? (
                      <>
                        <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                          <Typography variant="body1" className={classes.label}>
                            Order#
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                          <Typography variant="body1" className={classes.multiLineValue}>
                            {paymentRecord?.orderNumber}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}

                    {paymentRecord?.customerPONumber ? (
                      <>
                        <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                          <Typography variant="body1" className={classes.label}>
                            Customer PO#
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                          <Typography variant="body1" className={classes.multiLineValue}>
                            {paymentRecord?.customerPONumber}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}

                    {paymentRecord?.invoiceNumber ? (
                      <>
                        <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                          <Typography variant="body1" className={classes.label}>
                            Invoice#
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                          <Typography variant="body1" className={classes.multiLineValue}>
                            {paymentRecord?.invoiceNumber}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}

                    {paymentRecord?.statusReason ? (
                      <>
                        <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                          <Typography variant="body1" className={classes.label}>
                            Status Reason
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                          <Typography variant="body1" className={classes.multiLineValue}>
                            {paymentRecord?.statusReason}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}

                    <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                      <Typography variant="body1" className={classes.label}>
                        Total Requested
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                      {isAmountEditable && isEditClicked ? (
                        <Grid container xs={12}>
                          <Grid item container xs={12} md={10} className={classes.amountField}>
                            <Grid xs={12}>
                              <CurrencyFormat
                                id="payment-request-edit-id"
                                displayType="input"
                                customInput={TextField}
                                decimalScale={2}
                                allowNegative={false}
                                autoFocus
                                variant="outlined"
                                margin="none"
                                size="small"
                                error={!isValidAmount}
                                value={amount}
                                onChange={handleAmountChange}
                                disabled={savePressed}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Typography>{`${defaultCurrency === CurrencyType.Cad ? 'CA' : ''}$`}</Typography>
                                    </InputAdornment>
                                  ),
                                }}
                                inputProps={{
                                  'aria-label': 'total requested amount',
                                  'aria-describedby': `${isValidAmount ? undefined : 'edit-amount-error1-id edit-amount-error2-id'}`,
                                }}
                                data-cy="amount-edit"
                              />
                            </Grid>
                            {isPaymentExceeding && (
                              <Grid xs={12}>
                                <Typography variant={'body2'} id="edit-amount-error1-id">
                                  Enter an amount less than the amount currently due.
                                </Typography>
                              </Grid>
                            )}
                            {isPaymentBelow && (
                              <Grid xs={12} id="edit-amount-error2-id">
                                <Typography variant={'label1'}>Enter an amount greater than the discount amount.</Typography>
                              </Grid>
                            )}
                          </Grid>
                          <Grid item container xs={12} md={2} className={matches ? '' : classes.actionsGrid}>
                            <Grid item xs={8} sm={7} md={6} className={matches ? classes.updateActions : classes.editCancel}>
                              <Button
                                variant="contained"
                                size="small"
                                disabled={savePressed}
                                onClick={handleOnCancel}
                                className={classes.cancelButton}
                                data-cy="cancel-edit"
                              >
                                CANCEL
                              </Button>
                            </Grid>
                            <Grid item xs={4} sm={5} md={6} className={matches ? classes.updateActions : classes.editSave}>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled={savePressed || !isValidAmount}
                                onClick={() => {
                                  if (paymentRecord && update) update(paymentRecord, amount);
                                }}
                                data-cy="save-edit"
                              >
                                SAVE
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      ) : (
                        <Grid container>
                          <Grid item xs={12}>
                            <Typography variant="body1" className={classes.value}>
                              {typeof paymentRecord?.amount === 'number'
                                ? new Intl.NumberFormat('en', {
                                    style: 'currency',
                                    currency: defaultCurrency || 'USD',
                                    currencyDisplay: 'symbol',
                                  }).format(paymentRecord.amount / 100)
                                : ''}
                            </Typography>
                          </Grid>
                        </Grid>
                      )}
                    </Grid>

                    {paymentRecord?.dueDate && (
                      <>
                        <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                          <Typography variant="body1" className={classes.label}>
                            Payment Due Date
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                          <Typography variant="body1" className={classes.value}>
                            {new Date(paymentRecord.dueDate as string).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </>
                    )}

                    {paymentRecord?.discountEndDate && paymentRecord?.discountAmount && (
                      <>
                        <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                          <Typography variant="body1" className={classes.label}>
                            Discount End Date
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                          <Typography variant="body1" className={classes.value}>
                            {new Date(paymentRecord.discountEndDate as string).toLocaleDateString()}
                          </Typography>
                        </Grid>

                        <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                          <Typography variant="body1" className={classes.label}>
                            Discount Amount
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                          <Typography variant="body1" className={classes.value}>
                            {typeof paymentRecord?.discountAmount === 'number'
                              ? new Intl.NumberFormat('en', {
                                  style: 'currency',
                                  currency: defaultCurrency || 'USD',
                                  currencyDisplay: 'symbol',
                                }).format(paymentRecord?.discountAmount / 100)
                              : ''}
                          </Typography>
                        </Grid>
                      </>
                    )}

                    {!!creditAmount && isCreditMemoEnabled && (
                      <>
                        <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                          <Typography variant="body1" className={classes.label}>
                            Credit Applied
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                          <Typography variant="body1" className={classes.value}>
                            {new Intl.NumberFormat('en', {
                              style: 'currency',
                              currency: defaultCurrency || 'USD',
                              currencyDisplay: 'symbol',
                            }).format(creditAmount / 100)}
                          </Typography>
                        </Grid>
                      </>
                    )}

                    <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                      <Typography variant="body1" className={classes.label}>
                        Total Paid
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                      <Typography variant="body1" className={classes.value}>
                        {new Intl.NumberFormat('en', {
                          style: 'currency',
                          currency: defaultCurrency || 'USD',
                          currencyDisplay: 'symbol',
                        }).format(paidAmount / 100)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                      <Typography variant="body1" className={classes.label}>
                        Remaining Balance
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                      <Typography variant="body1" className={isDiscountValid ? classes.remainingDiscount : classes.value}>
                        {new Intl.NumberFormat('en', {
                          style: 'currency',
                          currency: defaultCurrency || 'USD',
                          currencyDisplay: 'symbol',
                        }).format(requestRemainingBalance / 100)}
                      </Typography>
                      {isDiscountValid && (
                        <Typography variant="body1" color="error" className={classes.discountAmount}>
                          {new Intl.NumberFormat('en', {
                            style: 'currency',
                            currency: defaultCurrency || 'USD',
                            currencyDisplay: 'symbol',
                          }).format((requestRemainingBalance - (paymentRecord?.discountAmount || 0)) / 100)}
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                      <Typography variant="body1" className={classes.label}>
                        Status
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                      <Typography variant="body1" className={classes.value}>
                        {
                          paymentStatusDisplay.find(item => {
                            return item.name === paymentRecord?.status;
                          })?.display
                        }
                      </Typography>
                    </Grid>

                    {paymentRecord?.owner?.customerId && (
                      <>
                        <Grid item xs={6} md={isMediumSize ? 5 : 6}>
                          <Typography variant="body1" className={classes.label}>
                            Customer Name/Number
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSize ? 7 : 6}>
                          <Typography variant="body1" className={classes.value}>
                            {`${paymentRecord?.customer?.name} - ${paymentRecord?.customer?.customerNumber}`}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
                <Grid item xs={12} md={3} className={matches ? classes.actionButtonsContainerSm : ''}>
                  {!(isEditClicked && isAmountEditable) && isClosingRequest !== true && isCompletingRequest !== true && (
                    <>
                      {canUpdatePaymentRequest &&
                        (paymentRecord?.status === PaymentRequestStatus.Unpaid ||
                          paymentRecord?.status === PaymentRequestStatus.Failed ||
                          paymentRecord?.status === PaymentRequestStatus.Canceled ||
                          paymentRecord?.status === PaymentRequestStatus.PartiallyPaid) &&
                        ((paymentRecord?.communications && paymentRecord.communications.length > 0) ||
                          paymentRecord?.owner?.customerId) && (
                          <Button
                            className={classes.dialogButtons}
                            size="small"
                            variant="outlined"
                            color="primary"
                            fullWidth
                            disabled={remindPressed || hasPreviewWithNoEmail}
                            onClick={() => {
                              if (paymentRecord && remind) remind(paymentRecord);
                            }}
                            data-cy="pr-details-send"
                          >
                            Send
                          </Button>
                        )}
                      {canUpdatePaymentRequest && isAmountEditable && paymentRecord && paymentRecord?.communications.length > 0 && (
                        <Button
                          className={classes.dialogButtons}
                          size="small"
                          variant="outlined"
                          color="primary"
                          fullWidth
                          onClick={handleEditClick}
                          data-cy="edit-amount"
                        >
                          Edit Balance
                        </Button>
                      )}
                      {canUpdatePaymentRequest &&
                        (paymentRecord?.status === PaymentRequestStatus.Unpaid ||
                          paymentRecord?.status === PaymentRequestStatus.Failed ||
                          paymentRecord?.status === PaymentRequestStatus.Canceled) && (
                          <Button
                            className={classes.dialogButtons}
                            size="small"
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={handleCloseClick}
                            data-cy="pr-details-closeRequest"
                          >
                            Close Request
                          </Button>
                        )}
                      {canUpdatePaymentRequest && paymentRecord?.status === PaymentRequestStatus.PartiallyPaid && (
                        <Button
                          className={classes.dialogButtons}
                          size="small"
                          variant="outlined"
                          color="primary"
                          fullWidth
                          onClick={handleCompleteClick}
                          data-cy="pr-details-completeRequest"
                        >
                          Complete Request
                        </Button>
                      )}
                      <DownloadInvoices
                        isIconButton={false}
                        invoiceUrl={paymentRecord?.invoiceLink}
                        invoicesUrlList={paymentRecord?.invoiceLinks}
                      />
                    </>
                  )}
                </Grid>
              </Grid>
            </Box>
            {(hasPaymentsHistory || hasCommmunicationHistory) && isClosingRequest !== true && isCompletingRequest !== true && (
              <Box className={classes.infoSections}>
                <Paper elevation={0}>
                  <Tabs
                    indicatorColor={'primary'}
                    textColor={'primary'}
                    variant={hasPaymentAndCommunicationHistory ? 'fullWidth' : 'standard'}
                    value={tabValue}
                    onChange={handleTabChange}
                    classes={{
                      root: hasPaymentAndCommunicationHistory ? '' : classes.tabsRoot,
                      indicator: hasPaymentAndCommunicationHistory ? classes.tabsIndicatorSingle : classes.tabsIndicator,
                    }}
                  >
                    {hasPaymentsHistory && (
                      <Tab
                        classes={{
                          selected: hasPaymentAndCommunicationHistory ? classes.selectedTabSingle : classes.selectedTab,
                          root: hasPaymentAndCommunicationHistory ? classes.tabRootSingle : classes.tabRootPayment,
                        }}
                        label="PAYMENT HISTORY"
                        id="payment-history-tab"
                        data-cy="payment-history-tab"
                      />
                    )}
                    {hasCommmunicationHistory && (
                      <Tab
                        classes={{
                          selected: hasPaymentAndCommunicationHistory ? classes.selectedTabSingle : classes.selectedTab,
                          root: hasPaymentAndCommunicationHistory ? classes.tabRootSingle : classes.tabRootCommunication,
                        }}
                        label="COMMUNICATION HISTORY"
                        id="communication-history-tab"
                        data-cy="communication-history-tab"
                      />
                    )}
                  </Tabs>
                  {hasPaymentsHistory && (
                    <TabPanel value={tabValue} index={0} data-cy="payment--history-panel">
                      <TableContainer className={classes.communicationTable}>{paymentHistory()}</TableContainer>
                    </TabPanel>
                  )}
                  {hasCommmunicationHistory && (
                    <TabPanel value={tabValue} index={hasPaymentAndCommunicationHistory ? 1 : 0} data-cy="communication-history-panel">
                      <TableContainer className={classes.communicationTable}>{communicationHistory()}</TableContainer>
                    </TabPanel>
                  )}
                </Paper>
              </Box>
            )}
            {isClosingRequest && (
              <Box className={matches ? classes.closeOrCompleteinfoSectionsSm : classes.closeOrCompleteinfoSectionsMd}>
                {closePaymentRequest()}
              </Box>
            )}
            {isCompletingRequest && (
              <Box className={matches ? classes.closeOrCompleteinfoSectionsSm : classes.closeOrCompleteinfoSectionsMd}>
                {completePaymentRequest()}
              </Box>
            )}
          </Box>
        </DialogContent>
      </>
    </Dialog>
  );
};
export default PaymentRequestDetails;
