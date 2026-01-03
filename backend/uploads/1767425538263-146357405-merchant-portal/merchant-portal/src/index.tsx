/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CssBaseline, ThemeProvider, StyledEngineProvider } from '@mui/material';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import ReactDOM from 'react-dom';

import App from './features/app/App';
import * as serviceWorker from './serviceWorker';
import theme from './Theme';
import AppProvider from './components/AppProvider';
import { MUI_LICENSE_KEY, SLO_FRONTCHANNELLOGOUT_URL, SLO_POSTLOGOUT_URL } from './util/Constants';
import PostLogoutPage from './components/postLogoutPage';
import FrontChannelLogOut from './components/frontchannellogout';

LicenseInfo.setLicenseKey(MUI_LICENSE_KEY);
const pageRenderManager = () => {
  const currentRequestedPage = window.location.pathname;
  switch (currentRequestedPage) {
    case SLO_POSTLOGOUT_URL:
      return <PostLogoutPage />;
    case SLO_FRONTCHANNELLOGOUT_URL:
      return <FrontChannelLogOut />;
    default:
      return (
        <AppProvider>
          <App />
        </AppProvider>
      );
  }
};

ReactDOM.hydrate(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      {pageRenderManager()}
    </ThemeProvider>
  </StyledEngineProvider>,
  document.getElementById('root'),
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
