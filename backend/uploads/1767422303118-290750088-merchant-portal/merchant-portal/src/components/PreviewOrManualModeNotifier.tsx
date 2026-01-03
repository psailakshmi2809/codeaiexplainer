import { Button, IconButton, Theme, Typography, useMediaQuery } from '@mui/material';
import React from 'react';
import PreviewModeIcon from '@mui/icons-material/Preview';
import ManualModeIcon from '@mui/icons-material/SendTimeExtension';
import { NavLink } from 'react-router-dom';
import { IntegrationMode, IntegrationSettings } from '../gql-types.generated';
import { Badge } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginRight: 4,
      textTransform: 'none',
      [theme.breakpoints.down(375)]: {
        'margin-right': 0,
        padding: '6px',
      },
    },
    textError: {
      color: theme.palette.error.main,
    },
    icon: {
      color: theme.palette.uxGrey.main,
    },
    badge: {
      '& .MuiBadge-dot': {
        background: theme.palette.success.main,
      },
      '& .MuiBadge-badge': {
        minWidth: '10px',
        height: '10px',
        borderRadius: '5px',
      },
    },
    badgeError: {
      '& .MuiBadge-dot': {
        background: theme.palette.error.main,
      },
      '& .MuiBadge-badge': {
        minWidth: '10px',
        height: '10px',
        borderRadius: '5px',
      },
    },
  }),
);

interface PreviewOrManualModeNotifierProps {
  integrationSettings?: IntegrationSettings | null;
}

const PreviewOrManualModeNotifier: React.FC<PreviewOrManualModeNotifierProps> = props => {
  const { integrationSettings } = props;
  const classes = useStyles();
  const matches = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const previewMode = integrationSettings?.previewSettings?.enabled || false;
  const previewEmail = integrationSettings?.previewSettings?.email;
  const manualMode = integrationSettings?.mode === IntegrationMode.Manual;

  const previewModeView = () => {
    if (!previewEmail) {
      if (matches) {
        return (
          <IconButton
            className={classes.container}
            to="/account-preferences"
            component={NavLink}
            aria-label="Add Preview Email"
            size="large"
          >
            <Badge variant="dot" color="error" className={classes.badgeError} overlap="circular">
              <PreviewModeIcon className={classes.icon} />
            </Badge>
          </IconButton>
        );
      }
      return (
        <Button
          variant="text"
          className={classes.container}
          to="/account-preferences"
          component={NavLink}
          startIcon={
            <Badge variant="dot" color="error" className={classes.badgeError} overlap="circular">
              <PreviewModeIcon className={classes.icon} />
            </Badge>
          }
        >
          <Typography variant={'body1'} className={classes.textError}>
            Add Preview Email
          </Typography>
        </Button>
      );
    }

    if (matches) {
      return (
        <IconButton
          className={classes.container}
          to="/account-preferences"
          component={NavLink}
          aria-label="Preview Enabled"
          size="large"
        >
          <Badge variant="dot" color="success" className={classes.badge} overlap="circular">
            <PreviewModeIcon className={classes.icon} />
          </Badge>
        </IconButton>
      );
    }

    return (
      <Button
        variant="text"
        className={classes.container}
        to="/account-preferences"
        component={NavLink}
        startIcon={
          <Badge variant="dot" color="success" className={classes.badge} overlap="circular">
            <PreviewModeIcon className={classes.icon} />
          </Badge>
        }
      >
        <Typography variant={'body1'}>Preview Enabled</Typography>
      </Button>
    );
  };

  const manualModeView = () => {
    if (matches) {
      return (
        <IconButton
          className={classes.container}
          to="/account-preferences"
          component={NavLink}
          aria-label="Manual Enabled"
          size="large"
        >
          <Badge variant="dot" color="success" className={classes.badge} overlap="circular">
            <ManualModeIcon className={classes.icon} />
          </Badge>
        </IconButton>
      );
    }

    return (
      <Button
        variant="text"
        className={classes.container}
        to="/account-preferences"
        component={NavLink}
        startIcon={
          <Badge variant="dot" color="success" className={classes.badge} overlap="circular">
            <ManualModeIcon className={classes.icon} />
          </Badge>
        }
      >
        <Typography variant={'body1'}>Manual Enabled</Typography>
      </Button>
    );
  };

  return (
    <>
      {manualMode && manualModeView()}
      {previewMode && previewModeView()}
    </>
  );
};

export default PreviewOrManualModeNotifier;
