import { Divider, Grid, MenuItem, MenuList, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import HelpIcon from '@mui/icons-material/Help';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Person } from '../gql-types.generated';
import logoutIconInverted from '../logoutIconInverted.svg';
import { visuallyHidden } from '@mui/utils';
import { ApteanSSOProvider, AuthMode } from '../util/ApteanSSOProvider';
import { b2cAuthProvider } from '../util/AuthProvider';
import { AUTH_MODE } from '../util/Constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      textAlign: 'start',
    },
    userInfo: {
      padding: theme.spacing(3),
    },
    menuItem: {
      height: 55,
      textDecoration: 'none',
      color: theme.palette.text.primary,
    },
    menuItemIcon: {
      marginRight: theme.spacing(2),
      color: theme.palette.uxGrey.main,
    },
    logoutIcon: {
      marginRight: theme.spacing(2),
      width: '1em',
      height: '1em',
      fontSize: '1.5rem',
      transform: 'rotate(180deg)',
    },
  }),
);

interface SettingsMenuProps {
  afterClick: () => void;
  viewerUser: Person | undefined;
}

const SettingsMenu: React.FC<SettingsMenuProps> = props => {
  const { afterClick, viewerUser } = props;
  const classes = useStyles();

  const handleLogout = () => {
    if (AUTH_MODE === AuthMode.B2C) {
      b2cAuthProvider?.logout();
    } else {
      ApteanSSOProvider.exitPortalApp();
    }
    afterClick();
  };

  let signOutText = 'Exit';
  if (AUTH_MODE === AuthMode.B2C) {
    signOutText = 'Sign out';
  }

  return (
    <Grid container className={classes.root}>
      <Grid className={classes.userInfo} item container xs={12}>
        <Grid item xs={9}>
          <Typography style={visuallyHidden}>
            {viewerUser?.firstName} {viewerUser?.lastName}
          </Typography>
          <Typography variant="title">
            {viewerUser?.firstName} {viewerUser?.lastName}
          </Typography>
          <Typography variant="subtitle1">{viewerUser?.email}</Typography>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <MenuList data-cy="settings-menu">
          <MenuItem component={NavLink} className={classes.menuItem} onClick={afterClick} to="/help" data-cy="help">
            <HelpIcon className={classes.menuItemIcon} />
            Help
          </MenuItem>
          <MenuItem className={classes.menuItem} onClick={handleLogout} data-cy="sign-out">
            <img className={classes.logoutIcon} alt="logout" src={logoutIconInverted} />
            {signOutText}
          </MenuItem>
        </MenuList>
      </Grid>
    </Grid>
  );
};

export default SettingsMenu;
