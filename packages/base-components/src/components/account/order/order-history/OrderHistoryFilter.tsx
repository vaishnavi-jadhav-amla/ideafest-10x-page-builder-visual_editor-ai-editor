import React, { useCallback, useEffect, useState } from "react";

import { FilterOperators } from "@znode/utils/server";
import FilterSortComponent from "../../../common/filter-sort/FilterSort";
import { SETTINGS } from "@znode/constants/settings";
import { Tooltip } from "../../../common/tooltip";
import { ZIcons } from "../../../common/icons";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../../../stores";
import { AccountNameFilter } from "../../../common/filter-sort/AccountNameFilter";
import { IUserAccountList } from "@znode/types/user";

interface IFilter {
  key: string;
  value: string;
  type: string;
  columns: { status: string; date: string };
}

interface OrderHistoryFilterProps {
  isInvoiceBtnShow: boolean;
  onFilterChange: (_filters: IFilter[], _accountId:  number|null) => void;
}

const operators = [
  { text: "contains", value: FilterOperators.Contains },
  { text: "is", value: FilterOperators.Is },
  { text: "beginsWith", value: FilterOperators.StartsWith },
  { text: "endsWith", value: FilterOperators.EndsWith },
];

const dateOperators = [
  { text: "on", value: FilterOperators.Between },
  { text: "after", value: FilterOperators.GreaterThan },
  { text: "before", value: FilterOperators.LessThan },
  { text: "onOrAfter", value: FilterOperators.GreaterThanOrEqual },
  { text: "onOrBefore", value: FilterOperators.LessThanOrEqual },
  { text: "notOn", value: FilterOperators.NotEquals },
];

const OrderHistoryFilter: React.FC<OrderHistoryFilterProps> = ({ isInvoiceBtnShow, onFilterChange }) => {
  const orderHistoryTranslation = useTranslationMessages("OrderHistory");
  const commonTranslation = useTranslationMessages("Common");
  const { user } = useUser();
  const [sortFilter, setSortFilter] = useState<IFilter | null>(null);
  const [sortDateFilter, setSortDateFilter] = useState<IFilter | null>(null);
  const [selectedAccountDetails, setSelectedAccountDetails] = useState<IUserAccountList | null>(null);

  const handleSelectedAccountDetails = (details: IUserAccountList|null) => {
    setSelectedAccountDetails(details);
  };
  const handleFilterChange = useCallback((key: string, value: string, type: string) => {
    if (type === "status") {
      setSortFilter({ key, value, type, columns: { status: "ClassStatus", date: "ClassStatus" } });
    } else if (type === "date") {
      setSortDateFilter({ key, value, type, columns: { status: "OrderDate", date: "OrderDate" } });
    }
  }, []);

  const getFilterObj = (obj: IFilter, type: "status" | "date") => {
    return {
      key: obj?.key,
      value: obj?.value,
      type: obj?.type,
      columns: {
        status: type === "status" ? obj?.columns?.status : "",
        date: type === "date" ? obj?.columns?.date : "",
      },
    };
  };
  useEffect(() => {
    const filterDataPayload = [];
    if (sortFilter) filterDataPayload.push(getFilterObj(sortFilter, "status"));
    if (sortDateFilter) filterDataPayload.push(getFilterObj(sortDateFilter, "date"));
    onFilterChange(filterDataPayload,selectedAccountDetails?.accountId||null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortFilter, sortDateFilter,selectedAccountDetails?.accountId]);

  const clearFilterValue = (type: string) => {
    if (type === "status") {
      setSortFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    } else if (type === "date") {
      setSortDateFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
  };

  if (!isInvoiceBtnShow) return null;

  return (
    <div className="flex justify-between items-center mt-2 gap-2">
      <div className="flex space-x-4">
        <div className="flex gap-3" data-test-selector="divOrderStatus">
          <FilterSortComponent
            buttonName={orderHistoryTranslation("orderStatus")}
            onFilterSortClick={(key, value, type) => handleFilterChange(key, value, type)}
            options={operators}
            defaultValue={0}
            optionType="status"
            inputValue={sortFilter}
          />
          {sortFilter && sortFilter.type === "status" && (
            <div className="flex justify-center items-center cursor-pointer" onClick={() => clearFilterValue("status")}>
              <Tooltip message={commonTranslation("removeFilter")}>
                <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgRemoveStatusFilter" />
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex gap-3" data-test-selector="divOrderDate">
          <FilterSortComponent
            buttonName={orderHistoryTranslation("orderDate")}
            onFilterSortClick={(key, value, type) => handleFilterChange(key, value, type)}
            options={dateOperators}
            defaultValue={1}
            optionType="date"
            inputValue={sortDateFilter}
          />
          {sortDateFilter && sortDateFilter.type === "date" && (
            <div className="flex justify-center items-center cursor-pointer" onClick={() => clearFilterValue("date")}>
              <Tooltip message={commonTranslation("removeFilter")}>
                <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="svgRemoveDateFilter" />
              </Tooltip>
            </div>
          )}
        </div>
        {user?.accountCode && (
          <div data-test-selector="divAccountName">
            <AccountNameFilter accountCode={user?.accountCode} {...{ handleSelectedAccountDetails, selectedAccountDetails }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryFilter;
