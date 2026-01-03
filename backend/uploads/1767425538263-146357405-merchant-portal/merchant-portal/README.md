# React - Typescript Starter

This boilerplate is a ReactJS-based SPA.

This project runs on node version 16.20.2. Using later versions may introduce errors when trying to run the project.

## Tech

- [ReactJS](https://reactjs.org/)
- [Yarn](https://yarnpkg.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [Jest](https://jestjs.io/) (for unit tests)
- [React-Router](https://reacttraining.com/react-router/web/guides/quick-start/)

## Getting Started

1. Make sure you have NodeJS and Yarn installed.
2. Clone this repo.
3. In your terminal window execute the following command from the root of the repo:

```
yarn install
```

4. Now execute the following in your terminal window:

```
yarn start
```

5. Create a file in your app root called '.env.local' (.env.local is ignored by gitignore)

- copy this into this new file:

```env
  REACT_APP_MSAL_CLIENTID=a36b803d-b5d9-4993-8f3c-1fc618e4cc13
  REACT_APP_MSAL_AUTHORITY=https://apteaniddev.b2clogin.com/apteaniddev.onmicrosoft.com/B2C_1_su_si_2_1
  REACT_APP_EZPAY_API_ENDPOINT=https://dev.api.apteanpay.com/
  REACT_APP_READ_SCOPE=https://apteaniddev.onmicrosoft.com/ezpay-api-svc-dev/read
  REACT_APP_WRITE_SCOPE=https://apteaniddev.onmicrosoft.com/ezpay-api-svc-dev/write
  REACT_APP_APTEAN_API_SUBSCRIPTION_KEY=3907e935-54e5-447b-8021-b65379c79dfb
  REACT_APP_AI_INSTRUMENTATION_KEY=518fcb5c-128b-405f-a769-66842252f031
  REACT_APP_MERCHANT_PORTAL_BASE_URL=https://dev.merchant.apteanpay.com
  REACT_APP_MUI_LICENSE_KEY=mui_license_key
  REACT_APP_ERP_PRODUCT_ID=d766cb00-b62d-4896-a014-2bc3d05c27b2
  REACT_APP_APTEAN_JS_SDK_URL=https://dev.js.apteansharedservices.com/apteanpay-js/v1
  REACT_APP_PTT_ONBOARD_IFRAME_URL=https://paytech.moonbeam.co/apteanpay/
  REACT_APP_PTT_ONBOARD_MESSAGE_ORIGIN=https://paytech.moonbeam.co
  REACT_APP_ApteanIAM_ClientId=P3066FO8JM8W24WW9
  REACT_APP_ApteanIAM_AuthServerUrl=https://dev.appcentral.apteancloud.dev/iam/auth
  REACT_APP_ApteanIAM_Realm=aptean-staging
  REACT_APP_ApteanIAM_Scope='openid profile email'
  REACT_APP_BYPASS_PTT_ONBOARDING=true
  REACT_APP_AUTH_MODE=aim
```

- This will allow the environment variables to be replaced in build/compile
- Note: https://dev.api.apteanpay.com/ is the dev GraphQL ezpay api service.
  Change this to http://localhost:4000 if you are using your own local ezpay api service.
- REACT_APP_AUTH_MODE - this controls the auth provider to use, possible values are aim or b2c. aim = Aptean IAM, b2c = original b2c auth.

6. Create a file in your app root named 'codegen.yml'. This file is used by the gql codegen tool
   to generate model types based on the gql operations in the app.

- Paste the following text into the file:

```yml
overwrite: true
schema:

- "https://dev.api.apteanpay.com/":
  headers:
  x-ezpay-pmt: "e06047ea-6c4e-4226-afb8-3ff4f006bde8"
  x-aptean-codegen: true
  documents: "src/gql/\*.tsx"
  generates:
  src/gql-types.generated.tsx:
  plugins: - "typescript" - "typescript-operations" - "typescript-react-apollo"
  ./graphql.schema.json:
  plugins: - "introspection"
```

Note: https://dev.api.apteanpay.com/ is the dev GraphQL ezpay api service.
Change this to http://localhost:4000 if you are using your own local ezpay api service.
