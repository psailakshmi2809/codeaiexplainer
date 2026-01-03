import { Button, Divider, Grid, Theme, Tooltip, Typography } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import React from 'react';

import { AppRole, TenantAccount, TenantSupportedCapabilities } from '../gql-types.generated';
import BusinessName from './BusinessName';
import BusinessUrl from './BusinessUrl';
import GridItem from './GridItem';
import Logo from './Logo';
import RefundPolicy from './RefundPolicy';
import StatementDescription from './StatementDescription';
import SupportEmail from './SupportEmail';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    header: {
      marginBottom: theme.spacing(2),
    },
    divider: {
      width: '100%',
    },
    tooltip: {
      alignSelf: 'flex-start',
      cursor: 'pointer',
      marginLeft: '0.3rem',
    },
  }),
);

interface BusinessInformationProps {
  tenantAccount: TenantAccount | undefined;
  handleNewRefundPolicy: (refundPolicy: string) => void;
  handleNewStatementDescription: (statementDescription: string) => void;
  networkBusy: boolean;
  feeSchedule?: string | null;
  handleNewLogo: (logo: File, highResLogo?: File) => void;
  handleNewBusinessUrl: (businessUrl: string) => void;
  handleNewSupportEmail: (supportEmail: string) => void;
  viewerAppRole?: AppRole;
  tenantId?: string;
  handleNewBusinessName: (businessName: string) => void;
  supportedCapabilities?: TenantSupportedCapabilities;
}

