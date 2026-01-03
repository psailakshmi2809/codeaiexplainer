import { Box, Button, Dialog, Grid, Theme, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogContent: {
      padding: theme.spacing(0, 0, 2, 0),
    },
    infoSections: {
      margin: 0,
      padding: theme.spacing(1.5),
    },
    contentSection: {
      margin: 0,
      padding: theme.spacing(0, 2),
    },
    headerText: {
      fontWeight: 'bold',
      margin: 0,
      wordWrap: 'break-word',
      wordBreak: 'break-word',
    },
    backdropRoot: {
      backgroundColor: theme.palette.uxGrey.disabled,
    },
  }),
);

interface ConnectivityIssueDetailsProps {
  isOpen: boolean;
  handleReconnect: () => void;
}

const ConnectivityIssueDetails: React.FC<ConnectivityIssueDetailsProps> = props => {
  const { isOpen, handleReconnect } = props;
  const classes = useStyles();

  return (
    <Dialog
      open={isOpen}
      fullWidth
      maxWidth="xs"
      BackdropProps={{
        classes: {
          root: classes.backdropRoot,
        },
      }}
    >
      <Box className={classes.dialogContent}>
        <Box className={classes.infoSections}>
          <Grid>
            <Typography variant="subtitle2">APTEAN PAY ALERT</Typography>
            <Typography className={classes.headerText}>No Internet Connection</Typography>
          </Grid>
        </Box>
        <Box className={classes.contentSection}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant={'body1'}>
                {
                  'Your device appears to be offline. Aptean Pay requires internet connectivity in order to access your data. Please check your network settings and click "reconnect" to try again.'
                }
              </Typography>
            </Grid>
            <Grid item container xs={12} justifyContent="flex-end" spacing={1}>
              <Button variant="contained" color="primary" size="small" onClick={handleReconnect} data-cy="reconnect">
                RECONNECT
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ConnectivityIssueDetails;
