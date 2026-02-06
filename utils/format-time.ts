import dayjs from "@/lib/dayjs";

export const formatDuration = (durationMs: number): string => {
  const d = dayjs.duration(durationMs);
  const years = d.years();
  const months = d.months();
  const days = d.days();

  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} year${years > 1 ? "s" : ""}`);
  }
  if (months > 0) {
    parts.push(`${months} month${months > 1 ? "s" : ""}`);
  }
  if (days > 0 || parts.length === 0) {
    parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  }

  return parts.join(" ");
};
