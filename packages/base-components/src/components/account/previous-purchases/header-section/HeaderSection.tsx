"use client";

import DateDropDown from "./DatePicker";
import { IHeaderProps } from "@znode/types/account";
import SearchInput from "./SearchInput";
import ToolsDropdown from "./ToolsDropdown";
import { useTranslationMessages } from "@znode/utils/component";

export default function HeaderBar(props: IHeaderProps) {
  const { handleAddToCart, handleSearch, dateDetails } = props;
  const previousPurchasesTranslations = useTranslationMessages("PreviousPurchases");
  const commonTranslations = useTranslationMessages("Common");
  
  const tools = [{ id: "addToCart", label: commonTranslations("addToCart") }];

  const handleToolSelect = (tool: { id: string; label: string }) => {
    if (tool.id === "addToCart") {
      handleAddToCart();
    }
  };

  const containerClasses = "w-full bg-white border-b py-3";
  const desktopLayoutClasses = "items-center gap-4 max-w-full hidden md:flex";
  const mobileLayoutClasses = " items-center gap-4 max-w-full flex md:hidden";
  const searchContainerClasses = "flex-1 relative max-w-full";
  const toolsContainerClasses = "flex items-center gap-3 flex-shrink-0";

  return (
    <div className={containerClasses}>
      <div className={desktopLayoutClasses}>
        <DateDropDown
          isMobileScreen={false}
          handleFilterDayChange={props.handleFilterDayChange}
          calenderShow={2}
          rangeSeparator="and"
          dateFormat={dateDetails.dateFormat}
          displayTimeZone={dateDetails.displayTimeZone}
          timeFormat="hh:mm:ss a"
        />
        <div className={searchContainerClasses}>
          <SearchInput placeholder={previousPurchasesTranslations("searchPlaceholder")} onSearch={handleSearch} testSelector="btnSearch" />
        </div>
        <div className={toolsContainerClasses}>
          <ToolsDropdown tools={tools} onToolSelect={handleToolSelect} testSelector="btnTools" />
        </div>
      </div>
      <div className={mobileLayoutClasses}>
        <DateDropDown
          isMobileScreen={true}
          handleFilterDayChange={props.handleFilterDayChange}
          calenderShow={1}
          rangeSeparator="and"
          dateFormat={dateDetails.dateFormat}
          displayTimeZone={dateDetails.displayTimeZone}
          timeFormat="hh:mm:ss a"
        />
        <div className={searchContainerClasses}>
          <SearchInput placeholder={previousPurchasesTranslations("searchPlaceholder")} onSearch={handleSearch} testSelector="btnSearch" />
        </div>
        <div className={toolsContainerClasses}>
          <ToolsDropdown tools={tools} onToolSelect={handleToolSelect} testSelector="btnTools" />
        </div>
      </div>
    </div>
  );
}
