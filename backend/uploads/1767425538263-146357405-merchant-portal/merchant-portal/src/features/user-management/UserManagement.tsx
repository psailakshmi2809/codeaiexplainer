import { Box, Button, Dialog, alpha, IconButton, Paper, Theme, Toolbar, Tooltip, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataGridProProps, GridColDef, GridRenderCellParams, GridRowModel, GridSortModel } from '@mui/x-data-grid-pro';
import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { DataList } from '../../components/DataList';
import UserDeleteForm from '../../components/UserDeleteForm';
import UserForm from '../../components/UserForm';
import { Person, AppRole, MutationStatusCode, Maybe } from '../../gql-types.generated';
import { selectNetworkBusy, selectTenantId, selectViewerUser } from '../app/AppSlice';
import { deletePersonData, fetchUserList, upsertPersonData } from './UserManagementActions';
import {
  clearError,
  selectUserList,
  selectError,
  selectUpsertPersonStatus,
  selectDeletePersonStatus,
  captureUpsertPersonStatus,
  captureDeletePersonStatus,
} from './UserManagementSlice';
import { ApteanSSOProvider } from '../../util/ApteanSSOProvider';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      flex: 1,
      display: 'flex',
      flexFlow: 'column nowrap',
      height: '100%',
      minHeight: 350,
    },
    usersTable: {
      flexGrow: 1,
      display: 'flex',
    },
    toolbar: {
      borderBottomWidth: 1,
      borderBottomColor: alpha(theme.palette.common.black, 0.15),
      borderBottomStyle: 'solid',
      padding: theme.spacing(1.5, 2.5),
    },
    toolbarButton: {
      minWidth: 140,
      marginLeft: theme.spacing(1),
    },
    title: {
      flex: '1 1 100%',
    },
    tooltip: {
      fontSize: '10pt',
      textAlign: 'center',
      verticalAlign: 'middle',
    },
  }),
);

