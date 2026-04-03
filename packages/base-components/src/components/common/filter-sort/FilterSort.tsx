"use client";

import "./filter-sort.scss";

import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SearchIcon, ZIcons } from "../icons";

import Button from "../../common/button/Button";
import { DatePicker } from "../../common/date-picker";
import { FilterCollection } from "@znode/types/enums";
import { SETTINGS } from "@znode/constants/settings";
import { formatTestSelector } from "@znode/utils/common";
import { useTranslationMessages } from "@znode/utils/component";

interface FilterSortComponentProps {
  buttonName: string;
  optionType: string;
  options: { text: string; value: string }[];
  onFilterSortClick: (_arg1: string, _arg2: string, _arg3: string) => void;
  defaultValue: number;
  inputValue?: IInput | null;
}
interface IInput {
  key: string;
  value: string;
  type: string;
  columns: {
    status: string;
    date?: string;
  };
}

const FilterSortComponent: React.FC<FilterSortComponentProps> = ({ buttonName, onFilterSortClick, options, defaultValue, optionType, inputValue }) => {
  const t = useTranslationMessages("Common");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [optionValue, setOptionValue] = useState<string>("");
  const [isElementOverflow, setIsElementOverflow] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  const contentClassRef = useRef<string>("");

  const resizeHandler = () => {
    const rightSideNode: HTMLCollectionOf<Element> = document.getElementsByClassName(`${contentClassRef.current}`);
    if (rightSideNode && rightSideNode.length > 0) {
      const firstEle = rightSideNode[0];
      const windowRight = document.body.getBoundingClientRect().right;
      const rightEdge = firstEle.getBoundingClientRect().right + 50;
      const diff = windowRight - rightEdge;
      if (diff <= 0) {
        !isElementOverflow && setIsElementOverflow(true);
      } else {
        isElementOverflow && setIsElementOverflow(false);
      }
    } else {
      isElementOverflow && setIsElementOverflow(false);
    }
  };
  useEffect(() => {
    options && options[defaultValue]?.value && setSelectedOption(options[defaultValue]?.value || "");
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    contentClassRef.current = buttonName.split(" ").join("");
    window.addEventListener("resize", resizeHandler);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      document.removeEventListener("click", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resizeHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (dateString === "") {
      return dateString;
    }
    const formattedDate = date.toLocaleString("en-US").split(", ");
    let value = "";
    switch (selectedOption) {
      case FilterCollection.Between: //ON
        value = `'${formattedDate[0]} 12:00:00 AM' AND '${formattedDate[0]} 11:59:59 pm'`;
        break;
      case FilterCollection.GreaterThan: //After
        value = `'${formattedDate[0]} 11:59:59 pm'`;
        break;
      case FilterCollection.LessThan: //Before
        value = `'${formattedDate[0]} 12:00:00 AM'`;
        break;
      case FilterCollection.GreaterThanOrEqual: //On and After
        value = `'${formattedDate[0]} 12:00:00 AM'`;
        break;
      case FilterCollection.LessThanOrEqual: //On and Before
        value = `'${formattedDate[0]} 11:59:59 pm'`;
        break;
      case FilterCollection.NotEquals: //Not On
        value = `${formattedDate[0]} 12:00:00 AM`;
        break;
    }
    return value;
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOptionValue(value);
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;
    setOptionValue(value);
    if (e.keyCode === 13) {
      onSearchClick(optionType);
    }
  };

  useEffect(() => {
    inputValue && inputValue?.key === "" && setOptionValue("");
  }, [inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  const onSearchClick = (type: string) => {
    const value = type === "date" ? formatDate(optionValue) : optionValue;
    value !== "" && onFilterSortClick(selectedOption, value, type);
    setIsOpen(false);
  };

  const renderFilter = () => {
    return (
      <>
        {optionType === "date" ? (
          <DatePicker selectedDate={optionValue} onDateChange={handleDateChange} />
        ) : (
          <input type="text" className="w-[124px] p-2 h-10 input" value={optionValue} onKeyUp={handleKeyUp} onChange={handleDateChange} />
        )}
        <div
          data-test-selector={optionType === "date" ? "divFilterSearchDateExecute" : "divFilterSearchStatusExecute"}
          className="pb-1 ml-2 cursor-pointer"
          onClick={() => {
            onSearchClick(optionType);
          }}
        >
          <SearchIcon />
        </div>
      </>
    );
  };

  return (
    <div ref={componentRef} className="relative inline-block">
      <Button
        onClick={handleToggle}
        dataTestSelector={`btn${buttonName}`}
        endIcon={
          <ZIcons name="chevron-down" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector={formatTestSelector("svgChevronDown", `${buttonName}`)} />
        }
        className="px-2 py-1 rounded-none hover:bg-white border-slate-400"
        ariaLabel={buttonName}
        size="small"
      >
        <span className="py-1">{buttonName}</span>
      </Button>
      {isOpen && (
        <div className={`popover ${isElementOverflow && "element-overflow"}`}>
          <div className={`arrow-container ${isElementOverflow && "element-overflow"}`}>
            <div className="arrow-border"></div>
            <div className="arrow-center "></div>
          </div>
          <div className={`content ${contentClassRef.current}`}>
            <div className={`flex gap-2 ${isElementOverflow ? " flex-col items-start " : "max-[460px]:flex-col max-[460px]:items-start "}`}>
              <div className="relative">
                <select
                  data-test-selector={`drp${buttonName && buttonName.replace(/ /g, "")}`}
                  value={selectedOption}
                  onChange={handleChange}
                  className="appearance-none h-10 p-2 mr-2 pr-5 input"
                >
                  {options.map((option, index) => (
                    <option data-test-selector={`opt${option?.text}`} key={index} value={option?.value} selected={index === defaultValue ? true : false}>
                      {option?.text ? t(option?.text) : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0.5 flex items-center px-2 pointer-events-none">
                  <ZIcons name="chevron-down" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgArrowDown" />
                </div>
              </div>
              <div className="flex items-center gap-2 ">{renderFilter()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSortComponent;
