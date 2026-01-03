import React, { useState } from 'react';
import { TransactionStatement } from '../gql-types.generated';
import { Divider, ListItem, ListItemText, Collapse, Theme } from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';
import TransactionReportDownloadOptions from './TransactionReportDownloadOptions';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    monthItem: {
      backgroundColor: theme.palette.uxGrey.hover,
      borderColor: theme.palette.uxGrey.border,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderTopWidth: 0,
      borderBottomWidth: 0,
      borderStyle: 'solid',
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  }),
);

interface TransactionReportMonthProps {
  statement: TransactionStatement;
  month: string;
  handleStatementDownload: (statementName: string) => void;
  statementName: string;
  statementUrl?: string;
  clearStatementAccess: () => void;
}

const TransactionReportMonth: React.FC<TransactionReportMonthProps> = (props: TransactionReportMonthProps): JSX.Element | null => {
  const { statement, month, handleStatementDownload, statementName, statementUrl, clearStatementAccess } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const classes = useStyles();

  return (
    <>
      <Divider key={`${statement.endTime}${'-divider'}`} />
      <ListItem
        key={`${statement.endTime}`}
        className={`${classes.nested} ${classes.monthItem}`}
        button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <ListItemText primary={month} />
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse
        key={`${statement.endTime}${'-collapse'}`}
        in={isOpen}
        timeout="auto"
        unmountOnExit
        onExited={() => {
          setIsOpen(false);
        }}
      >
        <TransactionReportDownloadOptions
          availableFormats={statement.availableFormats}
          isRecentStatement={false}
          handleDownload={handleStatementDownload}
          statementName={statementName}
          statementUrl={statementUrl}
          handleCancel={clearStatementAccess}
        />
      </Collapse>
    </>
  );
};

export default TransactionReportMonth;
