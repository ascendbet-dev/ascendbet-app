export function formatDate(date: string) {
  return new Date(date).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    hour12: false,
  });
}

export function toUTCISOString(localDateTime: string) {
  return new Date(localDateTime).toISOString();
}

export function getTimeRemaining(targetDate: string) {
  const now = new Date().getTime(); // UTC internally
  const target = new Date(targetDate).getTime(); // also UTC

  const diff = target - now;

  if (diff <= 0) return 0;

  return diff;
}

export function parseLocalDateTime(value: string) {
  const [date, time] = value.split("T");

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute);
}