export function toISO(dateString: string) {
    return new Date(dateString + ":00Z").toISOString();
  }