import { Grid, Theme, useMediaQuery, Drawer, IconButton, useTheme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import NavigationList from './NavigationList';
import { PayoutReport, TenantAccount } from '../gql-types.generated';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerPaper: {
      zIndex: 0,
    },
    closeIcon: {
      position: 'fixed',
      color: '#ffffff',
      marginLeft: '310px',
      marginTop: theme.spacing(3),
    },
    iconSize: {
      fontSize: '1.8em',
    },
    mainGrid: {
      paddingTop: 64,
      width: 310,
    },
  }),
);

interface TenantMenuProps {
  isMenuOpen: boolean;
  handleMenuClose: () => void;
  tenantAccount?: TenantAccount;
  statementUrl?: string;
  statementUrlError?: Error;
  isFetchingStatementUrl: boolean;
  report?: PayoutReport;
  reportError?: Error;
  isFetchingPayoutUrl: boolean;
  showStatements: boolean;
  showPayoutReports: boolean;
}
const TenantMenu: React.FC<TenantMenuProps> = props => {
  const {
    isMenuOpen,
    handleMenuClose,
    statementUrl,
    statementUrlError,
    isFetchingStatementUrl,
    report,
    reportError,
    isFetchingPayoutUrl,
    tenantAccount,
    showStatements,
    showPayoutReports,
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Drawer
      open={isMenuOpen}
      variant={matchesMdDown ? 'temporary' : 'persistent'}
      anchor="left"
      classes={{
        paper: matchesMdDown ? '' : classes.drawerPaper,
      }}
      data-cy="tenant-menu"
      id="tenant-menu"
    >
      <Grid className={classes.mainGrid}>
        {matchesMdDown && isMenuOpen && (
          <IconButton className={classes.closeIcon} onClick={handleMenuClose} data-cy="settings-menu-close" size="large">
            <CloseIcon className={classes.iconSize} />
          </IconButton>
        )}
        <Grid container>
          <NavigationList
            tenantAccount={tenantAccount}
            statementUrl={statementUrl}
            statementUrlError={statementUrlError}
            report={report}
            isFetchingStatementUrl={isFetchingStatementUrl}
            isFetchingPayoutUrl={isFetchingPayoutUrl}
            reportError={reportError}
            showStatements={showStatements}
            showPayoutReports={showPayoutReports}
          />
        </Grid>
      </Grid>
    </Drawer>
  );
};

export default TenantMenu;
