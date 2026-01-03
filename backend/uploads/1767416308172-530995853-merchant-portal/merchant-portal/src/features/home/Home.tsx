import {
  Box,
  Grid,
  Paper,
  Theme,
  Toolbar,
  Dialog,
  Button,
  SvgIcon,
  Typography,
  useMediaQuery,
  Snackbar,
  Divider,
  Link,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { useGridApiRef } from '@mui/x-data-grid-pro';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import MailIcon from '@mui/icons-material/Mail';
import ForwardToInbox from '@mui/icons-material/ForwardToInbox';
import AddIcon from '@mui/icons-material/AddCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckIcon from '@mui/icons-material/Check';
import React, { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import PaymentRequestList from '../../components/PaymentRequestList';
import TabPanel from '../../components/TabPanel';
import IssueRefundPayment from '../../components/IssueRefundPayment';
import {
  OrderDirection,
  PaymentRequestOrder,
  PaymentRequestOrderField,
  PaymentRequest,
  PaymentRequestStatus,
  Payment,
  PaymentOrder,
  PaymentOrderField,
  PaymentStatus,
  RefundStatus,
  CommunicationType,
  FileFormat,
  CompanyVerificationStatus,
  PaymentStatusExtended,
  AppRole,
  PaymentRequestForwardInput,
  TransitionStatus,
  PayFac,
} from '../../gql-types.generated';
import { checkPermission, Permission } from '../../util/RoleCheck';
import {
  selectNetworkBusy,
  selectTenantId,
  selectViewerUser,
  selectTenantAccount,
  selectDefaultCurrency,
  fetchPendingBannerVisible,
  selectPendingBannerVisible,
  selectPaymentRequestsFeatures,
} from '../app/AppSlice';
import {
  fetchAccountRequirements,
  refund,
  fetchPaymentRequestList,
  remindPaymentRequest,
  closeOrCompletePaymentRequest,
  fetchPaymentList,
  updatePaymentRequest,
  fetchPaymentById,
  createPaymentsReport,
  fetchPaymentRequestById,
  fetchPaymentRequestByIdAfterUpdate,
  resendPaymentReceipt,
  remindPaymentRequests,
  forwardPaymentRequest,
} from './HomeActions';
import {
  clearRefundStatus,
  selectPaymentRequestConnection,
  captureSearchError,
  selectRefundStatus,
  selectSearchError,
  selectPaymentRequests,
  selectReminderStatus,
  clearReminderStatus,
  selectVerificationStatus,
  clearVerificationStatus,
  selectIsLoadingPaymentRequests,
  selectRefundIdempotencyKey,
  fetchRefundIdempotencyKey,
  selectPaymentConnection,
  selectPayments,
  selectPaymentSearch,
  capturePaymentRequestSearch,
  capturePaymentSearch,
  selectIsLoadingPayments,
  fetchIsPaymentRefunded,
  fetchPaymentRefundedAmount,
  selectIsPaymentRefunded,
  selectPaymentRefundedAmount,
  clearUpdatePaymentRequestStatus,
  selectUpdatePaymentRequestStatus,
  clearUpdatePaymentRequestError,
  selectUpdatePaymentRequestError,
  selectPaymentById,
  selectPaymentByIdError,
  capturePaymentByIdError,
  capturePaymentById,
  captureRefundError,
  selectRefundError,
  selectPaymentsReport,
  selectPaymentsReportError,
  capturePaymentsReport,
  capturePaymentsReportError,
  selectPaymentRequestById,
  selectPaymentRequestByIdError,
  capturePaymentRequestById,
  capturePaymentRequestByIdError,
  fetchHasAdditionalBanner,
  selectHasAdditionalBanner,
  captureCloseOrCompleteError,
  selectCloseOrCompleteError,
  selectPaymentRequestByIdAfterUpdate,
  selectPaymentRequestByIdAfterUpdateError,
  capturePaymentRequestByIdAfterUpdate,
  capturePaymentRequestByIdAfterUpdateError,
  selectIsPaymentListInFlight,
  selectIsPaymentRequestListInFlight,
  selectResendingPaymentReceipt,
  selectIsPaymentReceiptResent,
  fetchIsPaymentReceiptResent,
  selectResendPaymentReceiptError,
  fetchResendPaymentReceiptError,
  selectPaymentFilterCustomerOption,
  selectPaymentRequestFilterCustomerOption,
  selectPaymentFilterDateOption,
  selectPaymentFilterFromDate,
  selectPaymentFilterToDate,
  selectPaymentFilterFromAmount,
  selectPaymentFilterToAmount,
  selectPaymentFilterAmountRange,
  fetchPaymentFilterDateOption,
  fetchPaymentFilterCustomerOption,
  fetchPaymentFilterFromDate,
  fetchPaymentFilterToDate,
  fetchPaymentFilterAmountRange,
  fetchPaymentFilterFromAmount,
  fetchPaymentFilterToAmount,
  selectPaymentFilterStatusCount,
  selectPaymentRequestFilterStatusCount,
  selectPaymentFilterStatusList,
  selectPaymentRequestFilterStatusList,
  fetchPaymentFilterStatusList,
  fetchPaymentFilterStatusCount,
  fetchAllPaymentsStatusList,
  selectAllPaymentsStatusList,
  fetchAllPaymentRequestStatusList,
  selectAllPaymentRequestStatusList,
  fetchReloadPaymentsAfterFilter,
  selectReloadPaymentsAfterFilter,
  fetchReloadPaymentRequestsAfterFilter,
  fetchAllPaymentsStatusExtendedList,
  selectReloadPaymentRequestsAfterFilter,
  selectAllPaymentsStatusExtendedList,
  selectCustomerOptionError,
  fetchPaymentRequestFilterStatusCount,
  fetchPaymentRequestFilterStatusList,
  fetchPaymentRequestFilterCustomerOption,
  selectRemindPaymentRequestsSuccessCount,
  selectIsRemindPaymentRequestsInFlight,
  fetchRemindPaymentRequestsSuccessCount,
  selectForwardPaymentRequestError,
  captureForwardPaymentRequestError,
  selectForwardPaymentRequestSuccess,
  captureForwardPaymentRequestSucccess,
  fetchLastTabPath,
  selectGeneratingExportInFlight,
  captureExportsCancelledInFlight,
  selectPaymentRequestSearch,
} from './HomeSlice';
import IssueRefund from '../../components/IssueRefund';
import { ReactComponent as RefundIcon } from '../../refund.svg';
import PaymentRequestDetails from '../../components/PaymentRequestDetails';
import PaymentsList from '../../components/PaymentsList';
import PaymentDetails from '../../components/PaymentDetails';
import { v4 as uuid4 } from 'uuid';
import ExportPayments from '../../components/ExportPayments';
import { ReactComponent as FileDownloadIcon } from '../../FileDownload.svg';
import { Alert } from '@mui/lab';
import AccountPendingBanner from '../../components/AccountPendingBanner';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentsListFilter from '../../components/PaymentsListFilter';
import PaymentRequestListFilter from '../../components/PaymentRequestListFilter';
import PaymentsListFilterChips from '../../components/PaymentsListFilterChips';
import PaymentRequestListFilterChips from '../../components/PaymentRequestListFilterChips';
import { AllPaymentStatusFilterValue, MAX_STATUS_COUNT } from '../../util/PaymentsListFilterValue';
import {
  AllPaymentRequestsStatusFilterValue,
  MAX_STATUS_COUNT as PR_MAX_STATUS_COUNT,
} from '../../util/PaymentRequestsListFilterValue';
import SearchBar from '../../components/SearchBar';
import ForwardDialog from '../../components/ForwardDialog';
import { CustomerOption } from '../../custom-types/CustomerOption';
import {
  fetchCreatePaymentSuccessMessage,
  fetchRequestsToPay,
  selectCreatePaymentSuccessMessage,
} from '../virtual-terminal/PaymentVirtualTerminalSlice';
import { RoutePath } from '../../util/Routes';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rootContainer: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      [theme.breakpoints.down('sm')]: {
        padding: 0,
      },
    },
    root: {
      flexGrow: 2,
    },
    pageTitle: {
      textAlign: 'start',
      padding: theme.spacing(2, 1, 1.5, 3),
    },
    loadingGridItem: {
      width: 100,
      paddingTop: theme.spacing(2),
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    tabs: {
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'center',
      flexGrow: 1,

      '& [role="tabpanel"]': {
        flex: 1,

        '& > .MuiBox-root': {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      },
    },
    title: {
      flex: '1',
      textAlign: 'left',
    },
    selectedTab: {
      borderBottomWidth: 0,
      backgroundColor: theme.palette.uxBlue.activated,
    },
    tabRoot: {
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      color: theme.palette.primary.main,
      borderBottomColor: theme.palette.uxGrey.focus,
    },
    tabToolbar: {
      padding: theme.spacing(0.5, 1),
    },
    toolbarButton: {
      marginLeft: 0,
      margin: theme.spacing(0.5),
      [theme.breakpoints.down('xs')]: {
        minWidth: 40,
        minHeight: 48,
        marginRight: 0,
        padding: 0,
      },
    },
    transition: {
      transition: theme.transitions.create('all', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
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
    snackBarErrorAlert: {
      minWidth: '100%',
      justifyContent: 'center',
      fontWeight: 500,
      color: theme.palette.error.main,
    },
    snackBarWarningAlert: {
      minWidth: '100%',
      justifyContent: 'center',
      fontWeight: 500,
      backgroundColor: theme.palette.warning.light,
    },
    snackBarInfoAlert: {
      minWidth: '100%',
      justifyContent: 'center',
      fontWeight: 500,
    },
    warningAlertText: {
      fontSize: 16,
      color: theme.palette.warning.dark,
    },
    errorAlertText: {
      fontSize: 16,
    },
  }),
);
interface HomeProps {
  tabPath: string;
}
const Home: React.FC<HomeProps> = (props: HomeProps) => {
  const { tabPath } = props;
  const classes = useStyles();
  const theme = useTheme();
  const tenantId = useSelector(selectTenantId);
  const user = useSelector(selectViewerUser);
  const tenantAccount = useSelector(selectTenantAccount);
  const networkBusy = useSelector(selectNetworkBusy);
  const paymentRequestQueryString = useSelector(selectPaymentRequestSearch);
  const payRequestConnection = useSelector(selectPaymentRequestConnection);
  const paymentRequests = useSelector(selectPaymentRequests);
  const defaultCurrency = useSelector(selectDefaultCurrency);
  const refundStatus = useSelector(selectRefundStatus);
  const reminderStatus = useSelector(selectReminderStatus);
  const isLoadingPaymentRequests = useSelector(selectIsLoadingPaymentRequests);
  const searchError = useSelector(selectSearchError);
  const verificationStatus = useSelector(selectVerificationStatus);
  const refundIdempotencyKey = useSelector(selectRefundIdempotencyKey);
  const paymentConnection = useSelector(selectPaymentConnection);
  const payments = useSelector(selectPayments);
  const paymentQueryString = useSelector(selectPaymentSearch);
  const isLoadingPayments = useSelector(selectIsLoadingPayments);
  const isPaymentRefunded = useSelector(selectIsPaymentRefunded);
  const paymentRefundedAmount = useSelector(selectPaymentRefundedAmount);
  const updatePaymentRequestStatus = useSelector(selectUpdatePaymentRequestStatus);
  const updatePaymentRequestError = useSelector(selectUpdatePaymentRequestError);
  const paymentById = useSelector(selectPaymentById);
  const refundError = useSelector(selectRefundError);
  const paymentByIdError = useSelector(selectPaymentByIdError);
  const paymentRequestById = useSelector(selectPaymentRequestById);
  const paymentRequestByIdError = useSelector(selectPaymentRequestByIdError);
  const paymentsReport = useSelector(selectPaymentsReport);
  const paymentsReportError = useSelector(selectPaymentsReportError);
  const hasAdditionalBanner = useSelector(selectHasAdditionalBanner);
  const pendingBannerVisible = useSelector(selectPendingBannerVisible);
  const closeOrCompleteError = useSelector(selectCloseOrCompleteError);
  const paymentRequestByIdAfterUpdate = useSelector(selectPaymentRequestByIdAfterUpdate);
  const paymentRequestByIdAfterUpdateError = useSelector(selectPaymentRequestByIdAfterUpdateError);
  const isPaymentListInFlight = useSelector(selectIsPaymentListInFlight);
  const isPaymentRequestListInFlight = useSelector(selectIsPaymentRequestListInFlight);
  const isResendingPaymentReceipt = useSelector(selectResendingPaymentReceipt);
  const isPaymentReceiptResent = useSelector(selectIsPaymentReceiptResent);
  const resendPaymentReceiptError = useSelector(selectResendPaymentReceiptError);
  const paymentFilterCustomerOption = useSelector(selectPaymentFilterCustomerOption);
  const paymentRequestFilterCustomerOption = useSelector(selectPaymentRequestFilterCustomerOption);
  const paymentFilterDateOption = useSelector(selectPaymentFilterDateOption);
  const paymentFilterFromDate = useSelector(selectPaymentFilterFromDate);
  const paymentFilterToDate = useSelector(selectPaymentFilterToDate);
  const paymentFilterAmountRange = useSelector(selectPaymentFilterAmountRange);
  const paymentFilterFromAmount = useSelector(selectPaymentFilterFromAmount);
  const paymentFilterToAmount = useSelector(selectPaymentFilterToAmount);
  const paymentFilterStatusCount = useSelector(selectPaymentFilterStatusCount);
  const paymentFilterStatusList = useSelector(selectPaymentFilterStatusList);
  const allPaymentsStatusList = useSelector(selectAllPaymentsStatusList);
  const allPaymentsStatusExtendedList = useSelector(selectAllPaymentsStatusExtendedList);
  const paymentRequestFilterStatusCount = useSelector(selectPaymentRequestFilterStatusCount);
  const paymentRequestFilterStatusList = useSelector(selectPaymentRequestFilterStatusList);
  const allPaymentRequestStatusList = useSelector(selectAllPaymentRequestStatusList);
  const reloadPaymentsAfterFilter = useSelector(selectReloadPaymentsAfterFilter);
  const reloadPaymentRequestsAfterFilter = useSelector(selectReloadPaymentRequestsAfterFilter);
  const customerOptionError = useSelector(selectCustomerOptionError);
  const remindPaymentRequestsSuccessCount = useSelector(selectRemindPaymentRequestsSuccessCount);
  const isRemindPaymentRequestsInFlight = useSelector(selectIsRemindPaymentRequestsInFlight);
  const forwardPaymentRequestError = useSelector(selectForwardPaymentRequestError);
  const forwardPaymentRequestSuccess = useSelector(selectForwardPaymentRequestSuccess);
  const paymentRequestFeatures = useSelector(selectPaymentRequestsFeatures);
  const createPaymentSuccessMessage = useSelector(selectCreatePaymentSuccessMessage);
  const generatingExportsInFlight = useSelector(selectGeneratingExportInFlight);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [remindDisabled, setRemindDisabled] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [paymentRefundDialogOpen, setPaymentRefundDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [paymentDetailsDialogOpen, setPaymentDetailsDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedPaymentRequests, setSelectedPaymentRequests] = useState<PaymentRequest[] | undefined>();
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>();
  const [displayChallengeSuccessful, setDisplayChallengeSuccessful] = useState(false);
  const [displayForwardPaymentRequestSuccessful, setDisplayForwardPaymentRequestSuccessful] = useState(false);
  const [forwardPaymentRequestSuccessMessage, setForwardPaymentRequestSuccessMessage] = useState<string>('');
  const [paymentRequestOrder, setPaymentRequestOrder] = useState<PaymentRequestOrder>({
    direction: OrderDirection.Desc,
    field: PaymentRequestOrderField.Timestamp,
  });
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder>({
    direction: OrderDirection.Desc,
    field: PaymentOrderField.Timestamp,
  });
  const getTabValue = () => {
    switch (tabPath) {
      case RoutePath.Requests:
        return 1;
      case RoutePath.Payments:
      default:
        return 0;
    }
  };
  const [activeViewPaymentRequestRecord, setActiveViewPaymentRequestRecord] = useState<PaymentRequest | undefined>();
  const [activeRefundPaymentRequestRecord, setActiveRefundPaymentRequestRecord] = useState<PaymentRequest | undefined>();
  const [activeIssueRefundPaymentRecord, setActiveIssueRefundPaymentRecord] = useState<Payment | undefined>();
  const [activeViewPaymentRecord, setActiveViewPaymentRecord] = useState<Payment | undefined>();
  const [activeRefundPaymentRecord, setActiveRefundPaymentRecord] = useState<Payment | undefined>();
  const [tabValue, setTabValue] = useState(getTabValue());
  const [paymentRequestDirection, setPaymentRequestDirection] = useState<OrderDirection>(OrderDirection.Desc);
  const [paymentDirection, setPaymentDirection] = useState<OrderDirection>(OrderDirection.Desc);
  const [paymentRequestField, setPaymentRequestField] = useState<PaymentRequestOrderField>(PaymentRequestOrderField.Timestamp);
  const [paymentField, setPaymentField] = useState<PaymentOrderField>(PaymentOrderField.Timestamp);
  const [isCloseOrCompleteWaiting, setIsCloseOrCompleteWaiting] = useState<boolean>(false);
  const [updatePaymentRequestDisabled, setUpdatePaymentRequestDisabled] = useState<boolean>(false);
  const [isHistoryDetailClicked, setIsHistoryDetailClicked] = useState<boolean>(false);
  const [isInvoiceDetailClicked, setIsInvoiceDetailClicked] = useState<boolean>(false);
  const [isInvoiceRefundClicked, setIsInvoiceRefundClicked] = useState<boolean>(false);
  const [isRefundRequestClicked, setIsRefundRequestClicked] = useState<boolean>(false);
  const [isClosingPaymentRequest, setIsClosingPaymentRequest] = useState<boolean>(false);
  const [isCompletingPaymentRequest, setIsCompletingPaymentRequest] = useState<boolean>(false);
  const [isLoadingRequestAfterUpdate, setIsLoadingRequestAfterUpdate] = useState<boolean>(false);
  const [isRefundModalOpenedFromPayment, setIsRefundModalOpenedFromPayment] = useState<boolean>(false);
  const [forwardPopOverAnchorElement, setForwardPopoverAnchorElement] = useState<null | HTMLElement>(null);
  const [canSendRequestCommunicationFromMenu, setCanSendRequestCommunicationFromMenu] = useState<boolean>(false);
  const [canCloseRequestFromMenu, setCanCloseRequestFromMenu] = useState<boolean>(false);
  const [canPaySelectedRequests, setCanPaySelectedRequests] = useState<boolean>(false);
  const [canPayError, setCanPayError] = useState<string | undefined>();
  const [displayPayRequestsError, setDisplayPayRequestsError] = useState<boolean>(false);
  const [displayPaymentSuccessful, setDisplayPaymentSuccessful] = useState(false);

  const paymentsGridApi = useGridApiRef();
  const paymentRequestsGridApi = useGridApiRef();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tabRef = useRef<any>(null);
  const dispatch = useDispatch();
  const history = useHistory();
  const matchesXsDown = useMediaQuery(theme.breakpoints.down('xs'));
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const [pageTitle, setPageTitle] = useState<JSX.Element | undefined>();
  const iconSize = matchesXsDown ? 'medium' : 'small';
  const canCreatePaymentRequest = checkPermission(Permission.PaymentRequestCreate, user?.relationship?.role);
  const canUpdatePaymentRequest = checkPermission(Permission.PaymentRequestUpdate, user?.relationship?.role);
  const canForwardPaymentRequest = user?.relationship?.role === AppRole.Admin || user?.relationship?.role === AppRole.Editor;
  const canCreateRefund = checkPermission(Permission.RefundCreate, user?.relationship?.role);
  const isUserReader = user?.relationship?.role === AppRole.Reader;
  const { previewSettings } = tenantAccount?.settings?.integrationSettings || {};
  const hasPreviewWithNoEmail = previewSettings?.enabled && !previewSettings.email;
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const isTransitioningMerchant =
    tenantAccount?.company?.verification?.transitionStatus === TransitionStatus.Requested && tenantAccount?.payFacType !== PayFac.Ptt;
  // snackbar settings
  const anchorOrigin: { vertical: 'bottom' | 'top'; horizontal: 'center' | 'left' | 'right' } = {
    vertical: 'bottom',
    horizontal: 'center',
  };

  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  // Infinite load page size.
  const pageSize = 25;

  const loadRequestAfterUpdate = () => {
    if (activeViewPaymentRequestRecord?.id && detailsDialogOpen) {
      setIsLoadingRequestAfterUpdate(true);
      dispatch(fetchPaymentRequestByIdAfterUpdate(paymentRequestOrder, activeViewPaymentRequestRecord.id));
    }
  };

  const clearPaymentRequestMenuFlags = () => {
    setSelectedPaymentRequests(undefined);
    setCanSendRequestCommunicationFromMenu(false);
    setCanCloseRequestFromMenu(false);
  };

  // Fetch requirement data once we have tenantId
  useEffect(() => {
    if (tenantId) {
      dispatch(fetchAccountRequirements());
    }
  }, [tenantId]);

  // Fetch payment requests once we have tenant id, or the order changes.
  useEffect(() => {
    if (tenantId) {
      dispatch(
        fetchPaymentRequestList(
          undefined,
          pageSize,
          paymentRequestOrder,
          paymentRequestQueryString,
          undefined,
          allPaymentRequestStatusList,
          paymentRequestFilterCustomerOption?.id,
        ),
      );
      clearPaymentRequestMenuFlags();
    }
  }, [paymentRequestOrder]);

  useEffect(() => {
    if (tenantId) {
      dispatch(
        fetchPaymentList(
          undefined,
          pageSize,
          paymentOrder,
          paymentQueryString,
          allPaymentsStatusList,
          allPaymentsStatusExtendedList,
          paymentFilterFromDate,
          paymentFilterToDate,
          paymentFilterFromAmount,
          paymentFilterToAmount,
          paymentFilterCustomerOption?.id,
        ),
      );
    }
  }, [paymentOrder]);

  // Update list in the active tab with the query string changes.
  useEffect(() => {
    if (tenantId) {
      if (tabValue === 0) {
        dispatch(
          fetchPaymentList(
            undefined,
            pageSize,
            paymentOrder,
            paymentQueryString,
            allPaymentsStatusList,
            allPaymentsStatusExtendedList,
            paymentFilterFromDate,
            paymentFilterToDate,
            paymentFilterFromAmount,
            paymentFilterToAmount,
            paymentFilterCustomerOption?.id,
          ),
        );
      } else if (tabValue === 1) {
        dispatch(
          fetchPaymentRequestList(
            undefined,
            pageSize,
            paymentRequestOrder,
            paymentRequestQueryString,
            undefined,
            allPaymentRequestStatusList,
            paymentRequestFilterCustomerOption?.id,
          ),
        );
      }
    }
  }, [tenantId, paymentRequestQueryString, paymentQueryString]);

  // Updates the payment details modal with the newly updated record
  useEffect(() => {
    if (activeViewPaymentRequestRecord) {
      const updatedRecord = payRequestConnection?.nodes.find(item => item?.id === activeViewPaymentRequestRecord.id);
      if (updatedRecord) {
        setActiveViewPaymentRequestRecord(updatedRecord);
      }
    }
  }, [payRequestConnection]);

  useEffect(() => {
    if (activeViewPaymentRecord) {
      const updatedRecord = paymentConnection?.nodes.find(item => item?.id === activeViewPaymentRecord.id);
      if (updatedRecord) {
        setActiveViewPaymentRecord(updatedRecord);
      }
    }
  }, [paymentConnection]);

  useEffect(() => {
    if (reminderStatus !== undefined || remindPaymentRequestsSuccessCount > 0) {
      dispatch(clearReminderStatus());
      if (tenantId) {
        dispatch(
          fetchPaymentRequestList(
            undefined,
            pageSize,
            paymentRequestOrder,
            paymentRequestQueryString,
            undefined,
            allPaymentRequestStatusList,
            paymentRequestFilterCustomerOption?.id,
          ),
        );
        clearPaymentRequestMenuFlags();
        loadRequestAfterUpdate();
      }
      setRemindDisabled(false);
      dispatch(fetchRemindPaymentRequestsSuccessCount(0));
    }
  }, [reminderStatus, remindPaymentRequestsSuccessCount]);

  useEffect(() => {
    if (updatePaymentRequestStatus !== undefined) {
      dispatch(clearUpdatePaymentRequestStatus());
      dispatch(clearUpdatePaymentRequestError());
      if (tenantId) {
        dispatch(
          fetchPaymentRequestList(
            undefined,
            pageSize,
            paymentRequestOrder,
            paymentRequestQueryString,
            undefined,
            allPaymentRequestStatusList,
            paymentRequestFilterCustomerOption?.id,
          ),
        );
        clearPaymentRequestMenuFlags();
        loadRequestAfterUpdate();
      }
      setUpdatePaymentRequestDisabled(false);
    }
  }, [updatePaymentRequestStatus]);

  useEffect(() => {
    setIsCloseOrCompleteWaiting(false);
  }, [closeOrCompleteError]);
  // When the tab path changes, set the visible tab.
  useEffect(() => {
    let contentTitle;
    let ariaLabel;
    switch (tabPath) {
      case RoutePath.Requests:
        if (tabValue !== 1) {
          setTabValue(1);
          dispatch(fetchLastTabPath(RoutePath.Requests));
        }
        contentTitle = matchesSmDown ? 'Requests' : 'Payment Requests';
        ariaLabel = 'Payment Requests';
        break;
      case RoutePath.Payments:
      default:
        if (tabValue !== 0) {
          setTabValue(0);
          dispatch(fetchLastTabPath(RoutePath.Payments));
        }
        contentTitle = 'Payments';
        ariaLabel = contentTitle;
        break;
    }
    setPageTitle(
      <Typography variant={'title'} className={classes.pageTitle} aria-label={ariaLabel}>
        {contentTitle}
      </Typography>,
    );
  }, [tabPath]);
  useEffect(() => {
    // When the tab path changes, set the correct url path
    switch (tabValue) {
      case 1:
        if (tabPath !== RoutePath.Requests) {
          history.push(RoutePath.Requests);
          dispatch(fetchLastTabPath(RoutePath.Requests));
        }
        break;
      case 0:
      default:
        if (tabPath !== RoutePath.Payments) {
          history.push(RoutePath.Payments);
          dispatch(fetchLastTabPath(RoutePath.Payments));
        }
        break;
    }
    // clearing the selected records in case tab value changes as we do not retain selected data
    if (selectedPayment) setSelectedPayment(undefined);
    if (selectedPaymentRequests) clearPaymentRequestMenuFlags();
  }, [tabValue]);
  useEffect(() => {
    if (paymentRequestByIdAfterUpdate) {
      setActiveViewPaymentRequestRecord(paymentRequestByIdAfterUpdate);
      setIsLoadingRequestAfterUpdate(false);
      dispatch(capturePaymentRequestByIdAfterUpdate(undefined));
    }

    if (paymentRequestByIdAfterUpdateError) {
      setIsLoadingRequestAfterUpdate(false);
    }
  }, [paymentRequestByIdAfterUpdate, paymentRequestByIdAfterUpdateError]);

  useEffect(() => {
    if (dialogOpen && verificationStatus && verificationStatus !== 'ERROR') {
      setDialogOpen(false);
      dispatch(clearVerificationStatus());
    }
  }, [verificationStatus]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      tabRef?.current?.updateIndicator();
    }, theme.transitions.duration.enteringScreen);
    return () => {
      clearTimeout(timeout);
    };
  }, [theme]);

  useEffect(() => {
    if (isPaymentReceiptResent) {
      setTimeout(() => {
        dispatch(fetchIsPaymentReceiptResent(false));
      }, 5000);
    }
  }, [isPaymentReceiptResent]);

  useEffect(() => {
    if (resendPaymentReceiptError) {
      setTimeout(() => {
        dispatch(fetchResendPaymentReceiptError(undefined));
      }, 5000);
    }
  }, [resendPaymentReceiptError]);

  const handlePaymentRequestsReload = () => {
    if (tenantId) {
      dispatch(
        fetchPaymentRequestList(
          undefined,
          pageSize,
          paymentRequestOrder,
          paymentRequestQueryString,
          undefined,
          allPaymentRequestStatusList,
          paymentRequestFilterCustomerOption?.id,
        ),
      );
      clearPaymentRequestMenuFlags();
    }
  };
  const handlePaymentsReload = () => {
    if (tenantId) {
      dispatch(
        fetchPaymentList(
          undefined,
          pageSize,
          paymentOrder,
          paymentQueryString,
          allPaymentsStatusList,
          allPaymentsStatusExtendedList,
          paymentFilterFromDate,
          paymentFilterToDate,
          paymentFilterFromAmount,
          paymentFilterToAmount,
          paymentFilterCustomerOption?.id,
        ),
      );
      setSelectedPayment(undefined);
    }
  };
  useEffect(() => {
    // Reload the lists within the tabs when the tenant id changes.
    handlePaymentRequestsReload();
    handlePaymentsReload();
  }, [tenantId]);

  useEffect(() => {
    if (reloadPaymentsAfterFilter) {
      dispatch(fetchReloadPaymentsAfterFilter(false));
      // reloading payments due to filter update
      handlePaymentsReload();
    }
  }, [reloadPaymentsAfterFilter]);

  useEffect(() => {
    if (reloadPaymentRequestsAfterFilter) {
      dispatch(fetchReloadPaymentRequestsAfterFilter(false));
      // reloading payments due to filter update
      handlePaymentRequestsReload();
    }
  }, [reloadPaymentRequestsAfterFilter]);

  useEffect(() => {
    if (forwardPaymentRequestSuccess && !forwardPaymentRequestSuccess?.error) {
      setForwardPopoverAnchorElement(null);
      setTimeout(() => {
        setDisplayForwardPaymentRequestSuccessful(true);
        setTimeout(() => {
          setDisplayForwardPaymentRequestSuccessful(false);
          setForwardPaymentRequestSuccessMessage('');
          dispatch(captureForwardPaymentRequestSucccess(null));
        }, 5000);
      }, 1500);

      handlePaymentRequestsReload();
    }
  }, [forwardPaymentRequestSuccess]);

  const clearCreatePaymentSuccessMessage = () => {
    setDisplayPaymentSuccessful(false);
    dispatch(fetchCreatePaymentSuccessMessage(undefined));
  };

  useEffect(() => {
    if (createPaymentSuccessMessage) {
      setDisplayPaymentSuccessful(true);
      setTimeout(() => {
        clearCreatePaymentSuccessMessage();
      }, 10000);
    }
  }, [createPaymentSuccessMessage]);

  useEffect(() => {
    if (isTransitioningMerchant) {
      setReminderDialogOpen(true);
    }
  }, [tenantAccount]);

  const handleSettingsClick = () => {
    history.push('/settings');
  };
  const sendRefund = (paymentId: string, refundReason: string, amount: number | null, paymentRequestId?: string) => {
    if (tenantId) {
      if (!refundIdempotencyKey) {
        //If an idempotency key does not exist in state, we know this is a new refund
        const uid = uuid4();
        dispatch(fetchRefundIdempotencyKey(uid));
        dispatch(refund(uid, paymentId, refundReason, amount, paymentRequestId));
      } else {
        //This is a repeated refund/double click (not sure this can actually happen but its here just in case)
        dispatch(refund(refundIdempotencyKey, paymentId, refundReason, amount, paymentRequestId));
      }
    }
  };
  const clearRefundStateStatus = () => {
    dispatch(clearRefundStatus());
  };
  if (networkBusy || !paymentConnection) {
    return (
      <Grid container justifyContent={'center'}>
        <Grid item className={classes.loadingGridItem}>
          <Paper className={classes.paper}>Loading!</Paper>
        </Grid>
      </Grid>
    );
  }

  // Payment Request functions
  const updatePaymentRequestQueryString = (queryString: string | undefined) => {
    dispatch(capturePaymentRequestSearch(queryString));
  };

  const clearPaymentRequestSearchError = () => {
    if (searchError) dispatch(captureSearchError(undefined));
  };

  const loadPaymentRequestsPage = (endEdge: string) => {
    if (tenantId && !isPaymentRequestListInFlight) {
      dispatch(
        fetchPaymentRequestList(
          endEdge,
          pageSize,
          paymentRequestOrder,
          paymentRequestQueryString,
          undefined,
          allPaymentRequestStatusList,
          paymentRequestFilterCustomerOption?.id,
        ),
      );
    }
  };
  const handlePaymentRequestSort = (direction: OrderDirection, fieldName: string) => {
    const field = fieldName as PaymentRequestOrderField;
    setPaymentRequestDirection(direction);
    setPaymentRequestField(field);
    setPaymentRequestOrder({ direction, field });
  };

  const handlePaymentSort = (direction: OrderDirection, fieldName: string) => {
    const field = fieldName as PaymentOrderField;
    setPaymentDirection(direction);
    setPaymentField(field);
    setPaymentOrder({ direction, field });
  };
  const loadPaymentsPage = (endEdge: string) => {
    if (tenantId && !isPaymentListInFlight) {
      dispatch(
        fetchPaymentList(
          endEdge,
          pageSize,
          paymentOrder,
          paymentQueryString,
          allPaymentsStatusList,
          allPaymentsStatusExtendedList,
          paymentFilterFromDate,
          paymentFilterToDate,
          paymentFilterFromAmount,
          paymentFilterToAmount,
          paymentFilterCustomerOption?.id,
        ),
      );
    }
  };

  const updatePaymentQueryString = (queryString: string | undefined) => {
    dispatch(capturePaymentSearch(queryString));
  };

  const clearPaymentSearchError = () => {
    if (searchError) dispatch(captureSearchError(undefined));
  };

  const handleActiveTabReload = () => {
    dispatch(captureSearchError(undefined));
    if (tabValue === 0) {
      if (paymentsGridApi?.current) {
        // Clear selection state.
        paymentsGridApi?.current.setSelectionModel([]);
      }
      handlePaymentsReload();
    } else if (tabValue === 1) {
      if (paymentRequestsGridApi?.current) {
        // Clear selection state.
        paymentRequestsGridApi?.current.setSelectionModel([]);
      }
      handlePaymentRequestsReload();
    }
  };
  const handlePaymentRequestView = (record: PaymentRequest | undefined) => {
    if (record) {
      setActiveViewPaymentRequestRecord(record);
      setDetailsDialogOpen(true);
    }
  };
  const handleDetailsClose = () => {
    setDetailsDialogOpen(false);
    dispatch(clearReminderStatus());
    setRemindDisabled(false);
    dispatch(clearUpdatePaymentRequestStatus());
    dispatch(clearUpdatePaymentRequestError());
    dispatch(captureCloseOrCompleteError(undefined));
    dispatch(capturePaymentRequestByIdAfterUpdateError(undefined));
    setUpdatePaymentRequestDisabled(false);
    setIsCompletingPaymentRequest(false);
    setIsClosingPaymentRequest(false);
  };
  const handlePaymentDetailsClose = () => {
    setPaymentDetailsDialogOpen(false);
  };

  const handlePaymentView = (record: Payment | undefined) => {
    if (record) {
      setActiveViewPaymentRecord(record);
      setPaymentDetailsDialogOpen(true);
    }
  };

  const handlePaymentRemind = (record: PaymentRequest | undefined) => {
    if (record) {
      const { referenceNumber, amount, id, invoiceIds, invoiceId } = record;
      const updatedInvoiceId: string | undefined = invoiceId === null ? undefined : invoiceId;
      const updatedInvoiceIds: string[] | undefined = invoiceIds === null ? undefined : invoiceIds;
      const email = record.communications.find(item => item?.communicationType === CommunicationType.Email)?.email;
      const phone = record.communications.find(item => item?.communicationType === CommunicationType.Sms)?.phoneNumber;
      const customerId = record?.owner?.customerId;
      if (referenceNumber && amount && (email || phone || customerId) && id) {
        dispatch(
          remindPaymentRequest(referenceNumber, amount, id, updatedInvoiceId, updatedInvoiceIds, email as string, phone as string),
        );
        setRemindDisabled(true);
      }
    }
  };
  const handlePaymentRequestsRemindFromMenu = (records: PaymentRequest[] | undefined) => {
    if (records) {
      dispatch(remindPaymentRequests(records));
    }
  };
  const handleUpdatePaymentRequest = (record: PaymentRequest | undefined, amount: string) => {
    dispatch(clearUpdatePaymentRequestError());
    const updatedAmount = Math.round(parseFloat(amount) * 100);
    if (record && record.amount && updatedAmount > 0 && updatedAmount < record.amount) {
      const { referenceNumber, id, invoiceId, invoiceIds } = record;
      const updatedInvoiceId: string | undefined = invoiceId === null ? undefined : invoiceId;
      const updatedInvoiceIds: string[] | undefined = invoiceIds === null ? undefined : invoiceIds;
      const email = record.communications.find(item => item?.communicationType === CommunicationType.Email)?.email;
      const phone = record.communications.find(item => item?.communicationType === CommunicationType.Sms)?.phoneNumber;
      const customerId = record?.owner?.customerId;
      if (referenceNumber && (email || phone || customerId) && id) {
        dispatch(
          updatePaymentRequest(
            referenceNumber,
            updatedAmount,
            id,
            updatedInvoiceId,
            updatedInvoiceIds,
            email as string,
            phone as string,
          ),
        );
        setUpdatePaymentRequestDisabled(true);
      }
    }
  };
  const updatePaymentRequestCancel = () => {
    dispatch(clearUpdatePaymentRequestError());
  };

  const clearRefundError = () => {
    if (refundError) dispatch(captureRefundError(undefined));
  };
  const handleRefundSubmit = () => {
    setRefundDialogOpen(false);
    handlePaymentRequestsReload();
    handlePaymentsReload();
    clearRefundError();
  };
  const handleRefundClose = () => {
    setRefundDialogOpen(false);
    clearRefundError();
    setActiveRefundPaymentRequestRecord(undefined);
    setActiveIssueRefundPaymentRecord(undefined);
  };
  const handlePaymentRefund = (record: Payment | undefined, openedFromPayment: boolean) => {
    if (record) {
      setPaymentDetailsDialogOpen(false);
      setActiveRefundPaymentRecord(record);
      setPaymentRefundDialogOpen(true);
      setIsRefundModalOpenedFromPayment(openedFromPayment);
    }
  };
  const handlePaymentRefundSubmit = () => {
    setPaymentRefundDialogOpen(false);
    handlePaymentsReload();
    clearRefundError();
  };
  const handlePaymentRefundClose = () => {
    setPaymentRefundDialogOpen(false);
    clearRefundError();
  };

  const handlePaymentRequestClose = (record: PaymentRequest | undefined) => {
    if (record) {
      handlePaymentRequestView(record);
      setIsClosingPaymentRequest(true);
    }
  };

  const closeOrCompleteUpsertPaymentRequest = (
    referenceId: string,
    amount: number,
    id: string,
    status: PaymentRequestStatus,
    statusReason: string,
    callback: () => void,
  ) => {
    dispatch(closeOrCompletePaymentRequest(referenceId, amount, id, status, statusReason, callback));
  };

  const closeOrCompleteCallback = () => {
    if (isClosingPaymentRequest) setIsClosingPaymentRequest(false);
    if (isCompletingPaymentRequest) setIsCompletingPaymentRequest(false);
    setIsCloseOrCompleteWaiting(false);
    handlePaymentRequestsReload();
    loadRequestAfterUpdate();
  };

  const openForwardDialog = (e: SyntheticEvent<HTMLElement>) => setForwardPopoverAnchorElement(e.currentTarget);
  const closeForwardDialog = () => setForwardPopoverAnchorElement(null);

  const handleCloseOrCompleteSubmit = (record: PaymentRequest | undefined, status: PaymentRequestStatus, statusReason: string) => {
    setIsCloseOrCompleteWaiting(true);
    if (record && record.referenceNumber && record.amount && record.id) {
      closeOrCompleteUpsertPaymentRequest(
        record.referenceNumber,
        record.amount,
        record.id,
        status,
        statusReason,
        closeOrCompleteCallback,
      );
    }
  };

  const clearCloseOrCompleteError = () => {
    dispatch(captureCloseOrCompleteError(undefined));
  };

  const handleSelectedPaymentRequestsChange = (records?: PaymentRequest[]) => {
    setSelectedPaymentRequests(records);
    if (records && records.length > 0) {
      if (!paymentRequestFeatures?.consolidatedPayment && records.length > 1) {
        setCanPaySelectedRequests(false);
        setCanPayError('Unable to consolidate payments. This feature is not enabled for the merchant.');
      } else if (records.length > 10) {
        setCanPaySelectedRequests(false);
        setCanPayError('Only 10 requests may be selected for payment at the same time.');
      } else if (!isUserReader) {
        // Check if all can are unpaid/not fully paid.
        let allUnpaid = true;
        let allSameCustomer = true;
        let allSamePayer = true;
        let previousCustomerId: string;
        let previousPayerEmail: string;
        records.forEach((request: PaymentRequest) => {
          // Check if any logic is already failing, don't do compares.
          if (allUnpaid && allSameCustomer && allSamePayer) {
            if (
              request.status !== PaymentRequestStatus.Unpaid &&
              request.status !== PaymentRequestStatus.PartiallyPaid &&
              request.status !== PaymentRequestStatus.Failed
            ) {
              // Is partially paid allowed?
              allUnpaid = false;
            }
            if (allUnpaid && request.customer && request.customer.id) {
              // Only do compare if customer exists on the request. Non customer requests can be paired with same email requests.
              if (previousCustomerId && previousCustomerId !== request.customer.id) {
                allSameCustomer = false;
              }
              previousCustomerId = request.customer.id;
            }
            if (allSameCustomer && allUnpaid && request.communications && request.communications[0]) {
              const initialComm = request.communications[0];
              const sentTo = initialComm.email;
              if (previousPayerEmail && sentTo && previousPayerEmail !== sentTo) {
                allSamePayer = false;
              } else if (sentTo) {
                previousPayerEmail = sentTo;
              }
            }
          }
        });
        // Check if all of same customer.
        setCanPaySelectedRequests(allUnpaid && allSameCustomer && allSamePayer);
        if (allUnpaid && allSameCustomer && allSamePayer) {
          setDisplayPayRequestsError(false);
          setCanPayError(undefined);
        } else if (!allUnpaid) {
          setCanPayError('To pay requests, all selected requests must be either in an unpaid, partially paid, or failed state.');
        } else if (!allSamePayer) {
          setCanPayError('To pay requests, all selected requests must be for the same payer.');
        } else {
          setCanPayError('To pay requests, all selected requests must be for the same customer.');
        }
      } else {
        // Having only userReader permissions will disable the payment button.
        setCanPaySelectedRequests(false);
        setCanPayError(undefined);
      }
      // checking whether we can close the request from menu option or not
      const firstRequest = records[0];
      const closeRequest =
        records.length === 1 &&
        (firstRequest?.status === PaymentRequestStatus.Unpaid ||
          firstRequest?.status === PaymentRequestStatus.Failed ||
          firstRequest?.status === PaymentRequestStatus.Canceled);
      setCanCloseRequestFromMenu(closeRequest);

      // checking whether we can send the communication of requests from menu option or not
      const hasAllowedStatus = !records.find(
        request =>
          !(
            request?.status === PaymentRequestStatus.Unpaid ||
            request?.status === PaymentRequestStatus.Failed ||
            request?.status === PaymentRequestStatus.Canceled ||
            request?.status === PaymentRequestStatus.PartiallyPaid
          ),
      );
      const hasRequestsWithCommunication = !records.find(
        request => !request?.communications || (!!request.communications && request.communications.length < 1),
      );
      setCanSendRequestCommunicationFromMenu(hasAllowedStatus && hasRequestsWithCommunication);
    } else {
      setCanPayError(undefined);
      clearPaymentRequestMenuFlags();
    }
  };

  const handlePaymentDetailsFromRefund = (paymentRecord: Payment) => {
    handlePaymentRefundClose();
    handlePaymentView(paymentRecord);
  };
  const handlePaymentRequestDetailsFromPayment = (paymentRequestRecord: PaymentRequest | undefined) => {
    handlePaymentDetailsClose();
    setActiveViewPaymentRequestRecord(paymentRequestRecord);
    setDetailsDialogOpen(true);
  };
  const handlePaymentRequestRefundFromModal = (
    paymentRequestRecord: PaymentRequest | undefined,
    paymentRecord: Payment | undefined,
  ) => {
    if (paymentRequestRecord && paymentRecord) {
      setDetailsDialogOpen(false);
      setActiveRefundPaymentRequestRecord(paymentRequestRecord);
      setActiveIssueRefundPaymentRecord(paymentRecord);
      setRefundDialogOpen(true);
    }
  };
  const handleRequestModalViewFromRefund = (record: PaymentRequest | undefined) => {
    if (record) {
      handleRefundClose();
      setActiveViewPaymentRequestRecord(record);
      setDetailsDialogOpen(true);
    }
  };

  const isPaymentRefundable = () => {
    const payment = selectedPayment;
    if (!payment) return false;

    if (payment.paymentRequestAllocation && payment.paymentRequestAllocation.length > 1) return false;

    let refunded = 0;
    payment?.refunds.forEach(refund => {
      if (refund?.status === RefundStatus.Completed || refund?.status === RefundStatus.Pending) {
        refunded += refund.amount || 0;
      }
    });
    if (refunded > 0) {
      dispatch(fetchIsPaymentRefunded(true));
      dispatch(fetchPaymentRefundedAmount(refunded));
    } else {
      dispatch(fetchIsPaymentRefunded(false));
      dispatch(fetchPaymentRefundedAmount(undefined));
    }
    return payment.status === PaymentStatus.Completed && !!payment.amount && refunded < payment.amount;
  };

  const invoiceDetailClicked = (paymentRequestId: string) => {
    setIsInvoiceDetailClicked(true);
    dispatch(fetchPaymentRequestById(paymentRequestOrder, paymentRequestId));
  };

  const invoiceRefundClicked = (paymentRequestId: string) => {
    setIsInvoiceRefundClicked(true);
    dispatch(fetchPaymentRequestById(paymentRequestOrder, paymentRequestId));
  };

  const openModalFromPaymentRequestInvoice = (paymentRecord: Payment | undefined) => {
    if (paymentRequestById || paymentRequestByIdError) {
      if (paymentRequestById) {
        const paymentRequestByIdRecord = paymentRequestById;

        if (isInvoiceDetailClicked) {
          handlePaymentDetailsClose();
          handlePaymentRequestDetailsFromPayment(paymentRequestByIdRecord);
        }
        if (isInvoiceRefundClicked) {
          handlePaymentDetailsClose();
          handlePaymentRequestRefundFromModal(paymentRequestByIdRecord, paymentRecord);
        }
        dispatch(capturePaymentRequestById(undefined));
      }
      if (paymentRequestByIdError) {
        dispatch(capturePaymentRequestByIdError(undefined));
      }
      if (isInvoiceDetailClicked) setIsInvoiceDetailClicked(false);
      if (isInvoiceRefundClicked) setIsInvoiceRefundClicked(false);
    }
  };

  const historyDetailClicked = (paymentId: string) => {
    setIsHistoryDetailClicked(true);
    dispatch(fetchPaymentById(paymentOrder, paymentId));
  };

  const openModalFromPaymentHistory = () => {
    if (paymentById || paymentByIdError) {
      if (paymentById) {
        const paymentByIdRecord = paymentById;

        if (isHistoryDetailClicked) {
          handleDetailsClose();
          handlePaymentView(paymentByIdRecord);
        }
        dispatch(capturePaymentById(undefined));
      }
      if (paymentByIdError) {
        dispatch(capturePaymentByIdError(undefined));
      }
      if (isHistoryDetailClicked) setIsHistoryDetailClicked(false);
    }
  };

  const openPaymentModalFromRefund = (paymentRecord?: Payment) => {
    if (paymentRecord) {
      handleRefundClose();
      handlePaymentView(paymentRecord);
    }
  };

  const refundRequestClicked = (paymentRequestId: string) => {
    setIsRefundRequestClicked(true);
    dispatch(fetchPaymentRequestById(paymentRequestOrder, paymentRequestId));
  };

  const openRequestModalFromRefund = () => {
    if (paymentRequestById || paymentRequestByIdError) {
      if (paymentRequestById) {
        const paymentRequestByIdRecord = paymentRequestById;
        handlePaymentRefundClose();
        handlePaymentRequestView(paymentRequestByIdRecord);
        dispatch(capturePaymentRequestById(undefined));
      }
      if (paymentRequestByIdError) {
        dispatch(capturePaymentRequestByIdError(undefined));
      }
      setIsRefundRequestClicked(false);
    }
  };

  const clearPaymentsReportOrError = () => {
    if (paymentsReport) {
      dispatch(capturePaymentsReport(undefined));
    }

    if (paymentsReportError) {
      dispatch(capturePaymentsReportError(undefined));
    }
  };

  const handleExportToggle = () => {
    setExportDialogOpen(!exportDialogOpen);
    clearPaymentsReportOrError();
  };

  const handlePaymentsReport = (endDate: string, format: FileFormat, startDate: string) => {
    clearPaymentsReportOrError();
    dispatch(createPaymentsReport(endDate, format, startDate));
  };

  const updateExportsCancelledInFlight = (exportsCancelledInFlight: boolean) => {
    dispatch(captureExportsCancelledInFlight(exportsCancelledInFlight));
  };

  const handleAdditionalBannerChange = (hasBanner: boolean) => {
    dispatch(fetchHasAdditionalBanner(hasBanner));
  };

  const handleAddPaymentRequestOpen = () => {
    // Open payment request screen.
    history.push(RoutePath.PaymentRequest);
  };

  const handlePendingBannerClose = () => {
    dispatch(fetchPendingBannerVisible(false));
  };

  const handleResendPaymentReceipt = (paymentId: string | undefined) => {
    if (paymentId) {
      dispatch(resendPaymentReceipt(paymentId));
    }
  };

  const getSelectedPaymentEmail = () => {
    if (selectedPayment?.paymentMethod?.creditCard) {
      return selectedPayment.paymentMethod.creditCard.cardHolder?.email;
    }
    if (selectedPayment?.paymentMethod?.paymentBank) {
      return selectedPayment.paymentMethod.paymentBank.accountHolder?.email;
    }
    return undefined;
  };
  const handlePaymentTerminalOpenFromRequest = () => {
    // Set the state for selected payments and move to the payment screen.
    if (canPaySelectedRequests) {
      dispatch(fetchRequestsToPay(selectedPaymentRequests));
      history.push('/payment');
    } else if (canPayError) {
      setDisplayPayRequestsError(true);
    }
  };
  const handleForwardPaymentRequest = (email: string) => {
    if (selectedPaymentRequests) {
      const input: PaymentRequestForwardInput = { email, paymentRequestId: selectedPaymentRequests[0].id };
      dispatch(forwardPaymentRequest(input));
      setForwardPaymentRequestSuccessMessage(`The payment request has been successfully forwarded to ${email}`);
    }
  };

  const handlePaymentRequestFilterStatusUpdate = (
    statusCount: number,
    paymentRequestStatusFilterList?: AllPaymentRequestsStatusFilterValue[],
  ) => {
    if (statusCount === 0 || statusCount === PR_MAX_STATUS_COUNT) {
      dispatch(fetchPaymentRequestFilterStatusCount(PR_MAX_STATUS_COUNT));
      dispatch(fetchPaymentRequestFilterStatusList(undefined));
      dispatch(fetchAllPaymentRequestStatusList(undefined));

      dispatch(fetchReloadPaymentRequestsAfterFilter(true));
    } else {
      dispatch(fetchPaymentRequestFilterStatusCount(statusCount));
      dispatch(fetchPaymentRequestFilterStatusList(paymentRequestStatusFilterList));

      const updatedStatusList: PaymentRequestStatus[] = [];

      paymentRequestStatusFilterList?.forEach(item => {
        if (item.isSelected) {
          updatedStatusList?.push(item.value as PaymentRequestStatus);
        }
      });

      dispatch(fetchAllPaymentRequestStatusList(updatedStatusList.length > 0 ? updatedStatusList : undefined));

      dispatch(fetchReloadPaymentRequestsAfterFilter(true));
    }
  };

  const handlePaymentFilterStatusUpdate = (statusCount: number, paymentStatusFilterList?: AllPaymentStatusFilterValue[]) => {
    if (statusCount === 0 || statusCount === MAX_STATUS_COUNT) {
      dispatch(fetchPaymentFilterStatusCount(MAX_STATUS_COUNT));
      dispatch(fetchPaymentFilterStatusList(undefined));
      dispatch(fetchAllPaymentsStatusList(undefined));
      dispatch(fetchAllPaymentsStatusExtendedList(undefined));

      dispatch(fetchReloadPaymentsAfterFilter(true));
    } else {
      dispatch(fetchPaymentFilterStatusCount(statusCount));
      dispatch(fetchPaymentFilterStatusList(paymentStatusFilterList));

      const updatedStatusList: PaymentStatus[] = [];
      const updatedStatusExtendedList: PaymentStatusExtended[] = [];

      paymentStatusFilterList?.forEach(item => {
        if (item.isSelected) {
          if (item.isExtended) {
            updatedStatusExtendedList?.push(item.value as PaymentStatusExtended);
          } else {
            updatedStatusList?.push(item.value as PaymentStatus);
          }
        }
      });

      dispatch(fetchAllPaymentsStatusList(updatedStatusList.length > 0 ? updatedStatusList : undefined));
      dispatch(fetchAllPaymentsStatusExtendedList(updatedStatusExtendedList.length > 0 ? updatedStatusExtendedList : undefined));

      dispatch(fetchReloadPaymentsAfterFilter(true));
    }
  };

  const handlePaymentFilterDateUpdate = (fromDate?: string, toDate?: string, dateOption?: string, reload?: boolean) => {
    dispatch(fetchPaymentFilterDateOption(dateOption));
    dispatch(fetchPaymentFilterFromDate(fromDate));
    dispatch(fetchPaymentFilterToDate(toDate));
    // reload only triggered if status isn't updated else triggered from status updation
    if (reload) dispatch(fetchReloadPaymentsAfterFilter(true));
  };

  const handlePaymentFilterAmountUpdate = (isAmountRange: boolean, fromAmount?: number, toAmount?: number, reload?: boolean) => {
    dispatch(fetchPaymentFilterAmountRange(isAmountRange));
    dispatch(fetchPaymentFilterFromAmount(fromAmount));
    dispatch(fetchPaymentFilterToAmount(toAmount));
    // reload only triggered if status isn't updated else triggered from status updation
    if (reload) dispatch(fetchReloadPaymentsAfterFilter(true));
  };

  const handlePaymentRequestFilterCustomerUpdate = (customer?: CustomerOption) => {
    // Set the state for the update.
    dispatch(fetchPaymentRequestFilterCustomerOption(customer));
    dispatch(fetchReloadPaymentRequestsAfterFilter(true));
  };

  const handlePaymentFilterCustomerUpdate = (customer?: CustomerOption) => {
    // Set the state for the update.
    dispatch(fetchPaymentFilterCustomerOption(customer));
    dispatch(fetchReloadPaymentsAfterFilter(true));
  };

  const handleRemovePaymentRequestCustomerFilter = () => {
    handlePaymentRequestFilterCustomerUpdate(undefined);
  };

  const handleRemovePaymentCustomerFilter = () => {
    handlePaymentFilterCustomerUpdate(undefined);
  };

  const handleRemovePaymentRequestStatusFilter = (statusIndex: number) => {
    if (paymentRequestFilterStatusList) {
      const updatedStatusList = [...paymentRequestFilterStatusList];
      const updatedItem = { ...updatedStatusList[statusIndex] };
      updatedItem.isSelected = false;
      updatedStatusList[statusIndex] = updatedItem;

      handlePaymentRequestFilterStatusUpdate(paymentRequestFilterStatusCount - 1, updatedStatusList);
    }
  };
  const handleRemovePaymentStatusFilter = (statusIndex: number) => {
    if (paymentFilterStatusList) {
      const updatedStatusList = [...paymentFilterStatusList];
      const updatedItem = { ...updatedStatusList[statusIndex] };
      updatedItem.isSelected = false;
      updatedStatusList[statusIndex] = updatedItem;

      handlePaymentFilterStatusUpdate(paymentFilterStatusCount - 1, updatedStatusList);
    }
  };

  const handleRemovePaymentDateFilter = (reload: boolean) => {
    const fromDate = undefined;
    const toDate = undefined;
    const dateOption = undefined;

    handlePaymentFilterDateUpdate(fromDate, toDate, dateOption, reload);
  };

  const handleRemovePaymentAmountFilter = (reload: boolean) => {
    const fromAmount = undefined;
    const toAmount = undefined;

    handlePaymentFilterAmountUpdate(paymentFilterAmountRange, fromAmount, toAmount, reload);
  };

  const handleRemoveAllPaymentRequestsFilter = () => {
    handleRemovePaymentRequestCustomerFilter();
    // keeping status removal at end so status updation can trigger reload
    handlePaymentRequestFilterStatusUpdate(PR_MAX_STATUS_COUNT);
  };

  const handleRemoveAllPaymentsFilter = () => {
    handleRemovePaymentDateFilter(false);
    handleRemovePaymentAmountFilter(false);
    handleRemovePaymentCustomerFilter();
    // keeping status removal at end so status updation can trigger reload
    handlePaymentFilterStatusUpdate(MAX_STATUS_COUNT);
  };

  return (
    <Box className={classes.rootContainer}>
      <Helmet>
        <meta name="ai:viewId" content="home"></meta>
        <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Home"></meta>
        <title>Aptean Pay Merchant Portal - Home</title>
      </Helmet>
      {/* {Dialogs} */}
      <Dialog
        aria-label={'refund dialog'}
        open={refundDialogOpen}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            // TODO: Potential double handler.
            handleRefundClose();
          }
        }}
        disableEscapeKeyDown
        fullWidth={true}
        maxWidth={'sm'}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <IssueRefund
          close={handleRefundClose}
          paymentRequestRecord={activeRefundPaymentRequestRecord}
          paymentRecord={activeIssueRefundPaymentRecord}
          paymentRecordId={activeIssueRefundPaymentRecord?.id}
          refundStatus={refundStatus}
          sendRefund={sendRefund}
          clearRefundStateStatus={clearRefundStateStatus}
          defaultCurrency={defaultCurrency}
          submit={handleRefundSubmit}
          refundError={refundError}
          clearRefundError={clearRefundError}
          openRequestModal={handleRequestModalViewFromRefund}
          openPaymentModalFromRefund={openPaymentModalFromRefund}
          isCreditMemoEnabled={!!tenantAccount?.settings?.features?.creditMemos?.enabled}
        />
      </Dialog>
      <Dialog
        aria-label={'payment refund dialog'}
        open={paymentRefundDialogOpen}
        onClose={(event, reason) => {
          // TODO: Potential double handler.
          if (reason !== 'backdropClick') {
            handlePaymentRefundClose();
          }
        }}
        disableEscapeKeyDown
        fullWidth={true}
        maxWidth={'sm'}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <IssueRefundPayment
          close={handlePaymentRefundClose}
          paymentRecord={activeRefundPaymentRecord}
          refundStatus={refundStatus}
          sendRefund={sendRefund}
          clearRefundStateStatus={clearRefundStateStatus}
          defaultCurrency={defaultCurrency}
          submit={handlePaymentRefundSubmit}
          openPaymentDetails={handlePaymentDetailsFromRefund}
          isPaymentRefunded={isPaymentRefunded}
          paymentRefundedAmount={paymentRefundedAmount}
          refundError={refundError}
          clearRefundError={clearRefundError}
          paymentRequestById={paymentRequestById}
          paymentRequestByIdError={paymentRequestByIdError}
          isFetchingPaymentRequestById={isRefundRequestClicked}
          handleRequestClicked={refundRequestClicked}
          openRequestModalFromRefund={openRequestModalFromRefund}
          isCreditMemoEnabled={!!tenantAccount?.settings?.features?.creditMemos?.enabled}
          isModalOpenedFromPayment={isRefundModalOpenedFromPayment}
        />
      </Dialog>
      <ForwardDialog
        anchorElement={forwardPopOverAnchorElement}
        handleClose={closeForwardDialog}
        handleForward={handleForwardPaymentRequest}
      />
      <PaymentRequestDetails
        open={detailsDialogOpen}
        onClose={handleDetailsClose}
        paymentRecord={activeViewPaymentRequestRecord}
        remind={handlePaymentRemind}
        defaultCurrency={defaultCurrency}
        remindPressed={remindDisabled}
        update={handleUpdatePaymentRequest}
        updatePaymentRequestError={updatePaymentRequestError}
        savePressed={updatePaymentRequestDisabled}
        setSavePressed={setUpdatePaymentRequestDisabled}
        clearUpdatePaymentRequestError={updatePaymentRequestCancel}
        historyDetailClicked={historyDetailClicked}
        openModalFromPaymentHistory={openModalFromPaymentHistory}
        paymentById={paymentById}
        paymentByIdError={paymentByIdError}
        isFetchingPaymentById={isHistoryDetailClicked}
        isCreditMemoEnabled={!!tenantAccount?.settings?.features?.creditMemos?.enabled}
        isClosingRequest={isClosingPaymentRequest}
        setIsClosingRequest={setIsClosingPaymentRequest}
        isCompletingRequest={isCompletingPaymentRequest}
        setIsCompletingRequest={setIsCompletingPaymentRequest}
        closeOrCompleteRequest={handleCloseOrCompleteSubmit}
        isCloseOrCompleteWaiting={isCloseOrCompleteWaiting}
        closeOrCompleteError={closeOrCompleteError}
        clearCloseOrCompleteError={clearCloseOrCompleteError}
        isLoadingRequestAfterUpdate={isLoadingRequestAfterUpdate}
        requestAfterUpdateError={paymentRequestByIdAfterUpdateError}
        canUpdatePaymentRequest={canUpdatePaymentRequest}
        hasPreviewWithNoEmail={hasPreviewWithNoEmail}
      />

      <PaymentDetails
        open={paymentDetailsDialogOpen}
        onClose={handlePaymentDetailsClose}
        refund={handlePaymentRefund}
        paymentRecord={activeViewPaymentRecord}
        defaultCurrency={defaultCurrency}
        invoiceDetailClicked={invoiceDetailClicked}
        invoiceRefundClicked={invoiceRefundClicked}
        openModalFromPaymentRequestInvoice={openModalFromPaymentRequestInvoice}
        paymentRequestById={paymentRequestById}
        paymentRequestByIdError={paymentRequestByIdError}
        isFetchingPaymentRequestById={isInvoiceDetailClicked || isInvoiceRefundClicked}
        isCreditMemoEnabled={!!tenantAccount?.settings?.features?.creditMemos?.enabled}
        handleResendPaymentReceipt={handleResendPaymentReceipt}
        isResendingPaymentReceipt={isResendingPaymentReceipt}
        isPaymentReceiptResent={isPaymentReceiptResent}
        resendPaymentReceiptError={resendPaymentReceiptError}
        canCreateRefund={canCreateRefund}
        isUserReader={isUserReader}
      />
      <ExportPayments
        open={exportDialogOpen}
        onClose={handleExportToggle}
        paymentsReport={paymentsReport}
        paymentsReportError={paymentsReportError}
        handlePaymentsReport={handlePaymentsReport}
        updateExportsCancelledInFlight={updateExportsCancelledInFlight}
        generatingExportsInFlight={generatingExportsInFlight}
      />

      {tenantAccount?.company?.verification?.status === CompanyVerificationStatus.Pending && (
        <AccountPendingBanner
          settingsClickHandler={handleSettingsClick}
          handlePendingBannerClose={handlePendingBannerClose}
          pendingBannerVisible={pendingBannerVisible}
          setHasAdditionalBanner={handleAdditionalBannerChange}
          hasAdditionalBanner={hasAdditionalBanner}
        />
      )}
      {/* {Cannot pay selected requests warning} */}
      <Snackbar
        className={matches ? classes.snackBarMobile : classes.snackBar}
        open={displayPayRequestsError}
        autoHideDuration={5000}
        onClose={() => {
          setDisplayPayRequestsError(false);
        }}
        anchorOrigin={anchorOrigin}
      >
        <Alert color={'warning'} className={classes.snackBarWarningAlert} severity="warning">
          <Typography className={classes.warningAlertText}>{canPayError}</Typography>
        </Alert>
      </Snackbar>

      {/* {Challenge success} */}
      <Snackbar
        className={matches ? classes.snackBarMobile : classes.snackBar}
        open={displayChallengeSuccessful}
        autoHideDuration={5000}
        onClose={() => {
          setDisplayChallengeSuccessful(false);
        }}
        anchorOrigin={anchorOrigin}
      >
        <Alert className={classes.snackBarAlert} icon={<CheckIcon style={{ color: theme.palette.success.dark }} />} severity="success">
          Your challenge has been successfully submitted
        </Alert>
      </Snackbar>

      {/* {payment receipt resent} */}
      <Snackbar
        className={matches ? classes.snackBarMobile : classes.snackBar}
        open={isPaymentReceiptResent && !paymentDetailsDialogOpen && !resendPaymentReceiptError}
        autoHideDuration={5000}
        anchorOrigin={anchorOrigin}
      >
        <Alert className={classes.snackBarAlert} icon={<CheckIcon style={{ color: theme.palette.success.dark }} />} severity="success">
          {`Payment receipt has been sent to ${getSelectedPaymentEmail() || 'the addresses on file'}.`}
        </Alert>
      </Snackbar>

      {/* {payment receipt resent error} */}
      <Snackbar
        className={matches ? classes.snackBarMobile : classes.snackBar}
        open={
          !paymentDetailsDialogOpen &&
          !!resendPaymentReceiptError &&
          resendPaymentReceiptError.graphQLErrors.some(e => e.extensions?.exception.reasonCode === 'RECEIPT_ALREADY_SENT')
        }
        autoHideDuration={5000}
        anchorOrigin={anchorOrigin}
      >
        <Alert className={classes.snackBarWarningAlert} icon={false} severity="warning">
          <Typography className={classes.warningAlertText}>The same payment receipt can only be sent once per 10 minutes.</Typography>
        </Alert>
      </Snackbar>

      {/* {forward payment request resend error} */}
      <Snackbar
        className={matches ? classes.snackBarMobile : classes.snackBar}
        open={!!forwardPaymentRequestError}
        autoHideDuration={5000}
        onClose={() => dispatch(captureForwardPaymentRequestError())}
        anchorOrigin={anchorOrigin}
      >
        <Alert className={classes.snackBarErrorAlert} icon={false} severity="error">
          <Typography className={classes.errorAlertText}>{forwardPaymentRequestError?.message}</Typography>
        </Alert>
      </Snackbar>

      {/* {forward payment request success} */}
      <Snackbar
        className={matches ? classes.snackBarMobile : classes.snackBar}
        open={displayForwardPaymentRequestSuccessful}
        autoHideDuration={5000}
        onClose={() => setDisplayForwardPaymentRequestSuccessful(false)}
        anchorOrigin={anchorOrigin}
      >
        <Alert className={classes.snackBarAlert} icon={<CheckIcon style={{ color: theme.palette.success.dark }} />} severity="success">
          {forwardPaymentRequestSuccessMessage}
        </Alert>
      </Snackbar>

      {/* {payment success} */}
      <Snackbar
        className={matches ? classes.snackBarMobile : classes.snackBar}
        open={displayPaymentSuccessful}
        autoHideDuration={5000}
        onClose={clearCreatePaymentSuccessMessage}
        anchorOrigin={anchorOrigin}
      >
        <Alert className={classes.snackBarAlert} icon={<CheckIcon style={{ color: theme.palette.success.main }} />} severity="success">
          {createPaymentSuccessMessage}
        </Alert>
      </Snackbar>

      {/* Show PTT onboarding banner if the existing merchant has the transition status of REQUESTED */}
      {isTransitioningMerchant && (
        <Alert
          className={classes.snackBarErrorAlert}
          icon={false}
          severity="error"
          sx={{ marginBottom: theme.spacing(1), fontSize: '1rem' }}
        >
          {'To avoid payment disruptions, it is crucial that you complete the '}
          <Link
            variant="body2"
            sx={{ fontWeight: 500, cursor: 'pointer', fontSize: '1rem' }}
            onClick={() => {
              history.push(RoutePath.Onboarding);
            }}
          >
            onboarding form
          </Link>
          {' ASAP. You will not be able to receive payments after the month of March if this is not completed.'}
        </Alert>
      )}

      {/* Dialog reminder for transitioning merchants. */}
      {isTransitioningMerchant && (
        <Dialog
          open={reminderDialogOpen}
          onClose={() => {
            setReminderDialogOpen(false);
          }}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle sx={{ backgroundColor: theme.palette.error.light, color: theme.palette.error.main, fontWeight: 500 }}>
            Action Required
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: theme.palette.error.light }}>
            <DialogContentText sx={{ color: theme.palette.error.main, fontWeight: 500, fontSize: '1rem' }}>
              {
                'To avoid payment disruptions, it is crucial that you complete the onboarding form ASAP. You will not be able to receive payments after the month of March if this is not completed.'
              }
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: theme.palette.error.light }}>
            <Button
              variant="text"
              onClick={() => {
                setReminderDialogOpen(false);
              }}
            >
              Not Now
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setReminderDialogOpen(false);
                history.push(RoutePath.Onboarding);
              }}
            >
              Take Me There
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Show PTT onboard processing banner if existing merchant has the transition status of PENDING */}
      {tenantAccount?.company?.verification?.transitionStatus === TransitionStatus.Pending &&
        tenantAccount?.payFacType !== PayFac.Ptt && (
          <Alert className={classes.snackBarInfoAlert} icon={false} severity="info" sx={{ marginBottom: theme.spacing(1) }}>
            {'Your application form is being processed, there will be no disruption in service during this time.'}
          </Alert>
        )}

      {/* {Main Content} */}
      <Grid container wrap={'wrap-reverse'} direction="row" justifyContent="flex-end" alignItems="stretch" style={{ flex: 1 }}>
        <Grid item className={classes.transition} style={{ width: '100%', display: 'flex' }}>
          <Paper className={classes.tabs}>
            {pageTitle}
            {<Divider />}
            <TabPanel value={tabValue} index={0} data-cy="payments-panel">
              {/* TODO: Change field/sort/direction to be list specific */}
              <Helmet>
                <meta name="ai:viewId" content="all-payments"></meta>
                <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Payments"></meta>
                <title>Aptean Pay Merchant Portal - Payments</title>
              </Helmet>
              <Toolbar className={classes.tabToolbar} variant="dense">
                <Grid alignItems="start" container>
                  <Grid container item xs={12} md={6} lg={7} xl={8} justifyContent={matchesXsDown ? 'space-around' : 'flex-start'}>
                    <Button
                      size={iconSize}
                      variant={'text'}
                      aria-label={'refresh'}
                      color={'primary'}
                      onClick={handleActiveTabReload}
                      data-cy="refresh"
                      className={classes.toolbarButton}
                    >
                      <RefreshIcon />
                    </Button>

                    {!!tenantAccount?.settings?.features?.payments?.virtualTerminal && (
                      <Button
                        component={RouterLink}
                        startIcon={matchesXsDown ? null : <SvgIcon component={AddIcon} />}
                        size={iconSize}
                        to={'/payment'}
                        variant={'text'}
                        aria-label={'add payment'}
                        color={'primary'}
                        data-cy="add-payment"
                        className={classes.toolbarButton}
                        disabled={isUserReader}
                      >
                        {matchesXsDown ? <SvgIcon component={AddIcon} /> : 'New'}
                      </Button>
                    )}

                    <Button
                      startIcon={matchesXsDown ? null : <InfoIcon />}
                      size={iconSize}
                      variant="text"
                      aria-label={'view details'}
                      disabled={!selectedPayment}
                      color="primary"
                      onClick={() => handlePaymentView(selectedPayment)}
                      data-cy="view-details"
                      className={classes.toolbarButton}
                    >
                      {matchesXsDown ? <InfoIcon /> : 'Details'}
                    </Button>

                    <Button
                      startIcon={matchesXsDown ? null : <SvgIcon component={RefundIcon} />}
                      size={iconSize}
                      variant={'text'}
                      aria-label={'refund'}
                      color={'primary'}
                      disabled={!canCreateRefund || !isPaymentRefundable()}
                      onClick={() => handlePaymentRefund(selectedPayment, false)}
                      data-cy="refund"
                      className={classes.toolbarButton}
                    >
                      {matchesXsDown ? <SvgIcon component={RefundIcon} /> : 'Refund'}
                    </Button>

                    <Button
                      startIcon={matchesXsDown ? null : <ReceiptIcon />}
                      size={iconSize}
                      variant="text"
                      aria-label={'resend receipt'}
                      color="primary"
                      onClick={() => {
                        handleResendPaymentReceipt(selectedPayment?.id);
                      }}
                      data-cy="resend-receipt"
                      className={classes.toolbarButton}
                      disabled={
                        isUserReader ||
                        !selectedPayment ||
                        isResendingPaymentReceipt ||
                        selectedPayment.status !== PaymentStatus.Completed
                      }
                    >
                      {matchesXsDown ? <ReceiptIcon /> : 'Resend Receipt'}
                    </Button>

                    <Button
                      startIcon={matchesXsDown ? null : <SvgIcon component={FileDownloadIcon} />}
                      size={iconSize}
                      variant="text"
                      aria-label={'export'}
                      color="primary"
                      onClick={handleExportToggle}
                      data-cy="export-payments"
                      className={classes.toolbarButton}
                    >
                      {matchesXsDown ? <SvgIcon component={FileDownloadIcon} /> : 'Export'}
                    </Button>
                  </Grid>
                  <Grid
                    container
                    item
                    wrap="nowrap"
                    xs={12}
                    md={6}
                    lg={5}
                    xl={4}
                    justifyContent={matches ? 'flex-start' : 'flex-end'}
                    alignItems="start"
                    alignContent="start"
                  >
                    <Grid item maxWidth={340} flexGrow={1}>
                      <SearchBar
                        placeholderText={'Search Payments'}
                        queryString={paymentQueryString}
                        updateQueryString={updatePaymentQueryString}
                        minimumCharacter={3}
                        searchError={searchError}
                        clearSearchError={clearPaymentSearchError}
                        isSearchDisabled={tabValue !== 0}
                        isSpacesAllowed={true}
                        searchName={'payments'}
                      />
                    </Grid>
                    <Grid item>
                      <PaymentsListFilter
                        totalCount={paymentConnection.totalCount}
                        defaultCurrency={defaultCurrency}
                        filterDateOption={paymentFilterDateOption}
                        filterFromDate={paymentFilterFromDate}
                        filterToDate={paymentFilterToDate}
                        filterAmountRange={paymentFilterAmountRange}
                        filterFromAmount={paymentFilterFromAmount}
                        filterToAmount={paymentFilterToAmount}
                        filterStatusCount={paymentFilterStatusCount}
                        filterPaymentStatusList={paymentFilterStatusList}
                        filterCustomer={paymentFilterCustomerOption}
                        handleFilterStatusUpdate={handlePaymentFilterStatusUpdate}
                        handleFilterAmountUpdate={handlePaymentFilterAmountUpdate}
                        handleFilterDateUpdate={handlePaymentFilterDateUpdate}
                        handleFilterCustomerUpdate={handlePaymentFilterCustomerUpdate}
                        customersEnabled={!!tenantAccount?.settings?.features?.customers?.enabled}
                        hasCustomerOptionError={Boolean(customerOptionError)}
                      />
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <PaymentsListFilterChips
                      isLoadingPayments={isLoadingPayments}
                      defaultCurrency={defaultCurrency}
                      filterDateOption={paymentFilterDateOption}
                      filterFromDate={paymentFilterFromDate}
                      filterToDate={paymentFilterToDate}
                      filterAmountRange={paymentFilterAmountRange}
                      filterFromAmount={paymentFilterFromAmount}
                      filterToAmount={paymentFilterToAmount}
                      filterStatusCount={paymentFilterStatusCount}
                      filterPaymentStatusList={paymentFilterStatusList}
                      filterCustomerOption={paymentFilterCustomerOption}
                      removeAllPaymentsFilter={handleRemoveAllPaymentsFilter}
                      removeAmountRange={handleRemovePaymentAmountFilter}
                      removeDateRange={handleRemovePaymentDateFilter}
                      removeStatusFilter={handleRemovePaymentStatusFilter}
                      removeCustomerFilter={handleRemovePaymentCustomerFilter}
                    />
                  </Grid>
                </Grid>
              </Toolbar>
              {paymentConnection && (
                <PaymentsList
                  loadPage={loadPaymentsPage}
                  handleViewPayment={handlePaymentView}
                  setSelectedRecord={setSelectedPayment}
                  selectedRecord={selectedPayment}
                  defaultCurrency={defaultCurrency}
                  paymentConnection={paymentConnection}
                  payments={payments}
                  direction={paymentDirection}
                  field={paymentField}
                  handleSort={handlePaymentSort}
                  isLoadingPayments={isLoadingPayments}
                  isCreditMemoEnabled={!!tenantAccount?.settings?.features?.creditMemos?.enabled}
                  isCustomerEnabled={!!tenantAccount?.settings?.features?.customers?.enabled}
                  gridApiRef={paymentsGridApi}
                  isConvenienceFeeEnabled={!!tenantAccount?.settings?.features?.payments?.convenienceFees}
                />
              )}
            </TabPanel>
            <TabPanel value={tabValue} index={1} data-cy="payment-requests-panel">
              <Helmet>
                <meta name="ai:viewId" content="payment-requests"></meta>
                <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Payment Requests"></meta>
                <title>Aptean Pay Merchant Portal - Payment Requests</title>
              </Helmet>
              {/* TODO: Change field/sort/direction to be list specific */}
              <Toolbar className={classes.tabToolbar} variant="dense">
                <Grid alignItems="start" container>
                  <Grid container item xs={12} md={6} lg={7} xl={8} justifyContent={matchesXsDown ? 'space-around' : 'flex-start'}>
                    <Button
                      size={iconSize}
                      variant={'text'}
                      aria-label={'refresh'}
                      color={'primary'}
                      onClick={handleActiveTabReload}
                      data-cy="refresh"
                      className={classes.toolbarButton}
                    >
                      {<RefreshIcon />}
                    </Button>

                    <Button
                      startIcon={matchesXsDown ? null : <SvgIcon component={AddIcon} />}
                      size={iconSize}
                      variant={'text'}
                      aria-label={'add payment request'}
                      disabled={!canCreatePaymentRequest || hasPreviewWithNoEmail}
                      color={'primary'}
                      onClick={handleAddPaymentRequestOpen}
                      data-cy="add-payment-request"
                      className={classes.toolbarButton}
                    >
                      {matchesXsDown ? <SvgIcon component={AddIcon} /> : 'New'}
                    </Button>

                    {!!tenantAccount?.settings?.features?.payments?.virtualTerminal && (
                      <Button
                        startIcon={matchesXsDown ? null : <SvgIcon component={CreditCardIcon} />}
                        size={iconSize}
                        variant={'text'}
                        aria-label={'add payment'}
                        color={canPaySelectedRequests ? 'primary' : 'warning'}
                        onClick={handlePaymentTerminalOpenFromRequest}
                        data-cy="add-payment"
                        className={classes.toolbarButton}
                        disabled={!selectedPaymentRequests || !selectedPaymentRequests.length || isUserReader}
                      >
                        {matchesXsDown ? <SvgIcon component={CreditCardIcon} /> : 'Pay'}
                      </Button>
                    )}

                    <Button
                      startIcon={matchesXsDown ? null : <InfoIcon />}
                      size={iconSize}
                      variant="text"
                      aria-label={'view details'}
                      disabled={!selectedPaymentRequests || selectedPaymentRequests.length !== 1}
                      color="primary"
                      onClick={() => {
                        if (selectedPaymentRequests && selectedPaymentRequests.length === 1) {
                          handlePaymentRequestView(selectedPaymentRequests[0]);
                        }
                      }}
                      data-cy="view-details"
                      className={classes.toolbarButton}
                    >
                      {matchesXsDown ? <InfoIcon /> : 'Details'}
                    </Button>

                    <Button
                      startIcon={matchesXsDown ? null : <MailIcon />}
                      size={iconSize}
                      variant="text"
                      aria-label="send"
                      color="primary"
                      disabled={
                        !canUpdatePaymentRequest ||
                        hasPreviewWithNoEmail ||
                        !canSendRequestCommunicationFromMenu ||
                        remindDisabled ||
                        isRemindPaymentRequestsInFlight
                      }
                      onClick={() => {
                        handlePaymentRequestsRemindFromMenu(selectedPaymentRequests);
                      }}
                      data-cy="remind"
                      className={classes.toolbarButton}
                    >
                      {matchesXsDown ? <MailIcon /> : 'Send'}
                    </Button>

                    <Button
                      startIcon={matchesXsDown ? null : <SvgIcon component={CloseIcon} />}
                      size={iconSize}
                      variant={'text'}
                      aria-label={'close'}
                      disabled={!(canUpdatePaymentRequest && tabValue === 1 && canCloseRequestFromMenu)}
                      color={'primary'}
                      onClick={() => {
                        if (selectedPaymentRequests && selectedPaymentRequests.length === 1) {
                          handlePaymentRequestClose(selectedPaymentRequests[0]);
                        }
                      }}
                      data-cy="close"
                      className={classes.toolbarButton}
                    >
                      {matchesXsDown ? <SvgIcon component={CloseIcon} /> : 'Close'}
                    </Button>
                    <Button
                      startIcon={matchesXsDown ? null : <SvgIcon component={ForwardToInbox} />}
                      size={iconSize}
                      disabled={!canForwardPaymentRequest || !selectedPaymentRequests?.length || selectedPaymentRequests?.length > 1}
                      onClick={openForwardDialog}
                      variant="text"
                      aria-label="forward"
                      data-cy="forward"
                      color="primary"
                      className={classes.toolbarButton}
                    >
                      {matchesXsDown ? <SvgIcon component={ForwardToInbox} /> : 'Forward'}
                    </Button>
                  </Grid>
                  <Grid
                    container
                    item
                    wrap="nowrap"
                    xs={12}
                    md={6}
                    lg={5}
                    xl={4}
                    justifyContent={matches ? 'flex-start' : 'flex-end'}
                    alignContent="start"
                    alignItems="start"
                  >
                    <Grid item maxWidth={340} flexGrow={1}>
                      <SearchBar
                        placeholderText={'Search by reference #, credit memo reference #, email or phone #'}
                        queryString={paymentRequestQueryString}
                        updateQueryString={updatePaymentRequestQueryString}
                        minimumCharacter={3}
                        searchError={searchError}
                        clearSearchError={clearPaymentRequestSearchError}
                        isSearchDisabled={tabValue !== 1}
                        isSpacesAllowed={false}
                        searchName={'payment-requests'}
                      />
                    </Grid>
                    <Grid item>
                      <PaymentRequestListFilter
                        totalCount={payRequestConnection?.totalCount}
                        filterStatusCount={paymentRequestFilterStatusCount}
                        filterPaymentRequestStatusList={paymentRequestFilterStatusList}
                        filterCustomer={paymentRequestFilterCustomerOption}
                        handleFilterStatusUpdate={handlePaymentRequestFilterStatusUpdate}
                        handleFilterCustomerUpdate={handlePaymentRequestFilterCustomerUpdate}
                        customersEnabled={!!tenantAccount?.settings?.features?.customers?.enabled}
                        hasCustomerOptionError={Boolean(customerOptionError)}
                      />
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <PaymentRequestListFilterChips
                      isLoadingPayments={isLoadingPaymentRequests}
                      filterStatusCount={paymentRequestFilterStatusCount}
                      filterPaymentStatusList={paymentRequestFilterStatusList}
                      filterCustomerOption={paymentRequestFilterCustomerOption}
                      removeAllPaymentsFilter={handleRemoveAllPaymentRequestsFilter}
                      removeStatusFilter={handleRemovePaymentRequestStatusFilter}
                      removeCustomerFilter={handleRemovePaymentRequestCustomerFilter}
                    />
                  </Grid>
                </Grid>
              </Toolbar>
              {payRequestConnection && (
                <PaymentRequestList
                  loadPage={loadPaymentRequestsPage}
                  handleViewPaymentRequest={handlePaymentRequestView}
                  handleSelectedRecordsChange={handleSelectedPaymentRequestsChange}
                  defaultCurrency={defaultCurrency}
                  paymentRequestConnection={payRequestConnection}
                  paymentRequests={paymentRequests}
                  direction={paymentRequestDirection}
                  field={paymentRequestField}
                  handleSort={handlePaymentRequestSort}
                  isLoadingPaymentRequests={isLoadingPaymentRequests}
                  gridApiRef={paymentRequestsGridApi}
                  isRemindFromMenuInFlight={isRemindPaymentRequestsInFlight}
                />
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
