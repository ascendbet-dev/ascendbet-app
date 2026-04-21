export function parseLocalToUTC(dateString: string) {
  const [date, time] = dateString.split("T");

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  // Create date in LOCAL timezone (Lagos)
  const localDate = new Date(year, month - 1, day, hour, minute);

  // Convert to UTC ISO safely
  return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString();
}