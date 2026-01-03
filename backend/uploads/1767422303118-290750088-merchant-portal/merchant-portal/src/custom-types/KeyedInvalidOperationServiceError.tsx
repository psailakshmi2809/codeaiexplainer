export interface KeyedInvalidOperationServiceError {
  values: Record<string, unknown>[];
  message?: string;
  error?: Error;
  reasonCode: string;
  reasonDetail?: string;
}
