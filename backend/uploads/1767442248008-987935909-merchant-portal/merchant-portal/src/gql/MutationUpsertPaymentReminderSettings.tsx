import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import gql from 'graphql-tag';
import {
  MutationUpdatePaymentReminderSettingsArgs,
  UpdatePaymentReminderSettingsInput,
  UpdatePaymentReminderSettingsStatus,
} from '../gql-types.generated';
import { getStandardHeaders } from '../util/StandardRequestHeaders';

// eslint-disable-next-line @typescript-eslint/naming-convention
const MUTATION_UPSERT_PAYMENT_REMINDER_SETTINGS = gql`
  mutation updatePaymentReminderSettings($input: UpdatePaymentReminderSettingsInput!) {
    updatePaymentReminderSettings(input: $input) {
      code
      message
      error
    }
  }
`;

export const mutationUpdatePaymentReminderSettings = async (
  client: ApolloClient<NormalizedCacheObject>,
  options: UpdatePaymentReminderSettingsInput,
): Promise<UpdatePaymentReminderSettingsStatus | undefined> => {
  const {
    dueDateReminderDays,
    overdueReminderDays,
    overdueReminderMessage,
    reminderMessage,
    sendDueDateReminder,
    sendOverdueReminder,
  } = options;
  const headers = await getStandardHeaders();
  const { data, errors } = await client.mutate<
    { updatePaymentReminderSettings: UpdatePaymentReminderSettingsStatus },
    MutationUpdatePaymentReminderSettingsArgs
  >({
    variables: {
      input: {
        dueDateReminderDays,
        overdueReminderDays,
        overdueReminderMessage,
        reminderMessage,
        sendDueDateReminder,
        sendOverdueReminder,
      },
    },
    mutation: MUTATION_UPSERT_PAYMENT_REMINDER_SETTINGS,
    context: {
      headers,
    },
  });
  if (errors && errors.length > 0) {
    errors.forEach(error => {
      // Log error details in the console.
      console.error(error);
    });
    // Friendly error to the person.
    throw new Error('An error has occurred while updating payment reminder settings.');
  }

  if (data && data.updatePaymentReminderSettings) {
    return data.updatePaymentReminderSettings;
  }

  return undefined;
};
