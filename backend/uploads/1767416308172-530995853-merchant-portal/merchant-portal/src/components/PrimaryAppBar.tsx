import {
  AppBar,
  Avatar,
  Box,
  Button,
  ButtonBase,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Popover,
  Theme,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Link,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import PersonIcon from '@mui/icons-material/Person';
import { FC, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsMenu from './SettingsMenu';
import { AccountBalances, IntegrationSettings, LoginContext, Person } from '../gql-types.generated';
import MenuIcon from '@mui/icons-material/Menu';
import PreviewOrManualModeNotifier from './PreviewOrManualModeNotifier';
import AccountBalanceTool from './AccountBalanceTool';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    appBar: {
      boxShadow: '0px 3px 6px #00000012',
      zIndex: 2,
    },
    settingsBox: {
      width: 400,
    },
    menuButton: {
      paddingRight: theme.spacing(2),
    },
    apteanLogo: {
      height: '27px',
      marginLeft: theme.spacing(0),
      marginTop: '10px',
    },
    linearProgress: {
      marginTop: -4,
    },
    companyLogo: {
      maxWidth: 225,
      maxHeight: 50,
      marginLeft: theme.spacing(1),
    },
    avatar: {
      backgroundColor: theme.palette.uxGrey.focus,
      color: theme.palette.uxGrey.main,
      fontWeight: 500,
    },
    companySelectWrap: {
      paddingLeft: 4,
    },
    menuItem: {
      wordWrap: 'break-word',
      wordBreak: 'break-all',
      width: '300px',
      whiteSpace: 'normal',
    },
    wrapButtonText: {
      maxWidth: '470px',
      [theme.breakpoints.down('lg')]: {
        maxWidth: '30vw',
      },
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      color: '#000000DE',
    },
    selectedTenant: {
      backgroundColor: theme.palette.uxGrey.hover,
    },
  }),
);

