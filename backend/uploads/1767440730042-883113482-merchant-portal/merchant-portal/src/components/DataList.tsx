import { makeStyles, createStyles } from '@mui/styles';
import { Box, CircularProgress, Typography, Theme } from '@mui/material';
import SkeletonGrid from './SkeletonGrid';
import { DataGridPro, DataGridProProps, GridOverlay } from '@mui/x-data-grid-pro';

interface DataListProps {
  gridOptions: DataGridProProps;
  isSkeletonHidden: boolean;
  cypressTag: string;
  hasCheckbox?: boolean;
  noDataText: string;
  hasQueryError?: boolean;
  sortingMode?: 'client' | 'server';
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    overlay: {
      '&.MuiDataGrid-overlay': {
        display: 'inline',
      },
    },
    noRowsOverlayText: {
      fontStyle: 'italic',
      lineHeight: 2,
      borderBottom: `1px solid ${theme.palette.uxGrey.focus}`,
      textAlign: 'center',
    },
    progressOverlay: {
      height: '100%',
      width: '100%',
      position: 'absolute',
      display: 'flex',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'black',
      opacity: 0.02,
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
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: theme.palette.uxGrey.hover,
        maxHeight: 60,
      },
      '& .MuiDataGrid-columnSeparator': {
        display: 'none !important',
      },
      '& .MuiDataGrid-columnHeader': {
        fontSize: 16,
      },
      '& .MuiDataGrid-cell': {
        fontSize: 16,
      },
      '& div.MuiDataGrid-columnHeaderTitleContainer': {
        padding: 0,
      },
      '& div.MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-checkboxInput': {
        display: 'none',
      },
      '& .MuiCircularProgress-root': {
        zIndex: 1,
      },
    },
    gridBoxContainer: {
      height: '100%',
    },
    gridWrap: {
      overflow: 'hidden',
      position: 'relative',
      flex: 1,
    },
    noRowsOverlayErrorText: {
      fontStyle: 'italic',
      lineHeight: 2,
      borderBottom: `1px solid ${theme.palette.uxGrey.focus}`,
      textAlign: 'center',
      color: theme.palette.error.main,
    },
  }),
);

export const DataList: React.FC<DataListProps> = props => {
  const { gridOptions, isSkeletonHidden, cypressTag, hasCheckbox = false, noDataText, hasQueryError, sortingMode = 'server' } = props;
  const { columns } = gridOptions;
  const classes = useStyles();

  const loadingOverlay = () => {
    return (
      <GridOverlay>
        <div className={classes.progressOverlay}></div>
        <CircularProgress aria-label={'progress spinner'} key={'customers-spinner'} size={42} />
      </GridOverlay>
    );
  };
  const noRowsOverlay = () => {
    if (hasQueryError) {
      return (
        <GridOverlay className={classes.overlay}>
          <Typography className={classes.noRowsOverlayErrorText} variant="body1">
            Unable to load data. Please try again later.
          </Typography>
        </GridOverlay>
      );
    }
    return (
      <GridOverlay className={classes.overlay}>
        <Typography className={classes.noRowsOverlayText} variant="body1">
          {noDataText}
        </Typography>
      </GridOverlay>
    );
  };

  return (
    <Box className={classes.gridWrap} data-cy={cypressTag}>
      <Box hidden={isSkeletonHidden}>
        <SkeletonGrid hasCheckbox={hasCheckbox} headers={columns} rowCount={10} />
      </Box>

      <Box className={classes.gridBoxContainer} hidden={!isSkeletonHidden}>
        <DataGridPro
          {...gridOptions}
          rowHeight={58}
          rowCount={0}
          paginationMode="server"
          pageSize={25}
          rowsPerPageOptions={[25]}
          hideFooterPagination
          hideFooter
          sortingMode={sortingMode}
          hideFooterSelectedRowCount
          className={classes.dataGrid}
          components={{
            // eslint-disable-next-line react/display-name,@typescript-eslint/naming-convention
            LoadingOverlay: loadingOverlay,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            NoRowsOverlay: noRowsOverlay,
          }}
        />
      </Box>
    </Box>
  );
};