const UserManagement: FC = () => {
  const classes = useStyles();
  const [user, setUser] = useState<Person | null>();
  const [openModify, setOpenModify] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }]);
  const dispatch = useDispatch();
  const selectedTenantId = useSelector(selectTenantId);
  const userError = useSelector(selectError);
  const networkBusy = useSelector(selectNetworkBusy);
  const viewerUser = useSelector(selectViewerUser);
  const upsertPersonStatus = useSelector(selectUpsertPersonStatus);
  const deletePersonStatus = useSelector(selectDeletePersonStatus);

  useEffect(() => {
    // Fetch the user list on component render.
    dispatch(fetchUserList());
  }, []);

  useEffect(() => {
    // Fetch the user list when the selected tenant id changes.
    dispatch(fetchUserList());
  }, [selectedTenantId]);

  useEffect(() => {
    // Fetch the user list when a successful mutation occurs.
    if (upsertPersonStatus?.code === MutationStatusCode.Success) {
      // Fetch the user list
      dispatch(fetchUserList());
      // Remove upsert status.
      dispatch(captureUpsertPersonStatus());
    }
    if (deletePersonStatus?.code === MutationStatusCode.Success) {
      // Fetch the user list
      dispatch(fetchUserList());
      // Remove delete status.
      dispatch(captureDeletePersonStatus());
    }
  }, [upsertPersonStatus?.code, deletePersonStatus?.code]);

  const canEdit = viewerUser?.relationship?.role === AppRole.Admin || viewerUser?.relationship?.role === AppRole.Editor;
  const canDeleteUser = (user: Person) => {
    return !user.relationship?.primaryAccountHolder && viewerUser?.id !== user.id;
  };
  const canEditUser = (user: Person) => {
    return (
      (user?.relationship?.role === AppRole.Admin && viewerUser?.relationship?.role === AppRole.Admin) ||
      user?.relationship?.role !== AppRole.Admin
    );
  };
  const rows = useSelector(selectUserList);

  const hasOneAdmin = rows?.filter(row => row.relationship?.role === AppRole.Admin)?.length === 1;

  const getUserRows = () => {
    return rows?.map((row: Maybe<Person>) => {
      const node = row;
      if (!node) {
        return {} as GridRowModel;
      }
      return {
        _raw: node,
        id: node.id,
        name: `${node.firstName} ${node.lastName}`,
        email: node.email,
        accountType: Object.keys(AppRole).filter(role => AppRole[role as keyof typeof AppRole] === node.relationship?.role)[0],
      } as GridRowModel;
    }) as GridRowModel[];
  };
  const onEditUserClick = (row: Person) => {
    // Handle user modify.
    if (row) {
      setUser(row);
    }
    // Clear error on close.
    dispatch(clearError());
    setOpenModify(true);
  };
  const onAddUserClick = () => {
    // Handle add.
    setUser({} as Person);
    // Clear error on close.
    dispatch(clearError());
    setOpenModify(true);
  };
  const onDeleteUserClick = (row: Person) => {
    // Clear error on close.
    dispatch(clearError());
    // Handle delete
    if (row && canDeleteUser(row)) {
      setUser(row);
      setOpenDelete(true);
    }
  };

  const submitDeleteForm = (id: string | undefined) => {
    // Clear any error prior to submit.
    dispatch(clearError());
    // Dispatch gql and await to close.
    // How to indicate this is a delete? Change status to deleted?
    if (id) dispatch(deletePersonData(id));
  };

  const submitUpsertForm = (firstName: string, lastName: string, email: string, role: AppRole, id?: string) => {
    // Clear any error prior to submit.
    dispatch(clearError());
    // Dispatch gql and await to close.
    dispatch(upsertPersonData(firstName, lastName, email, role, id));
  };

  const handleUserFormClose = () => {
    setOpenModify(false);
    // Clear error on close.
    dispatch(clearError());
    dispatch(fetchUserList());
  };

  const handleUserDeleteFormClose = () => {
    setOpenDelete(false);
    // Clear error on close.
    dispatch(clearError());
  };

  // Column titles for mapping and sorting
  const userColumns: GridColDef[] = [
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'name',
      sortable: true,
      headerName: 'Name',
      flex: 0.25,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'email',
      sortable: true,
      headerName: 'Email',
      flex: 0.4,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      field: 'accountType',
      sortable: true,
      headerName: 'Account Type',
      flex: 0.2,
      minWidth: 130,
    },
    {
      resizable: false,
      disableReorder: true,
      disableColumnMenu: true,
      sortable: false,
      field: 'action',
      headerName: '',
      headerAlign: 'right',
      align: 'right',
      flex: 0.15,
      minWidth: 120,
      // eslint-disable-next-line react/display-name
      renderCell: (params: GridRenderCellParams) => {
        // eslint-disable-next-line no-underscore-dangle
        const row = params.row._raw;
        return (
          <>
            {canEdit && canEditUser(row) && (
              <Tooltip
                title={<span className={classes.tooltip}>Edit</span>}
                PopperProps={{
                  popperOptions: {
                    placement: 'right-end',
                  },
                }}
              >
                <IconButton aria-label="edit" onClick={() => onEditUserClick(row)} data-cy="edit-row" size="large">
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && canEditUser(row) && canDeleteUser(row) && (
              <Tooltip
                title={<span className={classes.tooltip}>Delete</span>}
                PopperProps={{
                  popperOptions: {
                    placement: 'right-end',
                  },
                }}
              >
                <IconButton aria-label="delete" onClick={() => onDeleteUserClick(row)} data-cy="delete-row" size="large">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </>
        );
      },
    },
  ];

  const gridOptions: DataGridProProps = {
    rows: getUserRows(),
    'aria-label': 'Users table',
    columns: userColumns,
    sortingOrder: ['desc', 'asc'],
    sortModel,
    onSortModelChange: setSortModel,
  };

  return (
    <Paper className={classes.paper} role="region" aria-label="Manage Users">
      <Helmet>
        <meta name="ai:viewId" content="user-management"></meta>
        <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - User Management"></meta>
        <title>Aptean Pay Merchant Portal - User Management</title>
      </Helmet>
      <Dialog
        aria-label={'modify user dialog'}
        maxWidth={false}
        open={openModify}
        onClose={handleUserFormClose}
        disableScrollLock
        disableEscapeKeyDown={networkBusy}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <UserForm
          close={handleUserFormClose}
          user={user}
          submit={submitUpsertForm}
          userError={userError}
          networkBusy={networkBusy}
          viewerUser={viewerUser}
          hasOneAdmin={hasOneAdmin}
        />
      </Dialog>
      <Dialog
        aria-label={'delete user dialog'}
        maxWidth={false}
        open={openDelete}
        onClose={handleUserDeleteFormClose}
        disableScrollLock
        disableEscapeKeyDown={networkBusy}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <UserDeleteForm
          close={handleUserDeleteFormClose}
          user={user}
          submit={submitDeleteForm}
          userError={userError}
          networkBusy={networkBusy}
        />
      </Dialog>
      <Toolbar className={classes.toolbar} variant="regular">
        <Box className={classes.title} data-cy="manage-users-header">
          <Typography variant="title">Manage Users</Typography>
        </Box>
        {canEdit && ApteanSSOProvider.userPermissions().canAddUsers && (
          <Button
            color="primary"
            variant="outlined"
            aria-label="add new user"
            className={classes.toolbarButton}
            onClick={onAddUserClick}
            data-cy="add-new-user"
          >
            + NEW USER
          </Button>
        )}
      </Toolbar>
      <Box className={classes.usersTable} data-cy="users-table" role="region" aria-label="All Users">
        <DataList
          gridOptions={gridOptions}
          isSkeletonHidden={true}
          cypressTag="user-table-body"
          noDataText="No user data to show."
          sortingMode="client"
        />
      </Box>
    </Paper>
  );
};

export default UserManagement;
