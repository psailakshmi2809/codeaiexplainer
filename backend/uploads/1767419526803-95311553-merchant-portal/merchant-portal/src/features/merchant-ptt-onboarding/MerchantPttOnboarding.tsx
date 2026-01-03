import { Paper, Alert, Snackbar, Link } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { RoutePath } from '../../util/Routes';
import { useDispatch, useSelector } from 'react-redux';
import { updateOnboardTransitionStatus } from './MerchantPttOnboardingActions';
import { CompanyVerificationStatus, PayFac, TransitionStatus } from '../../gql-types.generated';
import LoadingMask from '../../components/LoadingMask';
import { selectTenantAccount } from '../app/AppSlice';
import { selectPttOnboardingError } from './MerchantPttOnboardingSlice';
import { createStyles, makeStyles } from '@mui/styles';
import { PTT_ONBOARD_IFRAME_URL, PTT_ONBOARD_MESSAGE_ORIGIN } from '../../util/Constants';
import { fetchTenantAccount } from '../app/AppActions';
import { Helmet } from 'react-helmet';

const useStyles = makeStyles(() =>
  createStyles({
    iframe: {
      width: '100%',
      height: '100%',
      border: '1px solid grey',
    },
  }),
);

const MerchantPttOnboarding: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const onboardingError = useSelector(selectPttOnboardingError);
  const tenantAccount = useSelector(selectTenantAccount);
  const [showLoading, setShowLoading] = useState(false);
  const iframeUrl = new URL(PTT_ONBOARD_IFRAME_URL);
  iframeUrl.searchParams.append('apteanid', tenantAccount?.owner.tenantId || '');
  const isNewPttMerchant =
    tenantAccount?.payFacType === PayFac.Ptt &&
    tenantAccount.company?.verification?.status !== CompanyVerificationStatus.Unspecified &&
    !tenantAccount.tosAcceptance;
  const isTransitioningMerchant =
    tenantAccount?.payFacType !== PayFac.Ptt && tenantAccount?.company?.verification?.transitionStatus === TransitionStatus.Requested;

  useEffect(() => {
    if (tenantAccount && !isNewPttMerchant && !isTransitioningMerchant) {
      // If tenant does not need to ptt onboard, return to home.
      // To show ptt onboarding, existing merchants must have a transition status of REQUESTED.
      // To show ptt onboarding, new merchants must have a payfac of PTT, company verification status of UNSPECIFIED, and an undefined/null tosAcceptance.
      history.push(RoutePath.Home);
    }
  }, [tenantAccount]);

  // Show the loading spinner when first entering the page.
  useEffect(() => {
    setShowLoading(true);
  }, []);

  const onSubmitCallback = (success: boolean) => {
    setShowLoading(false);
    if (success) {
      dispatch(fetchTenantAccount());
      history.push(RoutePath.Home);
    }
  };

  const onSubmit = () => {
    setShowLoading(true);
    // Mutation for existing merchants transitioning to ptt.
    dispatch(updateOnboardTransitionStatus(TransitionStatus.Pending, onSubmitCallback));
  };

  const iframeLoadCallback = () => {
    setShowLoading(false);
    // Listen for the ptt form submitted message.
    window.addEventListener('message', event => {
      if (event.origin === PTT_ONBOARD_MESSAGE_ORIGIN && event.data === 'formSubmitted') {
        onSubmit();
      }
    });
  };

  return (
    <>
      <Helmet>
        <meta name="ai:viewId" content="merchant-onboarding"></meta>
        <meta name="ai:viewDescription" content="Aptean Pay Merchant Portal - Merchant Onboarding"></meta>
        <title>Aptean Pay Merchant Portal - Merchant Onboarding</title>
      </Helmet>
      <Paper sx={{ width: '100%' }}>
        <LoadingMask loading={showLoading} />
        <iframe
          id="ptt-onboard-iframe"
          className={classes.iframe}
          src={iframeUrl.href}
          onLoad={iframeLoadCallback}
          onError={iframeLoadCallback}
        ></iframe>
      </Paper>
      {/* In case of an error when updating the tenant transition status, show an alert with a retry option. */}
      <Snackbar open={!!onboardingError} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" icon={false}>
          {onboardingError || 'There was a problem submitting the information.'}{' '}
          <Link onClick={onSubmit} sx={{ cursor: 'pointer' }}>
            Click here to try again.
          </Link>
        </Alert>
      </Snackbar>
    </>
  );
};

export default MerchantPttOnboarding;
