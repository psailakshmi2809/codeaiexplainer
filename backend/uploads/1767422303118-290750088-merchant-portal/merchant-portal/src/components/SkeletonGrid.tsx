import { Checkbox, TableCell, TableContainer, TableRow, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { Skeleton } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid-pro';
import { v4 as uuid4 } from 'uuid';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    skeletonWrap: {
      overflow: 'hidden',
      position: 'relative',
      height: 'calc(100vh - 210px)',
      minHeight: 'calc(100vh - 210px)',
      [theme.breakpoints.down('lg')]: {
        height: 'calc(100vh - 290px)',
        minHeight: 'calc(100vh - 290px)',
      },
      [theme.breakpoints.down('md')]: {
        height: 'calc(100vh - 310px)',
        minHeight: 'calc(100vh - 310px)',
      },
    },
    skeletonTableHeader: {
      borderTop: `1px solid ${theme.palette.uxGrey.focus}`,
      backgroundColor: theme.palette.uxGrey.hover,
      width: '100%',
      display: 'inline-table',
      '& .MuiTableCell-root .MuiButtonBase-root': {
        display: 'none',
      },
    },
    skeletonTableRow: {
      height: 58,
      width: '100%',
      display: 'inline-table',
    },
    tableCell: {
      padding: 8,
      fontSize: 16,
      wordWrap: 'break-word',
    },
    headerCell: {
      fontSize: 16,
      height: 54,
      wordWrap: 'break-word',
      fontWeight: 500,
    },
  }),
);

interface SkeletonGridPropTypes {
  hasCheckbox?: boolean;
  headers: GridColDef[];
  rowCount?: number;
}

const SkeletonGrid: React.FC<SkeletonGridPropTypes> = props => {
  const classes = useStyles();
  const { hasCheckbox, headers, rowCount } = props;
  const numberOfRows = rowCount || 10;
  const headersLength = headers.length;
  const getCells = (isHeader: boolean) => {
    const cells: JSX.Element[] = [];
    if (hasCheckbox) {
      cells.push(
        <TableCell width={'3%'} className={classes.tableCell} key={uuid4()}>
          <Checkbox disabled />
        </TableCell>,
      );
    }
    for (let i = 0; i < headersLength; i += 1) {
      const header = headers[i];
      if (!header.hide && (header.headerName || header.renderCell)) {
        cells.push(
          <TableCell
            key={uuid4()}
            width={`${Math.floor(100 / headersLength)}%`}
            className={isHeader ? classes.headerCell : classes.tableCell}
            align={header.align}
          >
            {isHeader && header.headerName}
            {!isHeader && <Skeleton style={{ float: header.align === 'right' ? 'right' : 'left' }} height="1.4em" width={'85%'} />}
          </TableCell>,
        );
      }
    }
    return cells;
  };

  const rows: JSX.Element[] = [
    <TableRow className={classes.skeletonTableHeader} key={uuid4()}>
      {getCells(true)}
    </TableRow>,
  ];
  const rowCells = getCells(false);
  for (let i = 1; i < numberOfRows + 1; i += 1) {
    rows.push(
      <TableRow className={classes.skeletonTableRow} key={uuid4()}>
        {rowCells}
      </TableRow>,
    );
  }
  return <TableContainer className={classes.skeletonWrap}>{rows}</TableContainer>;
};

export default SkeletonGrid;
