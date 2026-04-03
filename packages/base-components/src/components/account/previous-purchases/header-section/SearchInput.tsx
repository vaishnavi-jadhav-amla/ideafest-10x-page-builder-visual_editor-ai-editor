"use client";

import { ISearchInputProps } from "@znode/types/account";
import { Input } from "../../../common/input/Input";
import { ZIcons } from "../../../common/icons/ZIcons";
import { useState } from "react";

export default function SearchInput({ placeholder, onSearch, testSelector = "btnSearch" }: ISearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };
  const handleClickedOnSearchIcon = () => {
    if (searchQuery.length > 0) {
      onSearch(searchQuery);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="relative">
      <ZIcons
        onClick={handleClickedOnSearchIcon}
        name="search"
        height="18px"
        width="18px"
        data-test-selector={testSelector}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer"
      />
      <Input
        type="text"
        value={searchQuery}
        placeholder={placeholder}
        onChange={(event) => {
          const value = event.target.value;
          setSearchQuery(value);
          if (value.length === 0) {
            handleSearch("");
          }
        }}
        onKeyDown={handleKeyDown}
        className="w-full pt-1 pb-1 pl-10 placeholder-black border shadow-right-none"
      />
      {searchQuery && (
        <ZIcons
          onClick={handleClear}
          name="x"
          height="18px"
          width="18px"
          data-test-selector="btnClearSearch"
          className="absolute right-[9px] top-1/2 transform -translate-y-1/2 w-4 h-[95%] text-gray-400 cursor-pointer bg-white"
        />
      )}
    </div>
  );
}
