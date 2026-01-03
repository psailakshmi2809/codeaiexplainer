import React, { useEffect, useState } from 'react';
import { Link } from '@mui/material';
import { PaymentConnection, Payment, OrderDirection, Maybe, PaymentMethod } from '../gql-types.generated';
import {
  DataGridProProps,
  GridApiRef,
  GridColDef,
  GridRenderCellParams,
  GridRowModel,
  GridRowParams,
  GridSelectionModel,
} from '@mui/x-data-grid-pro';
import { paymentStatusDisplay } from '../util/PaymentStatus';
import { PaymentStatusForDisplay } from '../util/PaymentStatusForDisplay';
import { DataList } from './DataList';

// Table for the payments
interface PaymentListProps {
  defaultCurrency?: string | null;
  paymentConnection: PaymentConnection;
  payments: Payment[] | undefined;
  direction: OrderDirection;
  field: string;
  handleSort: (arrowDirection: OrderDirection, fieldName: string) => void;
  loadPage: (endEdge: string) => void;
  selectedRecord?: Payment;
  setSelectedRecord: (record: Payment | undefined) => void;
  handleViewPayment: (record: Payment | undefined) => void;
  isLoadingPayments: boolean;
  isCreditMemoEnabled: boolean;
  isCustomerEnabled: boolean;
  gridApiRef: GridApiRef;
  isConvenienceFeeEnabled: boolean;
}

