const dayInMilliseconds = 86_400_000;

export function todayInIndia(now: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    now,
  );
}

export function countDaysUntil(isoDate: string, today: string) {
  return Math.round(
    (Date.parse(`${isoDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      dayInMilliseconds,
  );
}
