"use client";

import { ICollectionDetails, IQuoteSearchByKey } from "@znode/types/account";
import React, { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { FilterOperators } from "@znode/utils/server";
import FilterSortComponent from "../../common/filter-sort/FilterSort";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import HeaderSort from "../../common/header-sort/HeaderSort";
import { Heading } from "../../common/heading";
import Link from "next/link";
import { LoaderComponent } from "../../common/loader-component/LoaderComponent";
import { ORDER_DATA_TYPE } from "@znode/constants/order";
import { PAGINATION } from "@znode/constants/pagination";
import { PENDING_APPROVAL_STATUS } from "@znode/constants/pending-order";
import Pagination from "../../common/pagination/Pagination";
import { SETTINGS } from "@znode/constants/settings";
import TableWrapper from "../../common/table/TableWrapper";
import { Tooltip } from "../../common/tooltip";
import { ZIcons } from "../../common/icons";
import { getPendingOrderHistory } from "../../../http-request/account/pending-order/pending-order-list/pending-order-list";
import { pendingOrderDetails } from "../../../http-request/account/pending-order/pending-order-details/pending-order-details";
import { useRouter } from "next/navigation";
import { useToast } from "../../../stores/toast";
import { useTranslations } from "next-intl";

export function PendingOrderList() {
  const pendingOrderTranslation = useTranslations("ApprovalRouting");
  const commonTranslation = useTranslations("Common");

  const [pageSize, setPageSize] = useState<number>(PAGINATION.DEFAULT_TABLE_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalResults, setTotalResults] = useState(0);
  const [sortValue, setSortValue] = useState<Record<string, string>>({});
  const [column, setColumn] = useState<string>("");

  const [pendingOrderList, setPendingOrderList] = useState<ICollectionDetails[] | undefined>();
  const [loading, setIsLoading] = useState<boolean>(true);
  const [sortOrderTypeFilter, setSortOrderTypeFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortCustomerNameFilter, setSortCustomerNameFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortAccountNameFilter, setSortAccountNameFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortOrderStatusFilter, setSortOrderStatusFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortDateFilter, setSortDateFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortAmountFilter, setSortAmountFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [loadingViewAction, setLoadingViewAction] = useState<Set<string>>(new Set());

  const router = useRouter();
  const { error } = useToast();

  const operators = [
    { text: "contains", value: FilterOperators.Contains },
    { text: "is", value: FilterOperators.Is },
    { text: "beginsWith", value: FilterOperators.StartsWith },
    { text: "endsWith", value: FilterOperators.EndsWith },
  ];

  const operatorsOfDate = [
    { text: "on", value: FilterOperators.Between },
    { text: "after", value: FilterOperators.GreaterThan },
    { text: "before", value: FilterOperators.LessThan },
    { text: "onOrAfter", value: FilterOperators.GreaterThanOrEqual },
    { text: "onOrBefore", value: FilterOperators.LessThanOrEqual },
    { text: "notOn", value: FilterOperators.NotEquals },
  ];

  const operatorsOfAmount = [
    { text: "equals", value: FilterOperators.Equals },
    { text: "greaterThan", value: FilterOperators.GreaterThan },
    { text: "greaterOrEqual", value: FilterOperators.GreaterThanOrEqual },
    { text: "lessThan", value: FilterOperators.LessThan },
    { text: "lessOrEqual", value: FilterOperators.LessThanOrEqual },
  ];

  const clearFilterValue = (type: string) => {
    if (type === "orderType") {
      setSortOrderTypeFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
    if (type === "customerName") {
      setSortCustomerNameFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
    if (type === "accountName") {
      setSortAccountNameFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
    if (type === "orderStatus") {
      setSortOrderStatusFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
    if (type === "date") {
      setSortDateFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
    if (type === "amount") {
      setSortAmountFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
  };

  const onFilterClicked = (selectedOption: string, val: string, type: string) => {
    if (type === "orderType") {
      setSortOrderTypeFilter({ key: selectedOption, value: val, type: type, columns: { status: "orderType", date: "orderType" } });
    }
    if (type === "customerName") {
      setSortCustomerNameFilter({ key: selectedOption, value: val, type: type, columns: { status: "customerName", date: "customerName" } });
    }
    if (type === "accountName") {
      setSortAccountNameFilter({ key: selectedOption, value: val, type: type, columns: { status: "accountName", date: "accountName" } });
    }
    if (type === "orderStatus") {
      setSortOrderStatusFilter({ key: selectedOption, value: val, type: type, columns: { status: "classStatus", date: "classStatus" } });
    }
    if (type === "date") {
      setSortDateFilter({ key: selectedOption, value: val, type: type, columns: { status: "createdDate", date: "createdDate" } });
    }
    if (type === "amount") {
      setSortAmountFilter({ key: selectedOption, value: val, type: type, columns: { status: "totalAmount", date: "totalAmount" } });
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const currentFilters = [sortOrderTypeFilter, sortCustomerNameFilter, sortAccountNameFilter, sortOrderStatusFilter, sortDateFilter, sortAmountFilter].filter(
        (val) => val !== undefined && val !== null && val?.key !== ""
      );
      const pendingOrderList = await getPendingOrderHistory({
        pageSize: pageSize,
        pageIndex: pageIndex,
        sortValue: sortValue,
        currentFilters: currentFilters as IQuoteSearchByKey[],
        status: PENDING_APPROVAL_STATUS.PENDING_ORDER,
      });
      setPendingOrderList(pendingOrderList?.collectionDetails);
      setTotalResults(pendingOrderList?.totalResults);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  const onReceiptClick = async (order: ICollectionDetails) => {
    setLoadingViewAction((prevSet) => new Set(prevSet.add(order.classNumber ?? "")));

    const orderDetails = await pendingOrderDetails({ orderType: ORDER_DATA_TYPE.APPROVAL_ROUTING, orderNumber: order.classNumber });
    const lineItemDetails = orderDetails?.orderLineItems;

    if (!lineItemDetails || lineItemDetails.length === 0) {
      error(pendingOrderTranslation("errorMessageForDisableProduct"));
      setLoadingViewAction((prevSet) => {
        const newSet = new Set(prevSet);
        newSet.delete(order.classNumber ?? "");
        return newSet;
      });
      return;
    }
    setLoadingViewAction((prevSet) => {
      const newSet = new Set(prevSet);
      newSet.delete(order.classNumber ?? "");
      return newSet;
    });
    router.push(`/account/pending-order/details?orderNumber=${order.classNumber}&isPendingPayment=false&receiptModule=true`);
  };

  const onPageSizeChange = async (pageSize: number) => {
    setPageIndex(1);
    setIsLoading(true);
    setPageSize(pageSize);
  };

  const onPageIndexChange = async (pageIndex: number) => {
    setPageIndex(pageIndex);
    setIsLoading(true);
  };

  /**
   * Columns list which will display as the header of the table
   */
  const columns = [
    {
      title: <HeaderSort currentSortColumn={column} columnName={pendingOrderTranslation("orderNumber")} headerKey="classNumber" onSort={onColumnSort} />,
      dataIndex: "classNumber",
      key: "classNumber",
      heading: pendingOrderTranslation("orderNumber"),
      displayOnMobile: true,
      render: (classNumber: string, record: ICollectionDetails) => (
        <Link
          href={`/account/pending-order/details?orderNumber=${record.classNumber}&isPendingPayment=false&receiptModule=true`}
          className="underline text-linkColor hover:text-hoverColor"
        >
          {classNumber}
        </Link>
      ),
    },
    {
      title: (
        <div>
          <HeaderSort currentSortColumn={column} columnName={pendingOrderTranslation("orderType")} headerKey="orderType" onSort={onColumnSort} />
        </div>
      ),
      heading: pendingOrderTranslation("orderType"),
      dataIndex: "orderType",
      key: "orderType",
    },

    {
      title: <HeaderSort currentSortColumn={column} columnName={pendingOrderTranslation("customerName")} headerKey="customerName" onSort={onColumnSort} />,
      dataIndex: "customerName",
      key: "customerName",
      heading: pendingOrderTranslation("customerName"),
    },
    {
      title: <HeaderSort currentSortColumn={column} columnName={pendingOrderTranslation("accountName")} headerKey="accountName" onSort={onColumnSort} />,
      dataIndex: "accountName",
      key: "AccountName",
      heading: pendingOrderTranslation("accountName"),
    },
    {
      title: <HeaderSort currentSortColumn={column} columnName={pendingOrderTranslation("orderStatus")} headerKey="classStatus" onSort={onColumnSort} className="w-max" />,
      dataIndex: "classStatus",
      key: "classStatus",
      heading: pendingOrderTranslation("orderStatus"),
      displayOnMobile: true,
      render: (text: string) => <span className="capitalize">{text.toLowerCase()}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} columnName={pendingOrderTranslation("orderAmount")} headerKey="totalAmount" onSort={onColumnSort} />,
      dataIndex: "total",
      key: "totalAmount",
      showCurrencyCode: true,
      render: (total: number, record: Record<string, string>) => {
        return <FormatPriceWithCurrencyCode price={total || 0} currencyCode={record?.currencyCode || "USD"} />;
      },
      heading: pendingOrderTranslation("orderAmount"),
    },
    {
      title: <HeaderSort currentSortColumn={column} columnName={pendingOrderTranslation("createdDate")} headerKey="CreatedDate" onSort={onColumnSort} />,
      dataIndex: "createdDate",
      heading: pendingOrderTranslation("createdDate"),
      key: "createdDate",
      render: (date: string) => date,
    },
    {
      title: <div className="pl-1">{commonTranslation("actions")}</div>,
      width: 75,
      dataIndex: "",
      heading: "",
      key: "actions",
      render: (record: ICollectionDetails) => renderAction(record),
    },
  ];

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortAccountNameFilter, sortAmountFilter, sortCustomerNameFilter, sortOrderTypeFilter, sortDateFilter, sortOrderStatusFilter, sortValue, pageSize, pageIndex]);

  const accountQuotes = pendingOrderList;

  const renderAction = (record: ICollectionDetails) => {
    return (
      <div className="flex justify-center">
        <Button type="text" size="small" dataTestSelector="btnViewOrder" aria-label={"Pending order details"} onClick={() => onReceiptClick(record)}>
          {loadingViewAction.has(record.classNumber || "") ? (
            <LoaderComponent isLoading={loadingViewAction.has(record.classNumber || "")} width="15px" height="15px" />
          ) : (
            <Tooltip message={commonTranslation("view")}>
              <ZIcons name="eye" />
            </Tooltip>
          )}
        </Button>
      </div>
    );
  };
  return (
    <>
      <Heading name={pendingOrderTranslation("pendingOrder")} dataTestSelector="hdgPendingOrder" customClass="uppercase" level="h1" showSeparator />
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-3" data-test-selector="divOrderType">
          <FilterSortComponent
            buttonName={pendingOrderTranslation("orderType")}
            onFilterSortClick={onFilterClicked}
            options={operators}
            defaultValue={0}
            optionType={"orderType"}
            inputValue={sortOrderTypeFilter}
          />
          {sortOrderTypeFilter && sortOrderTypeFilter?.type === "orderType" && (
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() => {
                clearFilterValue("orderType");
              }}
            >
              <Tooltip message={commonTranslation("removeFilter")}>
                <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="closeOrderTypeFilter" />
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex gap-3" data-test-selector="divCustomerName">
          <FilterSortComponent
            buttonName={pendingOrderTranslation("customerName")}
            onFilterSortClick={onFilterClicked}
            options={operators}
            defaultValue={0}
            optionType={"customerName"}
            inputValue={sortCustomerNameFilter}
          />
          {sortCustomerNameFilter && sortCustomerNameFilter?.type === "customerName" && (
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() => {
                clearFilterValue("customerName");
              }}
            >
              <Tooltip message={commonTranslation("removeFilter")}>
                <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="closeCustomerNameFilter" />
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex gap-3" data-test-selector="divAccountName">
          <FilterSortComponent
            buttonName={pendingOrderTranslation("accountName")}
            onFilterSortClick={onFilterClicked}
            options={operators}
            defaultValue={0}
            optionType={"accountName"}
            inputValue={sortAccountNameFilter}
          />
          {sortAccountNameFilter && sortAccountNameFilter?.type === "accountName" && (
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() => {
                clearFilterValue("accountName");
              }}
            >
              <Tooltip message={commonTranslation("removeFilter")}>
                <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="closeAccountNameFilter" />
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex gap-3" data-test-selector="divOrderStatus">
          <FilterSortComponent
            buttonName={pendingOrderTranslation("orderStatus")}
            onFilterSortClick={onFilterClicked}
            options={operators}
            defaultValue={0}
            optionType={"orderStatus"}
            inputValue={sortOrderStatusFilter}
          />
          {sortOrderStatusFilter && sortOrderStatusFilter?.type === "orderStatus" && (
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() => {
                clearFilterValue("orderStatus");
              }}
            >
              <Tooltip message={commonTranslation("removeFilter")}>
                <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="closeOrderStatusFilter" />
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex gap-3" data-test-selector="divOrderAmount">
          <FilterSortComponent
            buttonName={pendingOrderTranslation("orderAmount")}
            onFilterSortClick={onFilterClicked}
            options={operatorsOfAmount}
            defaultValue={1}
            optionType={"amount"}
            inputValue={sortAmountFilter}
          />
          {sortAmountFilter && sortAmountFilter?.type === "amount" && (
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() => {
                clearFilterValue("amount");
              }}
            >
              <Tooltip message={commonTranslation("removeFilter")}>
                <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="closeAmountFilter" />
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex gap-3" data-test-selector="divOrderDate">
          <FilterSortComponent
            buttonName={pendingOrderTranslation("createdDate")}
            onFilterSortClick={onFilterClicked}
            options={operatorsOfDate}
            defaultValue={1}
            optionType={"date"}
            inputValue={sortDateFilter}
          />
          {sortDateFilter && sortDateFilter?.type === "date" && (
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() => {
                clearFilterValue("date");
              }}
            >
              <Tooltip message={commonTranslation("removeFilter")}>
                <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="CloseDateFilter" />
              </Tooltip>
            </div>
          )}
        </div>
      </div>
      <TableWrapper renderAction={renderAction} columns={columns as []} loading={loading} expandedRowByKey="OmsQuoteId" data={accountQuotes as []} />
      {pendingOrderList && pendingOrderList.length > 0 && <Pagination totalResults={totalResults || 0} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} />}
    </>
  );
}
