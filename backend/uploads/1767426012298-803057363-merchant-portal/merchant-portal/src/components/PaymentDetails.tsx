import {
  IconButton,
  Theme,
  Typography,
  Grid,
  Button,
  Dialog,
  Tooltip,
  Link,
  useMediaQuery,
  Paper,
  Tabs,
  Tab,
  Box,
  DialogTitle,
  DialogContent,
  useTheme,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Alert } from '@mui/lab';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import React, { useEffect, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { Payment, PaymentStatus, RefundStatus, PaymentRequest, Maybe, PaymentRequestAllocation, Refund } from '../gql-types.generated';
import { paymentStatusDisplay } from '../util/PaymentStatus';
import CloseIcon from '@mui/icons-material/Close';
import CopyIcon from '@mui/icons-material/FileCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { v4 as uuid4 } from 'uuid';
import { PaymentStatusForDisplay } from '../util/PaymentStatusForDisplay';
import LoadingMask from './LoadingMask';
import TabPanel from './TabPanel';
import { DataGridPro, GridColDef, GridRenderCellParams, GridRowModel } from '@mui/x-data-grid-pro';
import { ApolloError } from '@apollo/client';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogContent: {
      padding: theme.spacing(0, 0, 4, 0),
      position: 'relative',
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
    label: {
      color: theme.palette.uxGrey.main,
    },
    value: {
      color: 'black',
    },
    cell: {
      color: theme.palette.uxGrey.main,
    },
    refundButton: {
      padding: theme.spacing(0.5, 0),
      marginBottom: theme.spacing(1),
    },
    closeContainer: {
      textAlign: 'end',
    },
    closeButton: {
      color: theme.palette.uxGrey.main,
    },
    tooltip: {
      cursor: 'pointer',
      marginLeft: '0.3rem',
    },
    titleText: {
      padding: 0,
      margin: 0,
    },
    paymentIdLink: {
      fontWeight: 'bold',
      margin: 0,
    },
    referenceText: {
      wordBreak: 'break-all',
    },
    multiLineValue: {
      color: 'black',
      wordBreak: 'break-word',
      wordWrap: 'break-word',
    },
    selectedTabSingle: {
      backgroundColor: theme.palette.uxBlue.activated,
      borderBottomWidth: 0,
    },
    selectedTab: {
      backgroundColor: theme.palette.uxBlue.activated,
    },
    tabRoot: {
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
    paymentIdTooltip: {
      cursor: 'pointer',
      paddingBottom: 0,
    },
    paymentIdContent: {
      fontWeight: 'bold',
      margin: 0,
      wordWrap: 'break-word',
      wordBreak: 'break-all',
    },
    copyIcon: {
      fontSize: '1rem',
      marginLeft: 15,
    },
    alert: {
      justifyContent: 'center',
      position: 'absolute',
      bottom: 12,
      width: '100%',
    },
    warningAlert: {
      justifyContent: 'center',
      width: '100%',
      marginBottom: theme.spacing(2),
      backgroundColor: theme.palette.warning.main,
    },
    successAlertText: {
      color: theme.palette.success.main,
      fontSize: 16,
      fontWeight: 'bold',
    },
    warningAlertText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'black',
    },
    actionButtonsContainerSm: {
      paddingLeft: 32,
      paddingTop: theme.spacing(1),
    },
    dialogWidth: {
      minWidth: 700,
      maxWidth: 700,
    },
    reasonText: {
      display: 'inline-block',
      fontSize: 'inherit',
      fontWeight: 500,
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
    noPadding: {
      padding: 0,
    },
    dialogTitlePadding: {
      padding: 12,
    },
  }),
);

interface RequestRowData {
  paymentRequest: PaymentRequest;
  amount: number;
  partialPaymentReason?: string | null;
  isExpanded: boolean;
}

