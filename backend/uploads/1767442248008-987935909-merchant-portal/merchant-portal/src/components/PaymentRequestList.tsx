import React, { useEffect, useState } from 'react';
import { Link, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import {
  PaymentRequestConnection,
  PaymentRequest,
  OrderDirection,
  Maybe,
  CommunicationType,
  PaymentRequestCommunicationStatus,
  PaymentRequestStatus,
  SubType,
} from '../gql-types.generated';
import { paymentStatusDisplay } from '../util/PaymentStatus';
import {
  DataGridProProps,
  GridApiRef,
  GridColDef,
  GridRenderCellParams,
  GridRowModel,
  GridRowParams,
  GridSelectionModel,
} from '@mui/x-data-grid-pro';
import { DataList } from './DataList';
import { DateTime } from 'luxon';
import CommunicationUnsentIcon from '../CommunicationUnsent.svg';
import LoadingMask from './LoadingMask';

const useStyles = makeStyles(() =>
  createStyles({
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
    ellipsisText: {
      maxWidth: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  }),
);

// Table for the payment requests
interface PaymentRequestListProps {
  defaultCurrency?: string | null;
  paymentRequestConnection: PaymentRequestConnection;
  paymentRequests: PaymentRequest[] | undefined;
  direction: OrderDirection;
  field: string;
  handleSort: (arrowDirection: OrderDirection, fieldName: string) => void;
  loadPage: (endEdge: string) => void;
  handleSelectedRecordsChange: (records: PaymentRequest[] | undefined) => void;
  handleViewPaymentRequest: (record: PaymentRequest | undefined) => void;
  isLoadingPaymentRequests: boolean;
  gridApiRef: GridApiRef;
  isRemindFromMenuInFlight: boolean;
}

const PaymentRequestList: React.FC<PaymentRequestListProps> = props => {
  const {
    defaultCurrency,
    paymentRequestConnection,
    paymentRequests,
    handleViewPaymentRequest,
    loadPage,
    handleSelectedRecordsChange,
    isLoadingPaymentRequests,
    gridApiRef,
    isRemindFromMenuInFlight,
  } = props;
  const classes = useStyles();

  useEffect(() => {
    if (!isLoadingPaymentRequests) {
      gridApiRef?.current?.setSelectionModel([]);
    }
  }, [isLoadingPaymentRequests]);

  const getPaymentRequestById = (id: string) => {
    const foundPaymentRequest = paymentRequests?.find(paymentRequest => paymentRequest?.id === id);
    // eslint-disable-next-line no-underscore-dangle
    return foundPaymentRequest;
  };
  // Create proper rows for the data grid from the payment request data.
  const getPaymentRequestRows = () => {
    return paymentRequests?.map((row: Maybe<PaymentRequest>) => {
      const node = row;
      if (!node) {
        return {} as GridRowModel;
      }
      const communications = node.communications?.filter(c => c?.subType !== SubType.Preview);
      let communication = communications && communications.length > 0 ? communications[0] : undefined;
      const contact =
        communication && communication.communicationType === CommunicationType.Email
          ? communication.email
          : communication?.phoneNumber;

      node.communications?.forEach(comm => {
        const aDate = DateTime.fromISO(communication?.requestTimestamp || new Date(0).toISOString());
        const bDate = DateTime.fromISO(comm?.requestTimestamp || new Date(0).toISOString());
        if (bDate > aDate && comm?.subType !== SubType.Preview) {
          communication = comm;
        }
      });

      // checking whether we have non sent and non preview emails
      const hasUnsentCommunication = communications?.filter(c => c?.status === PaymentRequestCommunicationStatus.Unsent).length > 0;
      const hasUnsentStatus =
        node?.status === PaymentRequestStatus.Unpaid ||
        node?.status === PaymentRequestStatus.PartiallyPaid ||
        node?.status === PaymentRequestStatus.Failed ||
        node?.status === PaymentRequestStatus.Canceled;
      // checking whether the unsent icon to show according to statuses and communication history
      const showUnsentIcon = hasUnsentCommunication && hasUnsentStatus;

      return {
        _raw: node,
        id: node.id,
        referenceNumber: node.referenceNumber?.trim(),
        statusRender: paymentStatusDisplay.find(item => {
          return item.name === node.status;
        })?.display,
        amount:
          typeof node.amount === 'number'
            ? new Intl.NumberFormat('en', {
                style: 'currency',
                currency: defaultCurrency || 'USD',
                currencyDisplay: 'symbol',
              }).format(node.amount / 100)
            : null,
        sentTo: node?.customer && node.customer?.name ? node.customer?.name || '' : contact,
        date:
          communication && communication?.sentTimestamp
            ? new Date(communication.sentTimestamp).toLocaleDateString()
            : new Date(node.createdAt).toLocaleDateString(),
        showUnsentIcon,
      } as GridRowModel;
    }) as GridRowModel[];
  };
  const [paymentRequestRows, setPaymentRequestRows] = useState<GridRowModel[]>(getPaymentRequestRows());
  const [loadingPage, setLoadingPage] = useState(false);

  useEffect(() => {
    setLoadingPage(false);
    setPaymentRequestRows(getPaymentRequestRows());
  }, [paymentRequests]);

  const handlePageLoad = () => {
    if (!paymentRequestConnection) {
      // There is not connection to use for retrieving the next page
      return;
    }
    // No more pages to load, no need to send the load request
    if (!paymentRequestConnection.pageInfo.hasNextPage) {
      return;
    }
    if (!paymentRequestConnection.pageInfo.endCursor) {
      return;
    }
    setLoadingPage(true);
    loadPage(paymentRequestConnection.pageInfo.endCursor);
  };

  // Column titles for mapping and sorting
  const paymentRequestColumns: GridColDef[] = [
    {
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Link
            underline={'hover'}
            href="#"
            className={classes.ellipsisText}
            onClick={(event: React.MouseEvent) => {
              // stopPropagation to stop click propagation through to the grid - so it does not toggle checkbox.
              event.stopPropagation();
              // eslint-disable-next-line no-underscore-dangle
              handleViewPaymentRequest(params?.row?._raw as PaymentRequest);
            }}
          >
            {params.value}
          </Link>
        );
      },
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'referenceNumber',
      sortable: false,
      headerName: 'Reference #',
      flex: 0.19,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'statusRender',
      sortable: false,
      headerName: 'Status',
      flex: 0.13,
      minWidth: 160,
    },
    {
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams) => {
        const { showUnsentIcon } = params?.row;
        return (
          <div className={classes.communicationContainer}>
            <Typography
              variant="inherit"
              className={`${classes.communicationText} ${showUnsentIcon ? classes.unsentMaxWidthText : undefined}`}
            >
              {params.value}
            </Typography>
            {showUnsentIcon && <img src={CommunicationUnsentIcon} alt="not sent" className={classes.communicationUnsentIcon} />}
          </div>
        );
      },
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'sentTo',
      sortable: false,
      headerName: 'Sent To',
      flex: 0.32,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'date',
      sortable: false,
      headerName: 'Last Requested',
      flex: 0.15,
      minWidth: 130,
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
      flex: 0.13,
      minWidth: 130,
    },
  ];

  const onSelectionModelChange = (selectionModel: GridSelectionModel) => {
    if (selectionModel.length > 0) {
      const selectedRecords: PaymentRequest[] = [];
      selectionModel.forEach(m => {
        const request = getPaymentRequestById(m as string);
        if (request) {
          selectedRecords.push(request);
        }
      });
      handleSelectedRecordsChange(selectedRecords.length > 0 ? selectedRecords : undefined);
    } else {
      handleSelectedRecordsChange(undefined);
    }
  };

  // eslint-disable-next-line no-underscore-dangle
  const onRowDoubleClick = (params: GridRowParams) => handleViewPaymentRequest(params?.row?._raw as PaymentRequest);

  const gridOptions: DataGridProProps = {
    apiRef: gridApiRef,
    columns: paymentRequestColumns,
    rows: paymentRequestRows,
    'aria-label': 'Payment Requests Table',
    loading: loadingPage,
    checkboxSelection: true,
    onRowsScrollEnd: handlePageLoad,
    onSelectionModelChange,
    onRowDoubleClick,
  };

  return (
    <>
      <LoadingMask loading={isRemindFromMenuInFlight} />
      <DataList
        gridOptions={gridOptions}
        hasCheckbox
        cypressTag="payment-request-table-body"
        isSkeletonHidden={!isLoadingPaymentRequests}
        noDataText="No payment request data to show."
      />
    </>
  );
};

export default PaymentRequestList;