const businessTypeFormatted = [
  { type: 'COMPANY', display: 'Company' },
  { type: 'INDIVIDUAL', display: 'Individual' },
  { type: 'NON_PROFIT', display: 'Non-Profit' },
  { type: 'GOVT_ENTITY', display: 'Government Entity' },
  { type: 'UNKNOWN', display: 'Unknown' },
];
const businessStructureFormatted = [
  { type: 'CORPORATION', display: 'Corporation' },
  { type: 'GOVERNMENT_AGENCY', display: 'Government Agency' },
  { type: 'LIMITED_LIABILITY_COMPANY', display: 'Limited Liability Company' },
  { type: 'NONPROFIT_CORPORATION', display: 'Nonprofit Corporation' },
  { type: 'PARTNERSHIP', display: 'Partnership' },
  { type: 'PERSONAL_TRUST', display: 'Personal Trust' },
  { type: 'SOLE_PROPRIETOR', display: 'Sole Proprietor' },
  { type: 'STATUTORY_TRUST', display: 'Statutory Trust' },
  { type: 'UNINCORPORATED_ASSOCIATION', display: 'Unincorporated Association' },
  { type: 'UNKNOWN', display: 'Unknown' },
];
const BusinessInformation: React.FC<BusinessInformationProps> = props => {
  const classes = useStyles();
  const {
    tenantAccount,
    handleNewStatementDescription,
    handleNewRefundPolicy,
    feeSchedule,
    handleNewLogo,
    handleNewBusinessUrl,
    handleNewSupportEmail,
    networkBusy,
    viewerAppRole,
    tenantId,
    handleNewBusinessName,
    supportedCapabilities,
  } = props;
  const companyName = tenantAccount && tenantAccount.company?.name ? tenantAccount.company?.name : 'None';
  const businessName = tenantAccount && tenantAccount.businessProfile?.name ? tenantAccount.businessProfile?.name : 'None';
  const website = tenantAccount && tenantAccount.businessProfile?.url ? tenantAccount.businessProfile?.url : 'None';
  const description =
    tenantAccount && tenantAccount.businessProfile?.description ? tenantAccount.businessProfile?.description : 'None';
  const logoUrl = tenantAccount?.businessProfile?.logoUrl as string;
  const highResLogoUrl = tenantAccount?.businessProfile?.highResLogoUrl as string;
  const address = tenantAccount?.company?.address;
  let completeAddress = 'None';
  if (address && address !== '') {
    const addressStreet = address?.line2 ? `${address.line1}, ${address.line2}` : address?.line1;
    completeAddress = `${addressStreet}, ${address.city}, ${address.region} ${address.postalCode}, ${address.country}`;
  }
  const phoneNumber = tenantAccount?.company?.phone
    ? `${tenantAccount?.company?.phone?.countryCode} ${tenantAccount?.company?.phone?.number}`
    : 'None';
  const controllerEmail = tenantAccount && tenantAccount?.email ? tenantAccount.email : 'None';
  const businessType = tenantAccount && tenantAccount.businessType ? tenantAccount.businessType : 'UNKNOWN';
  const entityType =
    tenantAccount && tenantAccount.company && tenantAccount.company?.structure ? tenantAccount.company?.structure : businessType;
  const accountPayFacId =
    tenantAccount &&
    tenantAccount.payfac &&
    tenantAccount.payfac.ids &&
    tenantAccount.payfac.ids.find(payfac => payfac.resourceType === 'accounts')?.resourceId;
  const statementDescription =
    tenantAccount && tenantAccount.settings?.cardPayments?.statementDescription
      ? tenantAccount.settings?.cardPayments?.statementDescription
      : 'None';
  const refundPolicy =
    tenantAccount && tenantAccount.settings?.cardPayments?.refundPolicy
      ? tenantAccount?.settings?.cardPayments.refundPolicy
      : undefined;
  const supportEmail =
    tenantAccount && tenantAccount.businessProfile?.supportEmail ? tenantAccount.businessProfile.supportEmail : 'None';
  const mcc = tenantAccount && tenantAccount.businessProfile?.mcc ? tenantAccount.businessProfile.mcc : 'None';

  const websiteNotPresent = !tenantAccount?.businessProfile?.url;
  const refundNotPresent = !tenantAccount?.settings?.cardPayments?.refundPolicy;

  const canEdit = viewerAppRole === AppRole.Admin || viewerAppRole === AppRole.Editor;

  const entityTypeDisplay = businessStructureFormatted.find(item => {
    return item.type === entityType;
  })?.display;
  return (
    <Grid container className={classes.root} data-cy="business-information-section" aria-label="Account Information" role="region">
      <Typography className={classes.header} variant="subtitle">
        Account Information
      </Typography>
      <GridItem name={'TENANT ID'} value={<Typography variant="body1">{tenantId || 'None'}</Typography>} />
      <Divider className={classes.divider} />
      <GridItem name={'MERCHANT ACCOUNT #'} value={<Typography variant="body1">{accountPayFacId}</Typography>} />
      <Divider className={classes.divider} />
      <GridItem name={'MERCHANT CATEGORY CODE'} value={<Typography variant="body1">{mcc}</Typography>} />
      <Divider className={classes.divider} />
      <GridItem
        name={'LOGO'}
        value={
          <Logo
            logoUrl={logoUrl}
            highResLogoUrl={highResLogoUrl}
            handleNewLogo={handleNewLogo}
            networkBusy={networkBusy}
            canEdit={canEdit}
          />
        }
      />
      <Divider className={classes.divider} />
      {supportedCapabilities?.legalEntityName && (
        <>
          <GridItem
            name={'LEGAL ENTITY NAME'}
            value={
              <>
                <Typography variant="body1">{companyName}</Typography>
                <Tooltip
                  title="Legal Entity Name added as part of onboarding and is not editable"
                  className={classes.tooltip}
                  aria-hidden="false"
                >
                  <InfoOutlinedIcon htmlColor="grey" fontSize="small" />
                </Tooltip>
              </>
            }
          />
          <Divider className={classes.divider} />
        </>
      )}
      <GridItem
        name={'DOING BUSINESS AS'}
        value={
          <BusinessName
            businessName={businessName}
            handleNewBusinessName={handleNewBusinessName}
            canEdit={canEdit}
            tenantId={tenantId}
          />
        }
      />
      <Divider className={classes.divider} />
      {supportedCapabilities?.website && (
        <>
          <GridItem
            alert={websiteNotPresent}
            name={'WEBSITE'}
            value={
              <BusinessUrl businessUrl={website} handleNewBusinessUrl={handleNewBusinessUrl} canEdit={canEdit} tenantId={tenantId} />
            }
          />
          <Divider className={classes.divider} />
        </>
      )}
      {supportedCapabilities?.description && (
        <>
          <GridItem name={'DESCRIPTION'} value={<Typography variant="body1">{description}</Typography>} />
          <Divider className={classes.divider} />
        </>
      )}
      <GridItem name={'ADDRESS'} value={<Typography variant="body1">{completeAddress}</Typography>} />
      <Divider className={classes.divider} />
      <GridItem name={'PHONE'} value={<Typography variant="body1">{phoneNumber}</Typography>} />
      <Divider className={classes.divider} />
      <GridItem name={'PRIMARY ACCOUNT HOLDER EMAIL'} value={<Typography variant="body1">{controllerEmail}</Typography>} />
      <Divider className={classes.divider} />
      <GridItem
        name={'SUPPORT EMAIL'}
        value={
          <SupportEmail
            supportEmail={supportEmail}
            handleNewSupportEmail={handleNewSupportEmail}
            canEdit={canEdit}
            tenantId={tenantId}
          />
        }
      />
      <Divider className={classes.divider} />
      {supportedCapabilities?.entityType && (
        <>
          <GridItem
            name={'ENTITY TYPE'}
            value={
              <Typography variant="body1">
                {entityTypeDisplay ||
                  businessTypeFormatted.find(item => {
                    return item.type === entityType;
                  })?.display}
              </Typography>
            }
          />
          <Divider className={classes.divider} />
        </>
      )}
      {supportedCapabilities?.statementDescription && (
        <>
          <GridItem
            name={'STATEMENT DESCRIPTION'}
            value={
              <StatementDescription
                statementDescription={statementDescription}
                handleNewStatementDescription={handleNewStatementDescription}
                canEdit={canEdit}
                tenantId={tenantId}
              />
            }
          />
          <Divider className={classes.divider} />
        </>
      )}
      {supportedCapabilities?.refundPolicy && (
        <>
          <GridItem
            alert={refundNotPresent}
            name={'REFUND POLICY'}
            value={<RefundPolicy refundPolicy={refundPolicy} handleNewRefundPolicy={handleNewRefundPolicy} canEdit={canEdit} />}
          />
          <Divider className={classes.divider} />
        </>
      )}
      {supportedCapabilities?.feeSchedule && feeSchedule && (
        <GridItem
          name={'FEE SCHEDULE'}
          value={
            <Button size="small" color="primary" variant="outlined" href={feeSchedule} target="_blank" data-cy="fee-schedule">
              View Fee Schedule
            </Button>
          }
        />
      )}
    </Grid>
  );
};

export default BusinessInformation;