interface PaymentDetailsProps {
  open: boolean;
  onClose: () => void;
  refund?: (payment: Payment, openedFromPayment: boolean) => void;
  paymentRecord?: Payment;
  defaultCurrency?: string | null;
  isFetchingPaymentRequestById: boolean;
  invoiceDetailClicked?: (paymentRequestId: string) => void;
  invoiceRefundClicked?: (paymentRequestId: string) => void;
  openModalFromPaymentRequestInvoice?: (paymentRecord?: Payment) => void;
  paymentRequestById?: PaymentRequest;
  paymentRequestByIdError?: Error;
  isCreditMemoEnabled: boolean;
  handleResendPaymentReceipt?: (paymentId: string | undefined) => void;
  isResendingPaymentReceipt?: boolean;
  isPaymentReceiptResent?: boolean;
  resendPaymentReceiptError?: ApolloError;
  canCreateRefund: boolean;
  isUserReader: boolean;
}
const PaymentDetails: React.FC<PaymentDetailsProps> = props => {
  const theme = useTheme();
  const classes = useStyles();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    paymentRecord,
    onClose,
    refund,
    defaultCurrency,
    open,
    isFetchingPaymentRequestById,
    invoiceDetailClicked,
    invoiceRefundClicked,
    openModalFromPaymentRequestInvoice,
    paymentRequestById,
    paymentRequestByIdError,
    isCreditMemoEnabled,
    handleResendPaymentReceipt,
    isResendingPaymentReceipt,
    isPaymentReceiptResent,
    resendPaymentReceiptError,
    canCreateRefund,
    isUserReader,
  } = props;

  useEffect(() => {
    if (openModalFromPaymentRequestInvoice && (paymentRequestById || paymentRequestByIdError)) {
      openModalFromPaymentRequestInvoice(paymentRecord);
    }
  }, [paymentRequestById, paymentRequestByIdError]);

  const [paymentidCopied, setPaymentidCopied] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [requestAllocationList, setRequestAllocationList] = useState<RequestRowData[] | undefined>(undefined);

  let failureReasonCode = '';
  const failureReasonDetails = paymentRecord?.failureDetail?.details;
  failureReasonDetails?.forEach((detail, index) => {
    const detailCode = detail?.code;
    if (detailCode) {
      if (index === 0) {
        failureReasonCode += detailCode;
      } else if (index === failureReasonCode.length - 1) {
        failureReasonCode += ` & ${detailCode}`;
      } else {
        failureReasonCode += `, ${detailCode}`;
      }
    }
  });
  if (!failureReasonCode) {
    failureReasonCode = paymentRecord?.failureDetail?.code || '';
  }

  useEffect(() => {
    if (paymentRecord && paymentRecord.paymentRequestAllocation && paymentRecord.paymentRequestAllocation.length > 0) {
      const requestListItems: RequestRowData[] = [];
      paymentRecord.paymentRequestAllocation.forEach(item => {
        const requestItem: RequestRowData = {
          paymentRequest: item.paymentRequest as PaymentRequest,
          amount: item.amount,
          partialPaymentReason: item.partialPaymentReason,
          isExpanded: false,
        };
        requestListItems.push(requestItem);
      });
      setRequestAllocationList(requestListItems);
    } else {
      setRequestAllocationList(undefined);
    }
  }, [paymentRecord]);

  let refunded = 0;
  paymentRecord?.refunds.forEach(refund => {
    if (refund?.status === RefundStatus.Completed || refund?.status === RefundStatus.Pending) {
      refunded += refund.amount || 0;
    }
  });

  //A payment is refundable if it is completed and has not been fully refunded/disputed
  const refundable = paymentRecord?.status === PaymentStatus.Completed && !!paymentRecord?.amount && refunded < paymentRecord?.amount;
  //Checking whether payment has any pending refund
  const pendingRefund = paymentRecord
    ? paymentRecord?.refunds?.filter(refund => refund?.status === RefundStatus.Pending).length > 0
    : false;

  const hasPaymentInformation = paymentRecord?.paymentRequestAllocation && paymentRecord.paymentRequestAllocation.length > 0;
  const hasRefundHistory = paymentRecord && paymentRecord.refunds && paymentRecord.refunds.length > 0;
  const hasInformationAndHistory = hasPaymentInformation && hasRefundHistory;

  const isCreditPayment = (paymentRecord?.creditAmount &&
    paymentRecord.creditAmount > 0 &&
    (paymentRecord.amount === 0 || !paymentRecord?.amount)) as boolean;

  const hasResendPaymentReceipt = paymentRecord?.status === PaymentStatus.Completed;

  const isMediumSizeModal = (hasPaymentInformation || hasRefundHistory || hasResendPaymentReceipt) as boolean;
  const hasCreditApplied = isCreditMemoEnabled && !!paymentRecord?.creditAmount;

  const handleOnClose = () => {
    onClose();
    if (tabValue === 1) setTabValue(0);
  };

  const handleTabChange = (_event: unknown, newValue: number) => {
    setTabValue(newValue);
  };

  const getCaptureType = () => {
    const isImmediateCapture = paymentRecord?.immediateCapture;
    if (isCreditPayment) return 'None';
    if (isImmediateCapture) return 'Immediate';
    return 'Authorization';
  };

  const getPaymentMethod = () => {
    if (paymentRecord?.paymentMethod?.creditCard) {
      return `${paymentRecord?.paymentMethod.creditCard.cardBrand?.substring(0, 1)}${paymentRecord?.paymentMethod.creditCard.cardBrand
        ?.substring(1)
        .toLowerCase()} ${paymentRecord?.paymentMethod.creditCard.lastFour}`;
    }
    if (paymentRecord?.paymentMethod?.paymentBank) {
      return `Bank ${paymentRecord?.paymentMethod.paymentBank.lastFour}`;
    }
    return 'None';
  };

  const resendPaymentReceipt = () => {
    if (handleResendPaymentReceipt) {
      handleResendPaymentReceipt(paymentRecord?.id);
    }
  };

  const getPaymentMethodEmail = () => {
    if (paymentRecord?.paymentMethod?.creditCard) {
      return paymentRecord.paymentMethod.creditCard.cardHolder?.email;
    }
    if (paymentRecord?.paymentMethod?.paymentBank) {
      return paymentRecord?.paymentMethod?.paymentBank.accountHolder?.email;
    }
    return undefined;
  };

  const paymentInfoColumns: GridColDef[] = [
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'referenceNumber',
      sortable: false,
      headerName: 'Reference #',
      minWidth: 150,
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams) => {
        // eslint-disable-next-line no-underscore-dangle
        const { row } = params;
        return (
          <Link
            underline={'hover'}
            href="#"
            onClick={() => {
              if (row.paymentRequestId && invoiceDetailClicked) {
                invoiceDetailClicked(row.paymentRequestId);
              }
            }}
            aria-label={`open payment request details${
              row.referenceNumber ? ` reference ending with ${row.referenceNumber.slice(-4)}` : ''
            }`}
          >
            {row.referenceNumber && row.referenceNumber.length > 9 ? `***${row.referenceNumber?.slice(-9)}` : row.referenceNumber}
          </Link>
        );
      },
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'creditApplied',
      sortable: false,
      headerName: 'Credit Applied',
      hide: !hasCreditApplied,
      headerAlign: 'right',
      align: 'right',
      minWidth: 150,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'paid',
      sortable: false,
      headerName: 'Paid',
      hide: !hasCreditApplied,
      headerAlign: 'right',
      align: 'right',
      minWidth: 80,
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
      field: 'status',
      sortable: false,
      headerName: 'Status',
      minWidth: 150,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      sortable: false,
      field: 'requestRefundable',
      headerName: '',
      headerAlign: 'center',
      align: 'center',
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams) => {
        // eslint-disable-next-line no-underscore-dangle
        const { row } = params;
        if (row.requestRefundable) {
          return (
            <Button
              variant="outlined"
              color="primary"
              data-cy="request-refund"
              onClick={() => {
                if (row.paymentRequestId && invoiceRefundClicked) {
                  invoiceRefundClicked(row.paymentRequestId);
                }
              }}
            >
              Refund
            </Button>
          );
        }
        return <></>;
      },
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      sortable: false,
      field: 'partialPaymentReason',
      headerName: '',
      flex: 0.3,
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams) => {
        // eslint-disable-next-line no-underscore-dangle
        const row = params.row._raw;
        if (row.partialPaymentReason) {
          const reasonText = `
          Partial Payment Reason:

          ${row.partialPaymentReason}
          `;
          return (
            <Tooltip title={reasonText} arrow>
              <InfoIcon />
            </Tooltip>
          );
        }
        return <></>;
      },
    },
  ];
  const getPaymentInfoRows = () => {
    return requestAllocationList?.map((row: Maybe<PaymentRequestAllocation>) => {
      const node = row;
      if (!node) {
        return {} as GridRowModel;
      }
      // checking whether request can be refunded or not
      // checking the refunded amount according to payment snapshot
      const { paymentRequest } = node;
      const status = paymentRequest?.status;
      const paymentSnapshot = paymentRequest?.payments?.find(item => item?.id === paymentRecord?.id);
      const amountRefundable =
        typeof paymentSnapshot?.amountRefunded === 'number' &&
        typeof paymentSnapshot?.amount === 'number' &&
        paymentSnapshot?.amountRefunded < paymentSnapshot?.amount;
      const requestRefundable = canCreateRefund && amountRefundable && refundable && pendingRefund === false;
      return {
        _raw: node,
        id: uuid4(),
        referenceNumber: paymentRequest?.referenceNumber?.trim(),
        paymentRequestId: paymentRequest?.id,
        creditApplied: new Intl.NumberFormat('en', {
          style: 'currency',
          currency: defaultCurrency || 'USD',
          currencyDisplay: 'symbol',
        }).format((paymentSnapshot?.creditAmount || 0) / 100),
        paid: new Intl.NumberFormat('en', {
          style: 'currency',
          currency: defaultCurrency || 'USD',
          currencyDisplay: 'symbol',
        }).format((paymentSnapshot?.amount || 0) / 100),
        total: new Intl.NumberFormat('en', {
          style: 'currency',
          currency: defaultCurrency || 'USD',
          currencyDisplay: 'symbol',
        }).format(((paymentSnapshot?.amount || 0) + (paymentSnapshot?.creditAmount || 0)) / 100),
        status: paymentStatusDisplay.find(item => {
          return item.name === status;
        })?.display,
        requestRefundable,
        partialPaymentReason: node.partialPaymentReason,
      } as GridRowModel;
    }) as GridRowModel[];
  };

  const getRefundHistoryRows = () => {
    return paymentRecord?.refunds.map((row: Maybe<Refund>) => {
      const node = row;
      if (!node) {
        return {} as GridRowModel;
      }
      return {
        _raw: node,
        id: node.id,
        type: node.amount === (node.payment?.amountBeforeFees || node.payment?.amount || 0) ? 'Full' : 'Partial',
        amount:
          typeof node.amount === 'number'
            ? new Intl.NumberFormat('en', {
                style: 'currency',
                currency: defaultCurrency || 'USD',
                currencyDisplay: 'symbol',
              }).format(node.amount / 100)
            : '- -',
        reason: node.refundReason,
        refundedOn: node.createTime ? new Date(node.createTime as string).toLocaleDateString() : '',
        status: paymentStatusDisplay.find(item => {
          return item.name === node.status;
        })?.display,
      } as GridRowModel;
    }) as GridRowModel[];
  };

  const refundHistoryColumns: GridColDef[] = [
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'type',
      sortable: false,
      headerName: 'Type',
      flex: 0.2,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'amount',
      sortable: false,
      headerName: 'Amount',
      headerAlign: 'right',
      align: 'right',
      flex: 0.05,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'reason',
      sortable: false,
      headerName: 'Reason',
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'refundedOn',
      sortable: false,
      headerName: 'Refunded On',
      minWidth: 150,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'status',
      sortable: false,
      headerName: 'Status',
      minWidth: 150,
    },
  ];

  return (
    <Dialog
      aria-label={'payment details dialog'}
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          // Go straight through to onClose if the dialog is finding a way to close without it being backdrop click.
          // For most workflows this dialog is shown/hidden rather than closed.
          onClose();
        }
      }}
      disableEscapeKeyDown={isFetchingPaymentRequestById}
      fullWidth={isMediumSizeModal || matches}
      maxWidth={'md'}
      classes={{ paper: isMediumSizeModal || matches ? '' : classes.dialogWidth }}
      aria-labelledby="modal-title"
    >
      <>
        <LoadingMask loading={isFetchingPaymentRequestById} />
        <DialogTitle classes={{ root: classes.dialogTitlePadding }}>
          <Grid container>
            <Grid item xs={10}>
              <Typography variant="subtitle2" className={classes.titleText} id="modal-title">
                PAYMENT DETAILS
              </Typography>
              <Typography className={classes.titleText}>
                <Tooltip
                  className={classes.paymentIdTooltip}
                  title={`${paymentidCopied ? 'Copied' : 'Copy'} to clipboard`}
                  placement="bottom-start"
                >
                  <Link
                    underline={'hover'}
                    className={classes.paymentIdContent}
                    color="primary"
                    onClick={() => {
                      setPaymentidCopied(true);
                      navigator.clipboard.writeText(paymentRecord?.id || '');
                    }}
                    onMouseEnter={() => {
                      if (paymentidCopied) setPaymentidCopied(false);
                    }}
                    onFocus={() => {
                      if (paymentidCopied) setPaymentidCopied(false);
                    }}
                    href="#"
                    data-cy="payment-id-copy"
                  >
                    {paymentRecord?.id}
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
                data-cy="payment-details-close"
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent className={classes.noPadding}>
          <Box className={classes.dialogContent} data-cy="payment-details-modal">
            {resendPaymentReceiptError &&
              resendPaymentReceiptError.graphQLErrors.some(e => e.extensions?.exception.reasonCode === 'RECEIPT_ALREADY_SENT') && (
                <Alert className={classes.warningAlert} severity="warning" icon={false}>
                  <Typography className={classes.warningAlertText}>
                    The same payment receipt can only be sent once per 10 minutes.
                  </Typography>
                </Alert>
              )}
            <Box className={matches ? classes.contentSectionSm : classes.contentSectionMd}>
              <Grid container>
                <Grid container item xs={12} md={9}>
                  <Grid container spacing={1}>
                    {paymentRecord?.description ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography color={theme.palette.uxGrey.main} variant="body1">
                            Description
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1" className={classes.multiLineValue}>
                            {paymentRecord?.description}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}
                    {paymentRecord?.orderNumber ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography color={theme.palette.uxGrey.main} variant="body1">
                            Order#
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1" className={classes.multiLineValue}>
                            {paymentRecord?.orderNumber}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}
                    {paymentRecord?.customerPONumber ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography color={theme.palette.uxGrey.main} variant="body1">
                            Customer PO#
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1" className={classes.multiLineValue}>
                            {paymentRecord?.customerPONumber}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}
                    {paymentRecord?.invoiceNumber ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography color={theme.palette.uxGrey.main} variant="body1">
                            Invoice#
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1" className={classes.multiLineValue}>
                            {paymentRecord?.invoiceNumber}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}
                    <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                      <Typography color={theme.palette.uxGrey.main} variant="body1">
                        {getPaymentMethod()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                      <Typography variant="body1">
                        {new Intl.NumberFormat('en', {
                          style: 'currency',
                          currency: defaultCurrency || 'USD',
                          currencyDisplay: 'symbol',
                        }).format((paymentRecord?.amountBeforeFees || paymentRecord?.amount || 0) / 100)}
                      </Typography>
                    </Grid>
                    {paymentRecord?.convenienceFee ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography color={theme.palette.uxGrey.main} variant="body1">
                            Convenience Fee
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1">
                            {new Intl.NumberFormat('en', {
                              style: 'currency',
                              currency: defaultCurrency || 'USD',
                              currencyDisplay: 'symbol',
                            }).format((paymentRecord.convenienceFee || 0) / 100)}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}
                    {hasCreditApplied ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography color={theme.palette.uxGrey.main} variant="body1">
                            Credit Applied
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1">
                            {new Intl.NumberFormat('en', {
                              style: 'currency',
                              currency: defaultCurrency || 'USD',
                              currencyDisplay: 'symbol',
                            }).format((paymentRecord?.creditAmount || 0) / 100)}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}
                    {hasCreditApplied || paymentRecord?.convenienceFee ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography color={theme.palette.uxGrey.main} variant="body1">
                            Total Payment
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1">
                            {new Intl.NumberFormat('en', {
                              style: 'currency',
                              currency: defaultCurrency || 'USD',
                              currencyDisplay: 'symbol',
                            }).format(((paymentRecord?.amount || 0) + (paymentRecord?.creditAmount || 0)) / 100)}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}
                    {paymentRecord?.status === PaymentStatus.Canceled && paymentRecord?.cancelReason ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography color={theme.palette.uxGrey.main} variant="body1">
                            Cancelled Reason
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1">{paymentRecord?.cancelReason}</Typography>
                        </Grid>
                      </>
                    ) : null}
                    {paymentRecord?.status === PaymentStatus.Failed && (paymentRecord?.failureReason || failureReasonCode) ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography variant="body1">Failure Reason</Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1">
                            {`${paymentRecord?.failureReason || ''}${failureReasonCode ? ` (${failureReasonCode})` : ''}`}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}
                    {paymentRecord?.status === PaymentStatus.Pending && paymentRecord?.pendingReason ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography color={theme.palette.uxGrey.main} variant="body1">
                            Pending Reason
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1">{paymentRecord?.pendingReason}</Typography>
                        </Grid>
                      </>
                    ) : null}
                    {paymentRecord?.paymentMethod?.creditCard?.cardHolder?.email ||
                    paymentRecord?.paymentMethod?.paymentBank?.accountHolder?.email ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography color={theme.palette.uxGrey.main} variant="body1">
                            Paid By
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1">
                            {paymentRecord?.paymentMethod?.creditCard?.cardHolder?.email ||
                              paymentRecord?.paymentMethod?.paymentBank?.accountHolder?.email ||
                              '- -'}
                          </Typography>
                        </Grid>
                      </>
                    ) : null}
                    <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                      <Grid container>
                        <Typography color={theme.palette.uxGrey.main} variant="body1">
                          Capture Type
                        </Typography>
                        <Tooltip
                          title="When a customer makes a payment, the payment information needs to be captured and sent to their bank for processing. Payments can be captured immediately or manually."
                          className={classes.tooltip}
                        >
                          <HelpOutlineOutlinedIcon htmlColor="grey" fontSize="small" />
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                      <Typography variant="body1">{getCaptureType()}</Typography>
                    </Grid>
                    <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                      <Typography color={theme.palette.uxGrey.main} variant="body1">
                        Status
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                      <Typography variant="body1">
                        {PaymentStatusForDisplay(
                          paymentStatusDisplay.find(item => {
                            return item.name === paymentRecord?.status;
                          })?.display,
                          paymentRecord?.amountBeforeFees || paymentRecord?.amount || 0,
                          paymentRecord?.refunds,
                          paymentRecord?.createdAt,
                          paymentRecord?.immediateCapture,
                          paymentRecord?.pendingReasonCode,
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                      <Typography color={theme.palette.uxGrey.main} variant="body1">
                        Created On
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                      <Typography variant="body1">
                        {paymentRecord?.createdAt || paymentRecord?.completedTimestamp
                          ? new Date((paymentRecord.createdAt || paymentRecord.completedTimestamp) as string).toLocaleDateString()
                          : '- -'}
                      </Typography>
                    </Grid>
                    {paymentRecord?.authorizationCode ? (
                      <>
                        <Grid item xs={6} md={isMediumSizeModal ? 5 : 6}>
                          <Typography color={theme.palette.uxGrey.main} variant="body1">
                            Authorization code
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={isMediumSizeModal ? 7 : 6}>
                          <Typography variant="body1">{paymentRecord?.authorizationCode || '- -'}</Typography>
                        </Grid>
                      </>
                    ) : null}
                  </Grid>
                </Grid>
                <Grid item xs={12} md={3} className={matches ? classes.actionButtonsContainerSm : ''}>
                  {canCreateRefund &&
                    (!paymentRecord?.paymentRequestAllocation || paymentRecord?.paymentRequestAllocation.length === 0) &&
                    !paymentRecord?.paymentRequest &&
                    refundable &&
                    pendingRefund === false && (
                      <Button
                        className={classes.refundButton}
                        size="medium"
                        variant="outlined"
                        color="primary"
                        fullWidth
                        onClick={() => {
                          if (paymentRecord && refund) refund(paymentRecord, true);
                        }}
                        data-cy="payment-details-refund"
                      >
                        Refund
                      </Button>
                    )}
                  {!isUserReader && hasResendPaymentReceipt && handleResendPaymentReceipt && (
                    <Button
                      size="medium"
                      variant="outlined"
                      color="primary"
                      onClick={resendPaymentReceipt}
                      fullWidth
                      data-cy="resend-receipt"
                      className={classes.refundButton}
                      disabled={isResendingPaymentReceipt}
                    >
                      Resend Receipt
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
            {(hasPaymentInformation || hasRefundHistory) && (
              <Box className={classes.infoSections}>
                <Paper elevation={0}>
                  <Tabs
                    indicatorColor={'primary'}
                    textColor={'primary'}
                    variant={hasInformationAndHistory ? 'fullWidth' : 'standard'}
                    value={tabValue}
                    onChange={handleTabChange}
                    classes={{
                      root: hasInformationAndHistory ? '' : classes.tabsRoot,
                      indicator: hasInformationAndHistory ? classes.tabsIndicatorSingle : classes.tabsIndicator,
                    }}
                  >
                    {hasPaymentInformation && (
                      <Tab
                        classes={{
                          selected: hasInformationAndHistory ? classes.selectedTabSingle : classes.selectedTab,
                          root: hasInformationAndHistory ? classes.tabRootSingle : classes.tabRoot,
                        }}
                        label="PAYMENT REQUESTS"
                        id="payment-requests-tab"
                        data-cy="payment-requests-tab"
                      />
                    )}
                    {hasRefundHistory && (
                      <Tab
                        classes={{
                          selected: hasInformationAndHistory ? classes.selectedTabSingle : classes.selectedTab,
                          root: hasInformationAndHistory ? classes.tabRootSingle : classes.tabRoot,
                        }}
                        label="REFUND HISTORY"
                        id="refund-history-tab"
                        data-cy="refund-history-tab"
                      />
                    )}
                  </Tabs>
                  {hasPaymentInformation && (
                    <TabPanel value={tabValue} index={0} data-cy="payment-information-panel">
                      <Box data-cy="payment-details-info-table">
                        <DataGridPro
                          rowHeight={58}
                          aria-label="payment info"
                          hideFooterPagination
                          hideFooter
                          hideFooterSelectedRowCount
                          className={classes.dataGrid}
                          rows={getPaymentInfoRows()}
                          columns={paymentInfoColumns}
                          autoHeight
                        />
                      </Box>
                    </TabPanel>
                  )}
                  {hasRefundHistory && (
                    <TabPanel
                      value={tabValue}
                      index={hasPaymentInformation && hasRefundHistory ? 1 : 0}
                      data-cy="refund-history-panel"
                    >
                      <Box data-cy="payment-details-refund-table">
                        <DataGridPro
                          rowHeight={58}
                          aria-label="refund history"
                          hideFooterPagination
                          hideFooter
                          hideFooterSelectedRowCount
                          className={classes.dataGrid}
                          rows={getRefundHistoryRows()}
                          columns={refundHistoryColumns}
                          autoHeight
                        />
                      </Box>
                    </TabPanel>
                  )}
                </Paper>
              </Box>
            )}
            {isPaymentReceiptResent && !resendPaymentReceiptError && (
              <Alert className={classes.alert} icon={<CheckIcon style={{ color: theme.palette.success.dark }} />} severity="success">
                <Typography className={classes.successAlertText}>{`Payment receipt has been sent to ${
                  getPaymentMethodEmail() || 'the addresses on file'
                }.`}</Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
      </>
    </Dialog>
  );
};
export default PaymentDetails;
