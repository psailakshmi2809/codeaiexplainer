import { Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';
import { makeStyles } from '@mui/styles';
import ApteanBackground from '../aptean-bg.jpg';

const useStyles = makeStyles({
  root: {
    backgroundImage: `url(${ApteanBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: '#34363a',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '300px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  button: {
    marginTop: '16px',
    backgroundColor: '#f0ff00',
    color: 'black',
    '&:hover': {
      backgroundColor: '#e6e600',
      color: 'black',
    },
  },
  text: {
    color: 'white',
    marginBottom: '16px',
    textAlign: 'center',
    fontSize: '18px',
  },
});

const PostLogoutPage: React.FC = () => {
  const goToHomePage = () => {
    window.location.href = '/';
  };
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Paper className={classes.overlay}>
        <Typography className={classes.text}>You have successfully exited Merchant Portal.</Typography>
        <Button variant="contained" className={classes.button} onClick={goToHomePage}>
          Please click here to log back in
        </Button>
      </Paper>
    </Box>
  );
};

export default PostLogoutPage;
