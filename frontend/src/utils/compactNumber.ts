import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

export const formatCompactNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`; 
  }
  if (num >= 1_000) {
    return `${Math.floor(num / 1000)}k`; 
  }
  return `${num}`;
};

export function formatShortTime(date: Date): string {
  const now = new Date();
  const minutes = differenceInMinutes(now, date);

  if (minutes < 60) return `${minutes}m`;
  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours}h`;
  const days = differenceInDays(now, date);
  return `${days}d`;
}