"use client";

import { useEffect, useRef, useState } from "react";

import { IOrderNumberSelectionProps } from "@znode/types/order";
import { NoRecordFound } from "../../common/no-record-found/NoRecordFound";
import { getEligibleOrderList } from "../../../http-request/order/order";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../../stores/user-store";

export default function OrderNumberSelection({ disabled = false, defaultSelection, handleChangeOrderNumber }: IOrderNumberSelectionProps) {
  const commonTranslations = useTranslationMessages("Common");
  const [isOpen, setIsOpen] = useState(false);
  const [eligibleList, setEligibleList] = useState<{ code: string }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(defaultSelection || null);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const optionsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listContainerRef = useRef<HTMLDivElement | null>(null); 

  const filteredOptions = eligibleList?.filter((option) => option.code.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    (disabled || (defaultSelection && defaultSelection?.length > 0)) && setSelectedOption(defaultSelection || null);
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSelection]);

  const handleSelect = (code: string) => {
    setSelectedOption(code);
    handleChangeOrderNumber(code);
    setSearchTerm("");
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen((prev) => {
        if (!prev) {
          setFocusedIndex(-1);
          setSearchTerm("");
        }
        return !prev;
      });
    }
  };

  const scrollFocusedItemIntoView = (index: number) => {
    const container = listContainerRef.current;
    const item = optionsRefs.current[index];

    if (!container || !item) return;

    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;

    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;

    if (itemTop < containerTop) {
      container.scrollTop = itemTop;
    } else if (itemBottom > containerBottom) {
      container.scrollTop = itemBottom - container.clientHeight;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredOptions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (focusedIndex + 1) % filteredOptions.length;
      setFocusedIndex(nextIndex);
      scrollFocusedItemIntoView(nextIndex);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (focusedIndex - 1 + filteredOptions.length) % filteredOptions.length;
      setFocusedIndex(prevIndex);
      scrollFocusedItemIntoView(prevIndex);
    }

    if (e.key === "Enter" && focusedIndex >= 0) {
      handleSelect(filteredOptions[focusedIndex].code);
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const fetchEligibleList = async () => {
    const list = await getEligibleOrderList();
    setEligibleList(list as { code: string }[]);
  };

  useEffect(() => {
    if ((user?.userId ?? 0) === 0) return;
    fetchEligibleList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  return (
    <div className="w-full max-w-md mx-auto relative" ref={dropdownRef} tabIndex={0} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-56 bg-white border border-gray-300 rounded-md py-1 px-4 flex items-center focus:outline-none justify-between text-gray-700 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={disabled || (user?.userId ?? 0) === 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate" title={selectedOption as string}>
          {selectedOption || commonTranslations("allOrders")}
        </span>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-0 w-56 z-10 bg-white shadow-lg max-h-60 rounded-md py-1 pt-0 overflow-auto focus:outline-none sm:text-sm">
          <div className="sticky top-0 z-20 bg-white px-2 py-2">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus-visible:outline-none focus-visible:shadow-none"
              placeholder={commonTranslations("allOrders")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="py-1" ref={listContainerRef}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.code}
                  role="option"
                  aria-selected={selectedOption === option.code}
                  className={`cursor-pointer select-none relative py-2 px-4 text-sm
          ${selectedOption === option.code ? "bg-gray-50 font-bold" : ""}
          ${focusedIndex === index ? "bg-blue-100" : ""}
          hover:bg-gray-100`}
                  onClick={() => handleSelect(option.code)}
                  ref={(el) => {
                    optionsRefs.current[index] = el!;
                  }}
                >
                  <p className="block truncate" title={option.code}>
                    {option.code}
                  </p>
                </div>
              ))
            ) : (
              <div className="cursor-default select-none relative py-2 pl-3 pr-3 text-gray-500">
                <NoRecordFound size="small" text={commonTranslations("noOptionsFound")} customClass="mx-1" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
