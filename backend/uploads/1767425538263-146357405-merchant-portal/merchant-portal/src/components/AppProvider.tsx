/* eslint-disable @typescript-eslint/naming-convention */
import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import AzureAD from 'react-aad-msal';

import store from '../store';
import {
  APTEAN_IAM_CLIENT_ID,
  APTEAN_IAM_AUTHORITY,
  APTEAN_IAM_REALM,
  SLO_POSTLOGOUT_URL,
  EZPAY_API_URL,
  AUTH_MODE,
} from '../util/Constants';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { b2cAuthProvider } from '../util/AuthProvider';
import { AuthMode } from '../util/ApteanSSOProvider';

const uploadLink = createUploadLink({
  uri: EZPAY_API_URL,
  credentials: 'same-origin',
}) as unknown;

export const gqlClient = new ApolloClient({
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
  },
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
        );
      }
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    uploadLink as ApolloLink,
  ]),
  cache: new InMemoryCache(),
});
const AppProvider: React.FC = ({ children }) => {
  if (AUTH_MODE === AuthMode.B2C) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      <AzureAD provider={b2cAuthProvider!} forceLogin={true}>
        <ApolloProvider client={gqlClient}>
          <Provider store={store}>
            <Router>{children}</Router>
          </Provider>
        </ApolloProvider>
      </AzureAD>
    );
  }

  const oidConfig: AuthProviderProps = {
    authority: `${APTEAN_IAM_AUTHORITY}/realms/${APTEAN_IAM_REALM}`,
    client_id: APTEAN_IAM_CLIENT_ID,
    redirect_uri: window.location.origin,
    onSigninCallback: () => {
      window.history.replaceState({}, document.title, window.location.pathname);
    },
    post_logout_redirect_uri: `${window.location.origin}/${SLO_POSTLOGOUT_URL}`,
    automaticSilentRenew: true,
  };
  return (
    <AuthProvider {...oidConfig}>
      <ApolloProvider client={gqlClient}>
        <Provider store={store}>
          <Router>{children}</Router>
        </Provider>
      </ApolloProvider>
    </AuthProvider>
  );
};

export default AppProvider;
