import { IWeekday } from "@/types";

export const getWeekdayId = (
  weekdays: IWeekday[],
  date: Date | undefined
): string | undefined => {
  if (!date) return undefined;

  const dayIndex = (date.getDay() + 6) % 7; // Adjust index to start from Monday
  return weekdays ? weekdays[dayIndex].id : undefined;
};
