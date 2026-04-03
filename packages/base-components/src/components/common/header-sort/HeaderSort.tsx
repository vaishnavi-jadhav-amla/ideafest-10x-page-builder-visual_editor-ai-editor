"use client";

import { MoveDown, MoveUp } from "lucide-react";
import React, { useState } from "react";

import { SETTINGS } from "@znode/constants/settings";
import { UpDownIcon } from "../icons";
import { formatTestSelector } from "@znode/utils/common";

interface HeaderSortProps {
  onSort: (_key: string, _columnName: string, _direction: "ASC" | "DESC") => void;
  columnName: string;
  headerKey: string;
  currentSortColumn?: string;
  currentSortDirection?: "ASC" | "DESC";
  isVisible?: boolean;
  alignToCenter?: boolean;
  className?: string;
}

const HeaderSort: React.FC<HeaderSortProps> = ({ onSort, columnName, currentSortColumn, headerKey, isVisible, alignToCenter, className }) => {
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC" | null>(null);

  const handleSort = (direction: "ASC" | "DESC") => {
    onSort(headerKey, columnName, direction);
    setSortOrder(direction);
  };

  return (
    <div className={`flex ${alignToCenter ? "justify-center" : "items-center "}`}>
      <div className={`min-[378px]:w-max whitespace-nowrap ${className}`} data-test-selector={formatTestSelector("divHeader", columnName)}>
        {columnName}
      </div>
      {isVisible === false ? (
        ""
      ) : (
        <div className="flex flex-col items-center justify-center ml-2">
          {currentSortColumn !== columnName && (
            <div className="cursor-pointer" onClick={() => handleSort("ASC")} data-test-selector={formatTestSelector("btnSortUpDown", columnName)}>
              <UpDownIcon width="16px" height="16px" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} />
            </div>
          )}
          {sortOrder === "ASC" && currentSortColumn === columnName && (
            <div className="cursor-pointer" onClick={() => handleSort("DESC")} data-test-selector={formatTestSelector("divSortAscending", columnName)}>
              <MoveUp width="16px" height="16px" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} />
            </div>
          )}
          {sortOrder === "DESC" && currentSortColumn === columnName && (
            <div className="cursor-pointer" onClick={() => handleSort("ASC")} data-test-selector={formatTestSelector("divSortDescending", columnName)}>
              <MoveDown width="16px" height="16px" color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSort;
