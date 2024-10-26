import { format } from 'date-fns';

// Utility function to normalize dates to 'yyyy-MM-dd' format (local date)
export const normalizeDate = (date: Date | string): string => {
  return format(new Date(date), 'yyyy-MM-dd');
};
