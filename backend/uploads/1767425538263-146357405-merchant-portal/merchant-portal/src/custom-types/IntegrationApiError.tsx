import { IntegrationApiErrorDetails } from './IntegrationApiErrorDetails';

export interface IntegrationApiError {
  code?: string;
  message?: string;
  details?: IntegrationApiErrorDetails[];
}
