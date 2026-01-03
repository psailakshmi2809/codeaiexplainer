import { Divider, Collapse, ListItemText, List, ListItem, Box, Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import React, { useState } from 'react';
import { allMonths } from '../util/Months';
import { TransactionStatement } from '../gql-types.generated';
import { DateTime } from 'luxon';
import TransactionReportMonth from './TransactionReportMonth';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    yearItem: {
      borderColor: theme.palette.uxGrey.focus,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderTopWidth: 0,
      borderBottomWidth: 0,
      borderStyle: 'solid',
    },
  }),
);
interface TransactionReportYearsProps {
  statements?: TransactionStatement[] | null;
  handleStatementDownload: (statementName: string) => void;
  statementUrl?: string;
  clearStatementAccess: () => void;
}

const TransactionReportYears: React.FC<TransactionReportYearsProps> = props => {
  const classes = useStyles();
  const { statements, handleStatementDownload, statementUrl, clearStatementAccess } = props;
  const currentYear = new Date().getFullYear(); // TODO: This may need to be queried to find the oldest transaction, and work up to current year.
  // Calc initial states by the amount of years to use. Currently hardcoded.
  const [firstYearOpen, setFirstYearOpen] = useState(false);
  const [secondYearOpen, setSecondYearOpen] = useState(false);
  const [thirdYearOpen, setThirdYearOpen] = useState(false);
  const [fourthYearOpen, setFourthYearOpen] = useState(false);
  const [fifthYearOpen, setFifthYearOpen] = useState(false);
  const [sixthYearOpen, setSixthYearOpen] = useState(false);
  const [seventhYearOpen, setSeventhYearOpen] = useState(false);
  const openStates = {
    [currentYear]: {
      state: firstYearOpen,
      set: setFirstYearOpen,
    },
    [currentYear - 1]: {
      state: secondYearOpen,
      set: setSecondYearOpen,
    },
    [currentYear - 2]: {
      state: thirdYearOpen,
      set: setThirdYearOpen,
    },
    [currentYear - 3]: {
      state: fourthYearOpen,
      set: setFourthYearOpen,
    },
    [currentYear - 4]: {
      state: fifthYearOpen,
      set: setFifthYearOpen,
    },
    [currentYear - 5]: {
      state: sixthYearOpen,
      set: setSixthYearOpen,
    },
    [currentYear - 6]: {
      state: seventhYearOpen,
      set: setSeventhYearOpen,
    },
  };
  const getMonths = (year: number, statements?: TransactionStatement[] | null) => {
    const monthItems = [];
    if (statements) {
      for (let i = 0; i < statements?.length; i += 1) {
        const currentDate = statements ? DateTime.fromISO(statements[i].endTime).toUTC() : null;
        if (currentDate) {
          const currentMonth = currentDate.month;
          monthItems.push(
            <TransactionReportMonth
              statement={statements[i]}
              month={allMonths[currentMonth - 1].label}
              statementName={`statement-${year}-${currentMonth < 10 ? '0' : ''}${currentMonth}`}
              statementUrl={statementUrl}
              handleStatementDownload={handleStatementDownload}
              clearStatementAccess={clearStatementAccess}
            />,
          );
        }
      }
    }
    return monthItems;
  };
  const getSpecificYearStatements = (
    statementsYear: number,
    tenantStatements?: TransactionStatement[] | null,
  ): TransactionStatement[] => {
    //getting the statements for a specific year
    const specificYearStatements = tenantStatements?.filter((statement: TransactionStatement) => {
      const statementYear = DateTime.fromISO(statement.endTime).toUTC().year;
      return statementYear === statementsYear;
    });

    //sorting the statements order
    specificYearStatements?.sort((a: TransactionStatement, b: TransactionStatement) => {
      const aDate = DateTime.fromISO(a.endTime);
      const bDate = DateTime.fromISO(b.endTime);
      return aDate > bDate ? -1 : 1;
    });
    return specificYearStatements || [];
  };
  const getYears = (startYear: number, endYear: number) => {
    const years = [];
    for (let year = endYear; year >= startYear; year -= 1) {
      const monthStatements = getSpecificYearStatements(year, statements);
      if (monthStatements.length) {
        years.push(
          <>
            <Divider key={`${year}${'-divider'}`} />
            <ListItem
              key={year}
              button
              className={classes.yearItem}
              onClick={() => {
                openStates[year].set(!openStates[year].state);
              }}
            >
              <ListItemText primary={year} />
              {openStates[year].state ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse key={`${year}${'-collapse'}`} in={openStates[year].state} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {getMonths(year, monthStatements)}
              </List>
            </Collapse>
          </>,
        );
      }
    }
    return years;
  };
  return (
    <Box>
      <List data-cy="year-list">
        {getYears(currentYear - 6, currentYear)}
        <Divider key={'end-divider'} />
      </List>
    </Box>
  );
};

export default TransactionReportYears;
