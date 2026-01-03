import { Paper, Theme, Box, Typography, Button, SvgIcon } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { ReactComponent as SupportIcon } from '../support-black-18dp.svg';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      textAlign: 'start',
      [theme.breakpoints.down('lg')]: {
        margin: theme.spacing(2, 0),
      },
    },
    contentBox: {
      padding: theme.spacing(3, 3, 0),
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerText: {
      height: '100%',
      maxWidth: '85%',
    },
    headerHeadText: {
      letterSpacing: 1.5,
      fontSize: 12,
    },
    headerIcon: {
      lineHeight: 0,
      borderRadius: 50,
      backgroundColor: theme.palette.uxGrey.hover,
      padding: 8,
    },
    icon: {
      fontSize: '1.8rem',
      color: theme.palette.text.secondary,
      opacity: 0.8,
    },
    footerBox: {
      padding: theme.spacing(3),
      display: 'flex',
      justifyContent: 'flex-end',
    },
    footerButton: {
      marginLeft: theme.spacing(2),
    },
    textInstructions: {
      margin: theme.spacing(2, 0),
    },
  }),
);

const CustomerSupport: React.FC = () => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Box className={classes.contentBox}>
        <Box className={classes.header}>
          <Box className={classes.headerText}>
            <Typography variant="subtitle2" className={classes.headerHeadText}>
              CUSTOMER SUPPORT
            </Typography>
            <Typography variant="h6">Having an issue?</Typography>
          </Box>
          <Box className={classes.headerIcon}>
            <SvgIcon component={SupportIcon} className={classes.icon}></SvgIcon>
          </Box>
        </Box>
        <Box>
          <Typography variant="body1" className={classes.textInstructions}>
            {"If you're experiencing a bug or issue with Aptean Pay, please visit the Aptean Connect Portal to create a new case."}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.footerBox}>
        <Button
          className={classes.footerButton}
          href="https://connect.aptean.com/s/contactsupport"
          variant="contained"
          color="primary"
          target="_blank"
          endIcon={<OpenInNewIcon />}
        >
          Aptean Connect
        </Button>
      </Box>
    </Paper>
  );
};
export default CustomerSupport;
