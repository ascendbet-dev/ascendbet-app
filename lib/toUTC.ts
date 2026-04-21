export function toUTC(dateString: string) {
  const date = new Date(dateString);

  // Nigeria is UTC+1 → subtract 1 hour
  date.setHours(date.getHours() - 1);

  return date.toISOString();
}