import { Link, Typography, Breadcrumbs as Crumbs } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { RoutePath, RouteDisplay } from '../util/Routes';
const useStyles = makeStyles(() =>
  createStyles({
    crumb: {
      cursor: 'pointer',
      fontSize: 14,
      textTransform: 'uppercase',
    },
    noActionCrumb: {
      cursor: 'default',
      fontSize: 14,
      textTransform: 'uppercase',
    },
  }),
);
interface Crumb {
  path: string;
  text: string;
}
interface BreadcrumbsProps extends RouteComponentProps {
  className?: string;
  tenantName: string;
  lastTabPath?: string;
}
const Breadcrumbs: React.FC<BreadcrumbsProps> = (props: BreadcrumbsProps) => {
  const classes = useStyles();
  const { history, location, className, tenantName, lastTabPath } = props;
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const getRouteDisplayText = (path: string) => {
    switch (path) {
      case RoutePath.Settings:
        return RouteDisplay.Settings;
      case RoutePath.Payment:
        return RouteDisplay.Payment;
      case RoutePath.CustomerManagement:
        return RouteDisplay.CustomerManagement;
      case RoutePath.UserManagement:
        return RouteDisplay.UserManagement;
      case RoutePath.AccountManagement:
        return RouteDisplay.AccountManagement;
      case RoutePath.AccountPreferences:
        return RouteDisplay.AccountPreferences;
      case RoutePath.Help:
        return RouteDisplay.Help;
      case RoutePath.Payments:
        return RouteDisplay.Payments;
      case RoutePath.Requests:
        return RouteDisplay.Requests;
      case RoutePath.PaymentRequest:
        return RouteDisplay.PaymentRequest;
      case RoutePath.Home:
        // Already home.
        return undefined;
      default:
        // Unknown route to our switch, show route
        return path;
    }
  };
  useEffect(() => {
    const startingPath = location.pathname;
    if (startingPath !== '' && startingPath !== '/' && startingPath !== RoutePath.Home) {
      const startingCrumb = {
        path: startingPath,
      } as Crumb;
      // If the loading apps initial path has a value, and its not home, set it in the intial crumbs.
      const displayText = getRouteDisplayText(startingPath);
      if (displayText) {
        startingCrumb.text = displayText;
        setCrumbs([startingCrumb]);
      }
    }
    const unlisten = history.listen(location => {
      setCrumbs([{ path: location.pathname, text: getRouteDisplayText(location.pathname) } as Crumb]);
    });
    // returned function will be called on component unmount
    return () => {
      unlisten();
    };
  }, []);
  return (
    <Crumbs aria-label="breadcrumb" className={className}>
      <Typography variant={'label1'}>
        <Link underline="hover" className={classes.crumb} color="primary" href={'/'}>
          {RouteDisplay.Home}
        </Link>
      </Typography>
      {crumbs.length === 0 && (
        <Typography variant={'label1'} className={classes.noActionCrumb}>
          {tenantName}
        </Typography>
      )}
      {crumbs.length > 0 && tenantName && (
        <Typography variant={'label1'}>
          <Link
            underline="hover"
            className={classes.crumb}
            color="primary"
            onClick={() => {
              // "tenant" home. It is the same as the href on the Home link.
              // using history push does not refresh browser like a link with href does.
              // Use the last tab path state prop or just go home if there isn't one.
              history.push(lastTabPath || RoutePath.Home);
            }}
          >
            {tenantName}
          </Link>
        </Typography>
      )}
      {crumbs?.map((crumb: Crumb, index: number) => {
        if (index === crumbs.length - 1 || crumbs.length === 1) {
          return (
            <Typography variant={'label1'} key={index} className={classes.noActionCrumb}>
              {crumb.text}
            </Typography>
          );
        }
        return (
          <Typography variant={'label1'} key={index}>
            <Link
              underline="hover"
              className={classes.crumb}
              color="primary"
              onClick={() => {
                history.push(crumb.path);
              }}
            >
              {crumb.text}
            </Link>
          </Typography>
        );
      })}
    </Crumbs>
  );
};

export default withRouter(Breadcrumbs);