interface AppBarProps {
  isOnboarded: boolean;
  networkBusy: boolean;
  viewerUser?: Person | undefined;
  logoUrl?: string | undefined;
  defaultCurrency?: string | null;
  balances: AccountBalances | null | undefined;
  handleMenuIconClick: () => void;
  menuVisible: boolean;
  handleCompanyChange: (id: string) => void;
  companyName?: string;
  loginContext?: LoginContext;
  selectedCompanyId?: string;
  integrationSettings?: IntegrationSettings | null;
  showAccountBalance: boolean;
}
const PrimaryAppBar: FC<AppBarProps> = props => {
  const {
    isOnboarded,
    networkBusy,
    viewerUser,
    logoUrl,
    menuVisible,
    handleMenuIconClick,
    defaultCurrency,
    balances,
    loginContext,
    companyName,
    handleCompanyChange,
    selectedCompanyId,
    integrationSettings,
    showAccountBalance,
  } = props;
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const accounts = loginContext?.accounts;
  const [anchorEl, setAnchorEl] = useState<Element | null>();
  const handleClick = (event: { currentTarget: Element }) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [menuAnchorEl, setMenuAnchorEl] = useState<Element | null>();
  const handleCompanyMenuClick = (event: { currentTarget: Element }) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleCompanyMenuClose = () => {
    setMenuAnchorEl(null);
  };
  const handleCompanySelect = (id?: string) => {
    if (id) {
      handleCompanyChange(id);
    }
    handleCompanyMenuClose();
  };
  let initials = <PersonIcon />;
  if (viewerUser) {
    let userInitials = viewerUser.firstName ? viewerUser.firstName[0] : '';
    userInitials += viewerUser.lastName ? viewerUser.lastName[0] : '';

    initials = <span>{userInitials}</span>;
  }

  return (
    <AppBar position="fixed" color="inherit" className={classes.appBar} id="primary-app-bar">
      <Toolbar>
        {isOnboarded && (
          <div className={classes.menuButton}>
            <IconButton
              aria-label="app menu"
              size="medium"
              color="default"
              aria-controls="tenant-menu"
              onClick={handleMenuIconClick}
              data-cy="menu-icon"
              aria-expanded={menuVisible}
            >
              <MenuIcon />
            </IconButton>
          </div>
        )}
        <Link href="/">
          <img className={classes.apteanLogo} src={matches ? 'logoMobile.png' : 'logo.png'} alt="aptean pay logo" />
        </Link>
        {selectedCompanyId && accounts && accounts.length === 1 && (
          <div className={classes.companySelectWrap}>
            <ButtonBase data-cy="active-company-button" disableRipple={true} disableTouchRipple={true}>
              {logoUrl && <img data-cy="company-logo" className={classes.companyLogo} src={logoUrl} />}
              {!logoUrl && companyName ? (
                <Typography variant={'subtitle'} className={classes.wrapButtonText}>
                  {companyName}
                </Typography>
              ) : null}
            </ButtonBase>
          </div>
        )}
        {selectedCompanyId && accounts && accounts.length > 1 && (
          <div className={classes.companySelectWrap}>
            <Button
              id="company-menu-button"
              aria-label={`${companyName || ''} company menu`}
              aria-controls="company-select-menu"
              aria-haspopup="true"
              data-cy="company-select-button"
              aria-expanded={Boolean(menuAnchorEl)}
              onClick={handleCompanyMenuClick}
              endIcon={<KeyboardArrowDownIcon fontSize={'large'} color={'primary'} />}
            >
              {logoUrl && <img alt={`company logo`} data-cy="company-logo" className={classes.companyLogo} src={logoUrl} />}
              {!logoUrl && companyName ? (
                <Typography variant={'subtitle'} className={classes.wrapButtonText}>
                  {companyName}
                </Typography>
              ) : null}
            </Button>
            <Menu
              role="navigation"
              aria-labelledby="company-menu-button"
              data-cy="company-select-menu"
              open={Boolean(menuAnchorEl)}
              anchorEl={menuAnchorEl}
              onClose={handleCompanyMenuClose}
              MenuListProps={{
                id: 'company-select-menu',
                'aria-labelledby': 'company-menu-button',
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              autoFocus={false}
            >
              {accounts &&
                accounts.map((account, i) => {
                  const isSelected = selectedCompanyId === account?.owner?.tenantId;
                  return (
                    <MenuItem
                      data-cy={`company-select-menu-item-${i}`}
                      autoFocus={isSelected}
                      key={i}
                      onClick={() => handleCompanySelect(account?.owner?.tenantId)}
                      className={isSelected ? classes.selectedTenant : undefined}
                    >
                      <Typography className={classes.menuItem} color={isSelected ? 'primary' : undefined}>
                        {account?.businessProfile?.name || account?.company?.name}
                      </Typography>
                    </MenuItem>
                  );
                })}
            </Menu>
          </div>
        )}
        <div className={classes.grow} />
        {isOnboarded && <PreviewOrManualModeNotifier integrationSettings={integrationSettings} />}
        {selectedCompanyId && showAccountBalance && <AccountBalanceTool defaultCurrency={defaultCurrency} balances={balances} />}
        <IconButton
          id="settings-menu-button"
          aria-label="settings menu button"
          onClick={handleClick}
          title="User Settings"
          data-cy="user-settings"
          aria-haspopup="true"
          aria-controls="settings-menu"
          aria-expanded={Boolean(anchorEl)}
          size="large"
        >
          <Avatar className={classes.avatar} data-cy="user-avatar">
            {initials}
          </Avatar>
        </IconButton>
        <Popover
          aria-hidden={true}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          role="navigation"
          aria-labelledby="settings-menu-button"
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <Box className={classes.settingsBox}>
            <SettingsMenu afterClick={handleClose} viewerUser={viewerUser} />
          </Box>
        </Popover>
      </Toolbar>
      {networkBusy && <LinearProgress className={classes.linearProgress} color="primary" />}
    </AppBar>
  );
};

export default PrimaryAppBar;
