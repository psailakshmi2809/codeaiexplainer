import { DateTime } from 'luxon';

export const PayoutReportDisplayName = (startTime: string, endTime: string): string => {
  const reportStartDate = DateTime.fromISO(startTime).toUTC();
  const reportLatestDate = DateTime.fromISO(endTime).toUTC();
  const daysDifference = reportLatestDate.diff(reportStartDate, 'days').days;
  let prefix = daysDifference > 2 ? 'W/E ' : '';
  prefix = daysDifference > 7 ? 'M/E ' : prefix;

  return `${prefix}${reportLatestDate.toFormat('MM/dd/yyyy')}`;
};
