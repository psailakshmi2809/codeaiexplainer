import { Box, Grid, IconButton, Link, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    hyperlinktext: {
      color: theme.palette.warning.dark,
      textDecoration: 'underline',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    banner: {
      maxWidth: '100vw',
      zIndex: 1,
      position: 'relative',
      minHeight: theme.spacing(6),
      backgroundColor: theme.palette.warning.light,
      color: 'black',
      boxShadow: '0px 3px 6px #00000012',
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      textAlign: 'center',
      padding: theme.spacing(1, 1, 0, 1),
    },
    bannerText: {
      lineHeight: '32px',
      fontWeight: 500,
      color: theme.palette.warning.main,
    },
    closeIcon: {
      margin: 0,
      color: theme.palette.uxGrey.main,
    },
  }),
);

interface AccountPendingBannerProps {
  settingsClickHandler: () => void;
  handlePendingBannerClose: () => void;
  pendingBannerVisible: boolean;
  setHasAdditionalBanner: (hasBanner: boolean) => void;
  hasAdditionalBanner: boolean;
}

const AccountPendingBanner: React.FC<AccountPendingBannerProps> = props => {
  const { settingsClickHandler, handlePendingBannerClose, pendingBannerVisible, setHasAdditionalBanner, hasAdditionalBanner } = props;
  const classes = useStyles();

  if (pendingBannerVisible) {
    if (!hasAdditionalBanner) setHasAdditionalBanner(true);
    return (
      <Box className={classes.banner} id="pending-account-banner">
        <Grid container>
          <Grid item xs={11}>
            <Typography className={classes.bannerText}>
              {'Your account verification is currently in Pending status. For more details, view your '}
              <Link underline={'hover'} className={classes.hyperlinktext} onClick={settingsClickHandler}>
                Account Settings.
              </Link>
            </Typography>
          </Grid>
          <Grid item xs={1} justifyContent="flex-end">
            <IconButton size="small" onClick={handlePendingBannerClose} className={classes.closeIcon} data-cy="close-pending-banner">
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (hasAdditionalBanner) setHasAdditionalBanner(false);
  return null;
};

export default AccountPendingBanner;
