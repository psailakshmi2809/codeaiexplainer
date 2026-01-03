import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles, createStyles } from '@mui/styles';
import { Theme, Typography, Paper, Divider, Grid, Button, IconButton } from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { fetchCustomers, upsertCustomer } from './CustomerManagementActions';
import {
  captureCustomerSearch,
  clearUpsertCustomerError,
  clearUpsertCustomerStatus,
  selectCustomerConnection,
  selectCustomerQueryHasErrors,
  selectCustomers,
  selectCustomerSearch,
  selectIsLoadingCustomers,
  selectUpsertCustomerError,
  selectUpsertCustomerHasDuplicateEmailsError,
  selectUpsertCustomerStatus,
  selectUpsertInFlight,
} from './CustomerManagementSlice';
import {
  AppRole,
  Customer,
  CustomerOrderField,
  CustomerRole,
  Maybe,
  MutationStatusCode,
  OrderDirection,
  UpsertCustomerInput,
} from '../../gql-types.generated';
import {
  GridRowModel,
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridSortDirection,
  DataGridProProps,
} from '@mui/x-data-grid-pro';
import { CustomerDialog } from '../../components/CustomerDialog';
import { DataList } from '../../components/DataList';
import { selectConvenienceFeesFeatureFlag, selectTenantId, selectViewerUser } from '../app/AppSlice';
import SearchBar from '../../components/SearchBar';
import theme from '../../Theme';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexFlow: 'column nowrap',
      flex: 1,
      height: '100%',
      minHeight: 350,
    },
    headingSection: {
      padding: theme.spacing(1.5, 2.5),
    },
    addCustomerButton: {
      [theme.breakpoints.down(618)]: {
        marginTop: theme.spacing(1),
      },
    },
    editButton: {
      padding: theme.spacing(1),
      minWidth: 24,
      borderRadius: '50%',
    },
    searchBarContainer: {
      paddingRight: '10px',
      maxWidth: '395px',
      [theme.breakpoints.down(618)]: {
        maxWidth: '100%',
      },
    },
    secondPartHeaderContainer: {
      maxWidth: '580px',
      justifyContent: 'flex-end',
      [theme.breakpoints.between(618, 1003)]: {
        maxWidth: 'unset',
        justifyContent: 'space-between',
      },
    },
  }),
);

