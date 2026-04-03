/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import "./date-picker.scss";

import React, { useRef } from "react";

import { IGeneralSetting } from "@znode/types/general-setting";
import { SWR_DEFAULT_PARAMS } from "@znode/constants/swr";
import { convertDate } from "@znode/utils/component";
import { getGeneralSettingList } from "../../../http-request/common/common-client-api";
import useSWR from "swr";
import { useTranslations } from "next-intl";

interface IDatePicker {
  selectedDate: string;
  onDateChange: (_arg1: any) => void;
  minDate?: string;
  maxDate?: string;
  generalSetting?: IGeneralSetting;
  dateClasses?: string;
  onDateBlur?: () => void;
}

export function DatePicker({ selectedDate, onDateChange, minDate, maxDate, generalSetting, dateClasses = "", onDateBlur }: IDatePicker) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const commonTranslations = useTranslations("Common");

  const { data } = useSWR(!generalSetting ? "/generalSettings" : null, getGeneralSettingList, {
    revalidateIfStale: SWR_DEFAULT_PARAMS.REVALIDATE_IF_STALE,
    revalidateOnFocus: SWR_DEFAULT_PARAMS.REVALIDATE_ON_FOCUS,
    revalidateOnReconnect: SWR_DEFAULT_PARAMS.REVALIDATE_ON_RECONNECT,
  });

  function onDateFocus() {
    dateInputRef.current && dateInputRef.current.click();
  }

  const convertedDate = selectedDate ? convertDate(selectedDate, generalSetting?.dateFormat ?? data?.dateFormat) : "";

  return (
    <div className="relative flex flex-col" data-test-selector="divDateSelectorContainer">
      <input
        type="text"
        onFocus={onDateFocus}
        onClick={() => {
          dateInputRef && dateInputRef.current?.showPicker();
        }}
        onBlur={onDateBlur}
        data-test-selector={"txtDateSelector"}
        className={`date-picker border p-2 h-10 border-inputColor cursor-pointer w-[130px] ${dateClasses}`}
        value={convertedDate ?? " "}
        aria-label="Select Date"
        readOnly
        title={commonTranslations("showDatePicker")}
      />
      <input type="date" ref={dateInputRef} className="w-0 h-0 bg-transparent focus:outline-none focus-visible:shadow-none focus-visible:outline-none" value={selectedDate || ""} onChange={onDateChange} min={minDate} max={maxDate}  aria-label="Select a date"/>
    </div>
  );
}
