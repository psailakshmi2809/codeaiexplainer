import { Theme, Paper, Box, Button, Divider, Typography, Drawer, List, ListItem } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      textAlign: 'start',
      width: '75%',
      margin: 'auto',
    },
    topBox: {
      padding: theme.spacing(1),
    },
    backButton: {
      fontSize: 17,
    },
    header: {
      padding: theme.spacing(2),
    },
    headerText: {
      fontSize: '24px',
      fontWeight: 500,
    },
    drawer: {
      width: '25%',
      flexShrink: 0,
      paddingBottom: theme.spacing(2),
    },
    drawerPaper: {
      width: '75%',
      position: 'static',
      border: 'none',
    },
    drawerContainer: {
      overflow: 'auto',
    },
    drawerItem: {
      padding: theme.spacing(2),
      fontSize: 16,
    },
    selected: {},
    drawerItemRoot: {
      borderTopRightRadius: '27px',
      borderBottomRightRadius: '27px',
      '&$selected': {
        backgroundColor: theme.palette.uxBlue.activated,
        color: theme.palette.primary.main,
        '&:hover': {
          color: theme.palette.primary.main,
        },
      },
      '&:hover': {
        color: theme.palette.primary.main,
      },
    },
  }),
);

const tutorials = ['Send a payment request', 'Issue refund', 'Payout Settings'];

interface UserTutorialsSectionProps {
  handleBack: () => void;
  handleClick: (value: string) => void;
  selected: string;
}

const UserTutorialsSection: React.FC<UserTutorialsSectionProps> = (props: UserTutorialsSectionProps) => {
  const classes = useStyles();
  const { handleBack, handleClick, selected } = props;

  return (
    <Paper className={classes.paper}>
      <Box className={classes.topBox}>
        <Button className={classes.backButton} startIcon={<ArrowBackIcon />} color="primary" onClick={handleBack}>
          HELP HOME
        </Button>
      </Box>
      <Divider />
      <Box style={{ display: 'flex' }}>
        <Drawer
          anchor="left"
          variant="permanent"
          className={classes.drawer}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <Box className={classes.header}>
            <Typography className={classes.headerText}>User Tutorials</Typography>
          </Box>
          <List disablePadding>
            {tutorials.map(text => (
              <ListItem
                button
                onClick={() => handleClick(text)}
                key={text}
                selected={selected === text}
                className={classes.drawerItem}
                classes={{ selected: classes.selected, root: classes.drawerItemRoot }}
              >
                {text}
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box>
          <Box className={classes.header}>
            <Typography className={classes.headerText}>{selected !== '' ? selected : 'Select a tutorial'}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
export default UserTutorialsSection;