export const CustomerManagement: React.FC = () => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const isLoadingCustomers = useSelector(selectIsLoadingCustomers);
  const customerConnection = useSelector(selectCustomerConnection);
  const customerData = useSelector(selectCustomers);
  const requestInProgress = useSelector(selectUpsertInFlight);
  const upsertCustomerStatus = useSelector(selectUpsertCustomerStatus);
  const upsertCustomerErrors = useSelector(selectUpsertCustomerError);
  const customerQueryString = useSelector(selectCustomerSearch);
  const tenantId = useSelector(selectTenantId);
  const convenienceFeesEnabled = useSelector(selectConvenienceFeesFeatureFlag);
  const hasCustomerQueryError = useSelector(selectCustomerQueryHasErrors);
  const hasDuplicateEmailsError = useSelector(selectUpsertCustomerHasDuplicateEmailsError);
  const viewerUser = useSelector(selectViewerUser);
  const userRole = viewerUser?.relationship?.role;
  const canAddOrEditCustomer = userRole === AppRole.Admin || userRole === AppRole.Editor;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [direction, setDirection] = useState<OrderDirection>(OrderDirection.Asc);
  const [field, setField] = useState<CustomerOrderField>(CustomerOrderField.CustomerName);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'customerName', sort: direction.toLowerCase() as GridSortDirection },
  ]);

  useEffect(() => {
    return () => {
      dispatch(captureCustomerSearch(undefined));
    };
  }, []);

  useEffect(() => {
    dispatch(
      fetchCustomers({
        first: 25,
        orderBy: { direction, field },
        queryString: customerQueryString,
      }),
    );
  }, [tenantId, sortModel, customerQueryString]);

  useEffect(() => {
    if (upsertCustomerStatus?.code === MutationStatusCode.Success) {
      dispatch(
        fetchCustomers({
          first: 25,
          orderBy: { direction, field },
          queryString: customerQueryString,
        }),
      );
    }
  }, [upsertCustomerStatus]);

  const loadMoreCustomers = () => {
    if (!customerConnection) return;

    if (!customerConnection.pageInfo.hasNextPage) return;

    if (!customerConnection.pageInfo.endCursor) return;

    dispatch(
      fetchCustomers({
        first: 25,
        orderBy: { direction, field },
        after: customerConnection.pageInfo.endCursor,
        queryString: customerQueryString,
      }),
    );
  };

  const updateCustomerQueryString = (queryString?: string) => {
    dispatch(captureCustomerSearch(queryString));
  };

  const onSortModelChange = (model: GridSortModel): void => {
    if (model.length === 1 && model[0]?.sort) {
      // Only column allowed to sort is customerName which goes by the customerName field.
      setDirection(model[0].sort === 'asc' ? OrderDirection.Asc : OrderDirection.Desc);
      setField(CustomerOrderField.CustomerName);
    }
    setSortModel(model);
  };

  const clearError = () => {
    dispatch(clearUpsertCustomerError());
  };

  const saveCustomer = (options: UpsertCustomerInput) => {
    clearError();
    dispatch(clearUpsertCustomerStatus());
    dispatch(upsertCustomer(options));
  };

  const openDialog = (newCustomer?: boolean) => {
    if (newCustomer && selectedCustomer) {
      setSelectedCustomer(null);
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const getCustomerRows = () => {
    return customerData?.map((row: Maybe<Customer>) => {
      const node = row;
      if (!node) {
        return {} as GridRowModel;
      }
      return {
        _raw: node,
        id: node.id,
        customerName: node.name,
        customerNumber: node.customerNumber,
        adminUsers: node.customerUsers
          ?.filter(e => e.role === CustomerRole.CustomerAdmin)
          .map(e => e.email?.toLowerCase())
          .join(', '),
        editButton: node,
      } as GridRowModel;
    }) as GridRowModel[];
  };

  // Column titles for mapping and sorting
  const customerColumns: GridColDef[] = [
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'customerName',
      sortable: true,
      headerName: 'Customer Name',
      flex: 0.25,
      minWidth: 200,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'customerNumber',
      sortable: false,
      headerName: 'Customer Number',
      flex: 0.25,
      minWidth: 200,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'adminUsers',
      sortable: false,
      headerName: 'Admin Users',
      flex: 1,
      minWidth: 350,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'editButton',
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      headerName: '',
      flex: 0.1,
      minWidth: 80,
      hide: !canAddOrEditCustomer,
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams<Maybe<Customer>>) => (
        <IconButton
          aria-label="Edit Customer"
          onClick={() => {
            if (params.value) {
              setSelectedCustomer(params.value);
              openDialog();
            }
          }}
          size="large"
        >
          <Edit htmlColor={theme.palette.uxGrey.main} />
        </IconButton>
      ),
    },
  ];

  const gridOptions: DataGridProProps = {
    rows: hasCustomerQueryError ? ([] as GridRowModel[]) : getCustomerRows(),
    'aria-label': 'Customers Table',
    columns: customerColumns,
    sortingOrder: ['asc', 'desc'],
    sortingMode: 'server',
    onSortModelChange,
    sortModel,
    onRowsScrollEnd: hasCustomerQueryError ? undefined : loadMoreCustomers,
  };

  return (
    <Paper className={classes.root} role="region" aria-label="Manage Customers">
      <Helmet>
        <meta name="ai:viewId" content="customer-managements"></meta>
        <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Customer Management"></meta>
        <title>Aptean Pay Merchant Portal - Customer Management</title>
      </Helmet>
      <CustomerDialog
        open={isDialogOpen}
        customer={selectedCustomer}
        closeDialog={closeDialog}
        onSave={saveCustomer}
        requestInProgress={!!requestInProgress}
        requestSucceeded={upsertCustomerStatus?.code === MutationStatusCode.Success}
        error={upsertCustomerErrors}
        clearError={clearError}
        hasDuplicateEmailsError={hasDuplicateEmailsError}
        convenienceFeesEnabled={!!convenienceFeesEnabled}
        canModifyConvenienceFees={canAddOrEditCustomer}
      />
      <Grid className={classes.headingSection} container direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="title">Manage Customers</Typography>
        <Grid item container xs={12} className={classes.secondPartHeaderContainer} alignItems="center">
          <Grid container item className={classes.searchBarContainer}>
            <SearchBar
              placeholderText={'Search for Customer Name or Number'}
              queryString={customerQueryString}
              updateQueryString={updateCustomerQueryString}
              minimumCharacter={1}
              isSpacesAllowed={true}
              searchName={'customers'}
            />
          </Grid>
          {canAddOrEditCustomer && (
            <Grid item>
              <Button
                startIcon={<Add />}
                variant="outlined"
                color="primary"
                onClick={() => {
                  openDialog(true);
                }}
                className={classes.addCustomerButton}
              >
                New Customer
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Divider />
      <DataList
        gridOptions={gridOptions}
        isSkeletonHidden={!isLoadingCustomers}
        cypressTag="customer-table-body"
        noDataText="No customer data to show."
        hasQueryError={hasCustomerQueryError}
      />
    </Paper>
  );
};