const PaymentList: React.FC<PaymentListProps> = props => {
  const {
    defaultCurrency,
    paymentConnection,
    payments,
    handleViewPayment,
    loadPage,
    selectedRecord,
    setSelectedRecord,
    isLoadingPayments,
    isCreditMemoEnabled,
    isCustomerEnabled,
    gridApiRef,
    isConvenienceFeeEnabled,
  } = props;

  const hasCreditApplied = !!payments?.find(payment => {
    return !!payment.creditAmount;
  });

  const getPaymentMethod = (isCreditPayment: boolean, paymentMethod?: PaymentMethod | null) => {
    if (!isCreditPayment && paymentMethod?.creditCard) {
      return `${paymentMethod.creditCard.cardBrand?.substring(0, 1)}${paymentMethod.creditCard.cardBrand
        ?.substring(1)
        .toLowerCase()} ${paymentMethod.creditCard.lastFour}`;
    }

    if (!isCreditPayment && paymentMethod?.paymentBank) {
      return `Bank ${paymentMethod.paymentBank.lastFour}`;
    }

    return 'None';
  };

  const getPaymentRows = () => {
    return payments?.map((row: Maybe<Payment>) => {
      const node = row;
      if (!node) {
        return {} as GridRowModel;
      }
      const isSelected = node.id === selectedRecord?.id;
      const isCreditPayment = (node?.creditAmount && node.creditAmount > 0 && (node.amount === 0 || !node?.amount)) as boolean;
      const paymentAmount = node?.amountBeforeFees || node?.amount || 0;
      const convenienceFee = node?.convenienceFee || 0;
      return {
        _raw: node,
        id: node.id,
        isSelected,
        paymentId: node.id?.slice(-9),
        customerName: node?.customer?.name || '',
        paymentMethod: getPaymentMethod(isCreditPayment, node?.paymentMethod),
        creditAmount: new Intl.NumberFormat('en', {
          style: 'currency',
          currency: node?.currency || defaultCurrency || 'USD',
          currencyDisplay: 'symbol',
        }).format((node.creditAmount || 0) / 100),
        paymentMethodAmount: new Intl.NumberFormat('en', {
          style: 'currency',
          currency: node?.currency || defaultCurrency || 'USD',
          currencyDisplay: 'symbol',
        }).format(paymentAmount / 100),
        convenienceFeeAmount: new Intl.NumberFormat('en', {
          style: 'currency',
          currency: node?.currency || defaultCurrency || 'USD',
          currencyDisplay: 'symbol',
        }).format(convenienceFee / 100),
        totalAmount: new Intl.NumberFormat('en', {
          style: 'currency',
          currency: node?.currency || defaultCurrency || 'USD',
          currencyDisplay: 'symbol',
        }).format(((node.amount || 0) + (node.creditAmount || 0)) / 100),
        customerPoNumber: node?.customerPONumber || '',
        invoiceNumber: node?.invoiceNumber || '',
        orderNumber: node?.orderNumber || '',
        description: node?.description || '',
        statusRender: PaymentStatusForDisplay(
          paymentStatusDisplay.find(item => {
            return item.name === node.status;
          })?.display,
          node.amountBeforeFees || node.amount || 0,
          node.refunds,
          node.createdAt,
          node.immediateCapture,
          node.pendingReasonCode,
        ),
        date:
          (node.completedTimestamp && new Date(node.completedTimestamp).toLocaleDateString()) ||
          (node.createdAt && new Date(node.createdAt).toLocaleDateString()) ||
          '- -',
      } as GridRowModel;
    }) as GridRowModel[];
  };

  const getPaymentById = (id: string) => {
    const foundPayment = payments?.find(payment => payment?.id === id);
    // eslint-disable-next-line no-underscore-dangle
    return foundPayment;
  };
  const [paymentRows, setPaymentRows] = useState<GridRowModel[]>(getPaymentRows());
  const [loadingPage, setLoadingPage] = useState(false);

  useEffect(() => {
    setLoadingPage(false);
    setPaymentRows(getPaymentRows());
  }, [payments]);

  const handlePageLoad = () => {
    if (!paymentConnection) {
      // There is not connection to use for retrieving the next page
      return;
    }
    // No more pages to load, no need to send the load request
    if (!paymentConnection.pageInfo.hasNextPage) {
      return;
    }
    if (!paymentConnection.pageInfo.endCursor) {
      return;
    }
    setLoadingPage(true);
    loadPage(paymentConnection.pageInfo.endCursor);
  };

  const paymentColumns: GridColDef[] = [
    {
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Link
            underline={'hover'}
            href="#"
            onClick={(event: React.MouseEvent) => {
              // stopPropagation to stop click propagation through to the grid - so it does not toggle checkbox.
              event.stopPropagation();
              // eslint-disable-next-line no-underscore-dangle
              handleViewPayment(params?.row?._raw as Payment);
            }}
          >
            ***{params.value}
          </Link>
        );
      },
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'paymentId',
      sortable: false,
      headerName: 'Payment ID',
      flex: 0.16,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'statusRender',
      sortable: false,
      headerName: 'Status',
      flex: 0.12,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'paymentMethod',
      sortable: false,
      headerName: 'Payment Method',
      flex: 0.12,
      minWidth: 160,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'customerName',
      hide: !isCustomerEnabled,
      sortable: false,
      headerName: 'Customer Name',
      flex: 0.12,
      minWidth: 160,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'date',
      sortable: false,
      headerName: 'Last Updated',
      flex: 0.1,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'creditAmount',
      sortable: false,
      hide: !isCreditMemoEnabled || !hasCreditApplied,
      headerName: 'Credit Applied',
      headerAlign: 'right',
      align: 'right',
      flex: 0.12,
      minWidth: 140,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'paymentMethodAmount',
      sortable: false,
      hide: !(isCreditMemoEnabled || isConvenienceFeeEnabled),
      headerName: 'Paid',
      headerAlign: 'right',
      align: 'right',
      flex: 0.12,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'convenienceFeeAmount',
      sortable: false,
      hide: !isConvenienceFeeEnabled,
      headerName: 'Fees',
      headerAlign: 'right',
      align: 'right',
      flex: 0.1,
      minWidth: 120,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'totalAmount',
      sortable: false,
      headerName: 'Total',
      headerAlign: 'right',
      align: 'right',
      flex: 0.12,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'customerPoNumber',
      sortable: false,
      headerName: 'Customer PO Number',
      align: 'left',
      flex: 0.12,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'invoiceNumber',
      sortable: false,
      headerName: 'Invoice Number',
      align: 'left',
      flex: 0.12,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'orderNumber',
      sortable: false,
      headerName: 'Order Number',
      align: 'left',
      flex: 0.12,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'description',
      sortable: false,
      headerName: 'Description',
      align: 'left',
      flex: 0.12,
      minWidth: 130,
    },
  ];

  // eslint-disable-next-line no-underscore-dangle
  const onRowDoubleClick = (params: GridRowParams) => handleViewPayment(params?.row?._raw as Payment);

  const onSelectionModelChange = (selectionModel: GridSelectionModel) => {
    // Enforce single selection.
    if (selectionModel.length > 2) {
      // eslint-disable-next-line no-param-reassign
      selectionModel.length = 0;
    } else if (selectionModel.length > 1) {
      // Remove previous selection.
      selectionModel.shift();
    }
    if (selectionModel.length === 1) {
      setSelectedRecord(getPaymentById(selectionModel[0] as string));
    } else {
      setSelectedRecord(undefined);
    }
  };

  const gridOptions: DataGridProProps = {
    apiRef: gridApiRef,
    columns: paymentColumns,
    rows: paymentRows,
    loading: loadingPage,
    onRowsScrollEnd: handlePageLoad,
    'aria-label': 'Payments Table',
    onRowDoubleClick,
    onSelectionModelChange,
    checkboxSelection: true,
  };

  return (
    <DataList
      gridOptions={gridOptions}
      isSkeletonHidden={!isLoadingPayments}
      cypressTag="payments-table-body"
      hasCheckbox
      noDataText="No payment data to show."
    />
  );
};

export default PaymentList;
