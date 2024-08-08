import { IWeekday } from "@/types";

export const getWeekdayId = (
  weekdays: IWeekday[],
  date: Date | undefined
): string | undefined => {
  if (!date) return undefined;

  const dayIndex = (date.getDay() + 6) % 7; // Adjust index to start from Monday
  return weekdays ? weekdays[dayIndex].id : undefined;
};

export const statusClasses: { [key: string]: string } = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
  APPROVED: "bg-purple-100 text-purple-800",
};

// Map RHF's dirtyFields over the `data` received by `handleSubmit` and return the changed subset of that data.
export function dirtyValues(
  dirtyFields: object | boolean,
  allValues: object
): object {
  // If *any* item in an array was modified, the entire array must be submitted, because there's no way to indicate
  // "placeholders" for unchanged elements. `dirtyFields` is `true` for leaves.
  if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues;
  // Here, we have an object
  // @ts-ignore
  return Object.fromEntries(
    Object.keys(dirtyFields).map((key) => [
      key,
      // @ts-ignore
      dirtyValues(dirtyFields[key], allValues[key]),
    ])
  );
}
