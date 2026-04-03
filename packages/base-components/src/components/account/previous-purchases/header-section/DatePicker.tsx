import "react-datepicker/dist/react-datepicker.css";
import "./datePicker.scss";

import React, { useEffect, useRef, useState } from "react";

import Button from "../../../common/button/Button";
import { ChevronDown } from "lucide-react";
import { IDateRangeProps } from "@znode/types/account";
import ReactDatePicker from "react-datepicker";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import { useTranslationMessages } from "@znode/utils/component";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

function DateDropDown(props: IDateRangeProps) {
  const { dateFormat, displayTimeZone, rangeSeparator = "to", calenderShow, isMobileScreen, timeFormat } = props;

  const commonTranslations = useTranslationMessages("Common");
  const previousPurchasesTranslations = useTranslationMessages("PreviousPurchases");
  const dateSelection = ["All Items", "Last 7 Days", "Last 30 Days"];
  const dateKeyValue = {
    ALL_ITEMS: "All Items",
    CUSTOM: "Custom",
    LAST_7_DAYS: "Last 7 Days",
    LAST_30_DAYS: "Last 30 Days",
  };
  const periods = [
    { key: "All Items", value: previousPurchasesTranslations("allItems") },
    { key: "Last 7 Days", value: previousPurchasesTranslations("last7Days") },
    { key: "Last 30 Days", value: previousPurchasesTranslations("last30Days") },
    { key: "Custom", value: previousPurchasesTranslations("custom") },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customDisplayDateRange, setCustomDisplayDateRange] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState("Last 7 Days");
  const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedDateRange, setSelectedDateRange] = useState<string>("Last 7 Days");
  const [dateRange, setDateRange] = useState<string>("");
  const [displayDateRange, setDisplayDateRange] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const getDateRangeFromPeriod = (period: string) => {
    const now = dayjs().tz(displayTimeZone);
    let start: dayjs.Dayjs;

    switch (period) {
      case dateKeyValue.LAST_7_DAYS:
        start = now.subtract(7, "day");
        break;
      case dateKeyValue.LAST_30_DAYS:
        start = now.subtract(30, "day");
        break;
      default:
        start = now;
    }

    // Set start date to 12:00 AM and end date to 11:59 PM
    const startWithTime = start.startOf("day");
    const endWithTime = now.endOf("day");

    return {
      start: formatDateTimeWithTime(startWithTime.toDate()),
      end: formatDateTimeWithTime(endWithTime.toDate()),
      displayStart: formatDisplayDate(startWithTime.toDate()),
      displayEnd: formatDisplayDate(endWithTime.toDate()),
    };
  };

  function splitDateRangeString(dateRangeString: string) {
    return dateRangeString.split(` ${rangeSeparator} `);
  }

  const handledDateChange = (key: string) => {
    setSelectedDateRange(key);

    if (key === dateKeyValue.ALL_ITEMS) {
      setDateRange(key);
      setDisplayDateRange(key);
    }
    if (key === dateKeyValue.CUSTOM) {
      if (!dateSelection.includes(selectedPeriod)) {
        const selectedDateDetails = splitDateRangeString(selectedPeriod);
        setCustomDateRange([new Date(selectedDateDetails[0]), new Date(selectedDateDetails[1])]);
      } else {
        setCustomDateRange([null, null]);
      }
    } else if (key !== dateKeyValue.CUSTOM && key !== dateKeyValue.ALL_ITEMS) {
      const { start, end, displayStart, displayEnd } = getDateRangeFromPeriod(key);
      setDateRange(`${start} ${rangeSeparator} ${end}`);
      setDisplayDateRange(`${displayStart} ${rangeSeparator} ${displayEnd}`);
    }
  };

  const handleApply = () => {
    if (selectedDateRange === dateKeyValue.ALL_ITEMS) {
      props.handleFilterDayChange(dateKeyValue.ALL_ITEMS);
    } else if (dateRange) {
      props.handleFilterDayChange(dateRange);
    }
    if (selectedDateRange === dateKeyValue.CUSTOM) {
      setSelectedPeriod(displayDateRange);
    } else {
      setSelectedPeriod(selectedDateRange);
      setCustomDisplayDateRange("");
    }

    setIsDropdownOpen(false);
  };

  const handleCancel = () => {
    setDateRange("");
    setDisplayDateRange("");
    setSelectedDateRange(selectedPeriod);
    setIsDropdownOpen(false);
  };

  const formatDateTimeWithTime = (date: Date | null): string => {
    if (!date) return "";
    if (dateFormat && timeFormat && displayTimeZone) {
      return dayjs(date).tz(displayTimeZone)
.format(`${dateFormat} ${timeFormat}`);
    } else if (dateFormat && displayTimeZone) {
      // If timeFormat is not available, use default time format
      return dayjs(date).tz(displayTimeZone)
.format(`${dateFormat} HH:mm:ss A`);
    }
    return dayjs(date).format();
  };

  const formatDisplayDate = (date: Date | null): string => {
    if (!date) return "";
    if (dateFormat && displayTimeZone) {
      return dayjs(date).tz(displayTimeZone)
.format(dateFormat);
    }
    return dayjs(date).format();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (!isDropdownOpen) return;
    const target = event.target as Node;
    const clickedInside = dropdownRef.current?.contains(target);
    if (!clickedInside) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDropdownOpen]);

  const handledDateRangeChange = (dates: [Date | null, Date | null]) => {
    if (dates[0] && dates[1]) {
      const updatedStart = dates[0];
      const updatedEnd = dates[1];
      setCustomDateRange([updatedStart, updatedEnd]);

      const startWithTime = dayjs(updatedStart).startOf("day");
      const endWithTime = dayjs(updatedEnd).endOf("day");

      const formattedWithTime = `${formatDateTimeWithTime(startWithTime.toDate())} ${rangeSeparator} ${formatDateTimeWithTime(endWithTime.toDate())}`;
      const formattedDisplay = `${formatDisplayDate(startWithTime.toDate())} ${rangeSeparator} ${formatDisplayDate(endWithTime.toDate())}`;

      setDateRange(formattedWithTime);
      setDisplayDateRange(formattedDisplay);
      setCustomDisplayDateRange(`Custom: ${formatDisplayDate(startWithTime.toDate())} to ${formatDisplayDate(endWithTime.toDate())}`);
    } else {
      setCustomDateRange(dates);
    }
  };

  // Common Tailwind classes
  const buttonClasses = "flex items-center gap-2 px-3 py-2 border rounded-md bg-white hover:bg-gray-50";
  const dropdownClasses = `absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-20 p-3 ${
    selectedDateRange === dateKeyValue.CUSTOM ? (isMobileScreen ? "w-[400px]" : "w-[660px]") : ""
  }`;
  const periodsContainerClasses = selectedDateRange === dateKeyValue.CUSTOM ? (isMobileScreen ? "w-20 border-r mr-2" : "w-32 border-r mr-2") : "w-full";
  const periodButtonClasses = (isSelected: boolean) =>
    `w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${isSelected ? "bg-gray-100 font-semibold" : ""}`;
  const actionsContainerClasses = "flex justify-end gap-2 border-t pt-2";

  return (
    <div>
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button title={selectedPeriod} data-test-selector="btnPeriod" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={buttonClasses}>
          <span className="block truncate whitespace-nowrap overflow-hidden flex-1 text-left">{customDisplayDateRange ? customDisplayDateRange : selectedPeriod}</span>
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        </button>

        {isDropdownOpen && (
          <div className={dropdownClasses}>
            <div className="flex">
              <div className={periodsContainerClasses}>
                {periods.map((period) => (
                  <button
                    key={period.key}
                    onClick={() => {
                      handledDateChange(period.key);
                      if (period.key === dateKeyValue.CUSTOM) {
                        setDateRange("");
                        setDisplayDateRange("");
                      }
                    }}
                    data-test-selector={`btnPeriod${period.key}`}
                    className={periodButtonClasses(selectedDateRange === period.key)}
                  >
                    {period.value}
                  </button>
                ))}
              </div>
              {selectedDateRange === dateKeyValue.CUSTOM && (
                <div className="black-datepicker ml-1 mb-1">
                  <ReactDatePicker
                    selectsRange
                    inline
                    fixedHeight
                    dateFormat={`${dateFormat}`}
                    monthsShown={calenderShow}
                    startDate={customDateRange[0]}
                    endDate={customDateRange[1]}
                    onChange={handledDateRangeChange}
                  />
                </div>
              )}
            </div>
            <div className={actionsContainerClasses}>
              <Button onClick={handleCancel} type="secondary" ariaLabel="cancel period" dataTestSelector="btnCancelPeriod">
                {commonTranslations("cancel")}
              </Button>
              <Button onClick={handleApply} type="primary" ariaLabel="apply period" dataTestSelector="btnApplyPeriod">
                {commonTranslations("apply")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DateDropDown;
