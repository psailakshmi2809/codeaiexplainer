import { Theme, Paper, Box, Typography, Select, TextField, MenuItem, Button, InputLabel } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import SmsFailedIcon from '@mui/icons-material/SmsFailed';
import AttachmentIcon from '@mui/icons-material/Attachment';
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
      backgroundColor: theme.palette.uxGrey.hover,
      padding: 8,
    },
    icon: {
      fontSize: '1.8rem',
      color: theme.palette.text.secondary,
      opacity: 0.8,
    },
    suggestionText: {
      marginBottom: theme.spacing(2),
    },
    suggestionField: {
      marginBottom: theme.spacing(2),
    },
    footerBox: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    featureSelectLabel: {
      marginBottom: '-10px',
    },
    featureSelectArrow: {
      top: 0,
      right: 0,
      padding: theme.spacing(0, 1),
      borderLeft: '1px solid #00000033',
      height: '100%',
      width: theme.spacing(5.5),
    },
    featureSelectPadding: {
      padding: theme.spacing(1.5),
      '&$outlined': {
        paddingRight: theme.spacing(5.5),
      },
    },
    outlined: {}, // Needed for above fix
  }),
);

const Suggestions: React.FC = () => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Box className={classes.contentBox}>
        <Box className={classes.header}>
          <Box className={classes.headerText}>
            <Typography variant="subtitle2" className={classes.headerHeadText}>
              SUGGESTIONS
            </Typography>
            <Typography variant="h6">Help us improve Aptean pay</Typography>
          </Box>
          <Box className={classes.headerIcon}>
            <SmsFailedIcon className={classes.icon}></SmsFailedIcon>
          </Box>
        </Box>
        <Box>
          <Typography className={classes.suggestionText}>
            For bugs or issues, create a support case in{' '}
            <a href="https://connect.aptean.com" target="_blank" rel="noopener noreferrer">
              Aptean Connect
            </a>{' '}
            instead.
          </Typography>
          <InputLabel id="feature-select-label" disableAnimation variant="outlined" className={classes.featureSelectLabel}>
            Select a feature for your suggestion*
          </InputLabel>
          <Select
            variant="outlined"
            fullWidth
            required
            placeholder="Select a feature for your suggestion*"
            labelId="feature-select-label"
            value=""
            className={classes.suggestionField}
            classes={{
              select: classes.featureSelectPadding,
              iconOutlined: classes.featureSelectArrow,
              outlined: classes.outlined,
            }}
          >
            <MenuItem value="manage_users">Manage Users</MenuItem>
            <MenuItem value="manage_account">Manage Account</MenuItem>
            <MenuItem value="payment_request">Sending Payment Request</MenuItem>
            <MenuItem value="transaction_reports">Transaction Reports</MenuItem>
            <MenuItem value="payment_request_table">View Payment Requests</MenuItem>
          </Select>
          <TextField
            variant="outlined"
            multiline
            fullWidth
            required
            rows={6}
            inputProps={{ 'aria-label': 'suggestion details' }}
            placeholder="Details of your suggestion*"
            className={classes.suggestionField}
          />
        </Box>
        <Box className={classes.footerBox}>
          <Button variant="outlined" color="primary" startIcon={<AttachmentIcon />}>
            Attach a Screenshot
          </Button>
          <Button variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
export default Suggestions;
