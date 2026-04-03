import getCookie from "../cookies";

export const getSelectedInHandDate = (selectedDate?: Date) => {
  const dateTime: Date = new Date();
  const newDate = selectedDate ? selectedDate : new Date(dateTime);
  // Increment the month by 1
  newDate.setMonth(newDate.getMonth() + 1);
  const year = newDate.getFullYear().toString()
    .padStart(4, "0");
  const month = (newDate.getMonth() + 1)
    .toString().padStart(2, "0");
  const day = newDate.getDate().toString()
    .padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getDefaultInHandDate = () => {
  const dateObject = new Date(getSelectedInHandDate());
  const defaultDate = dateObject.toLocaleDateString(getCookie("NEXT_LOCALE"), { month: "2-digit", day: "2-digit", year: "numeric" });
  return defaultDate;
};
