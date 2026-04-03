"use client";

import { ITool, IToolsDropdownProps } from "@znode/types/account";
import { useEffect, useRef, useState } from "react";

import { ChevronDown } from "lucide-react";
import { useTranslationMessages } from "@znode/utils/component";

export default function ToolsDropdown({ tools, onToolSelect, isMobile = false, testSelector }: IToolsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const previousPurchasesTranslations = useTranslationMessages("PreviousPurchases");

  const handleClickOutside = (event: MouseEvent) => {
    if (!isOpen) return;
    const target = event.target as Node;
    const clickedInside = dropdownRef.current?.contains(target);
    if (!clickedInside) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleToolSelect = (tool: ITool) => {
    setIsOpen(false);
    onToolSelect(tool);
  };

  const buttonClasses = isMobile
    ? "flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none font-medium text-gray-700"
    : "flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50 focus:outline-none font-medium text-gray-700";

  const dropdownClasses = isMobile
    ? "absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-20"
    : "absolute top-full right-0 mt-1 w-[140px] bg-white border rounded-md shadow-lg z-20";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        data-test-selector={testSelector}
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
      >
        <span>{isMobile ? previousPurchasesTranslations("tools") : "Tools"}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className={dropdownClasses}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              data-test-selector={`btnTool${tool.id}`}
              onClick={() => handleToolSelect(tool)}
              className="w-full whitespace-nowrap text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md flex items-center gap-2"
            >
              {tool.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
