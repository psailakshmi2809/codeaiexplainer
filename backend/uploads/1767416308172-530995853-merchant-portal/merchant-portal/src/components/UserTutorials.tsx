import { Theme, Paper, Box, Typography, Grid, Button } from '@mui/material';
import { makeStyles, createStyles } from '@mui/styles';
import HelpIcon from '@mui/icons-material/Help';
import SendHelp from '../SendHelp.svg';
import RefundHelp from '../RefundHelp.svg';
import MoreHelp from '../MoreHelp.svg';
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
      padding: theme.spacing(3),
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
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
      backgroundColor: theme.palette.uxGrey.main,
      padding: 8,
    },
    icon: {
      fontSize: '1.8rem',
      color: theme.palette.text.secondary,
      opacity: 0.8,
    },
    imageButton: {
      border: '1px solid #00000033',
      borderRadius: 7,
      padding: theme.spacing(2),
      height: 145,
      width: 145,
    },
    imageButtonLabel: {
      height: '100%',
      textTransform: 'none',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignContent: 'space-between',
    },
    image: {
      maxHeight: '65px',
      maxWidth: '65px',
    },
    imageButtonText: {
      fontSize: 14,
    },
  }),
);

interface UserTutorialsProps {
  handleClick: (value: string) => void;
}

const UserTutorials: React.FC<UserTutorialsProps> = (props: UserTutorialsProps) => {
  const classes = useStyles();
  const { handleClick } = props;
  return (
    <Paper className={classes.paper}>
      <Box className={classes.contentBox}>
        <Box className={classes.header}>
          <Box className={classes.headerText}>
            <Typography variant="subtitle2" className={classes.headerHeadText}>
              APTEAN PAY GUIDES
            </Typography>
            <Typography variant="h6">User Tutorials</Typography>
          </Box>
          <Box className={classes.headerIcon}>
            <HelpIcon className={classes.icon}></HelpIcon>
          </Box>
        </Box>
        <Grid container spacing={3} direction="row" justifyContent="center" alignItems="stretch">
          <Grid item xs={3}>
            <Button
              onClick={() => {
                handleClick('Send a payment request');
              }}
              className={classes.imageButton}
              classes={{ root: classes.imageButtonLabel }}
              style={{ paddingBottom: 0 }}
            >
              <img src={SendHelp} alt="Send Requests Icon" className={classes.image} />
              <Typography align="center" className={classes.imageButtonText}>
                Send a Payment Request
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              onClick={() => {
                handleClick('Issue refund');
              }}
              className={classes.imageButton}
              classes={{ root: classes.imageButtonLabel }}
            >
              <img src={RefundHelp} alt="Handle Refunds Icon" className={classes.image} />
              <Typography align="center" className={classes.imageButtonText}>
                Issue refunds
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              onClick={() => {
                handleClick('');
              }}
              className={classes.imageButton}
              classes={{ root: classes.imageButtonLabel }}
            >
              <img src={MoreHelp} alt="View all Icon" className={classes.image} />
              <Typography align="center" className={classes.imageButtonText}>
                View All
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
export default UserTutorials;
