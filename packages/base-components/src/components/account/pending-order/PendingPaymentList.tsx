"use client";

import { ICollectionDetails, IQuoteSearchByKey } from "@znode/types/account";
import { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { FilterOperators } from "@znode/utils/server";
import FilterSortComponent from "../../common/filter-sort/FilterSort";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import HeaderSort from "../../common/header-sort/HeaderSort";
import Heading from "../../common/heading/Heading";
import Link from "next/link";
import { PAGINATION } from "@znode/constants/pagination";
import { PENDING_APPROVAL_STATUS } from "@znode/constants/pending-order";
import Pagination from "../../common/pagination/Pagination";
import { SETTINGS } from "@znode/constants/settings";
import TableWrapper from "../../common/table/TableWrapper";
import { Tooltip } from "../../common/tooltip";
import { ZIcons } from "../../common/icons/ZIcons";
import { getPendingOrderHistory } from "../../../http-request/account/pending-order/pending-order-list/pending-order-list";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export const PendingPaymentHistory = () => {
  const router = useRouter();
  const pendingPaymentTranslation = useTranslations("ApprovalRouting");
  const commonTranslation = useTranslations("Common");

  const [pendingPaymentList, setPendingPaymentList] = useState<ICollectionDetails[]>([]);
  const [loading, setIsLoading] = useState<boolean>(true);
  const [column, setColumn] = useState<string>("");
  const [sortValue, setSortValue] = useState({});
  const [sortCustomerNameFilter, setSortCustomerNameFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortAccountNameFilter, setSortAccountNameFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortOrderStatusFilter, setSortOrderStatusFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortDateFilter, setSortDateFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortAmountFilter, setSortAmountFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [pageSize, setPageSize] = useState<number>(PAGINATION.DEFAULT_TABLE_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalResults, setTotalResults] = useState(0);

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

  const onPageSizeChange = async (pageSize: number) => {
    setPageIndex(1);
    setIsLoading(true);
    setPageSize(pageSize);
  };

  const onPageIndexChange = async (pageIndex: number) => {
    setPageIndex(pageIndex);
    setIsLoading(true);
    fetchData();
  };

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  const onReceiptClick = (order: ICollectionDetails) => {
    router.push(`/account/pending-payment/details?orderNumber=${order?.classNumber}&isPendingPayment=true&receiptModule=true`);
  };

  const fetchData = async () => {
    try {
      const currentFilters = [sortCustomerNameFilter, sortAccountNameFilter, sortOrderStatusFilter, sortDateFilter, sortAmountFilter].filter(
        (val) => val !== undefined && val !== null && val?.key !== ""
      );
      const pendingPaymentList = await getPendingOrderHistory({
        pageSize: pageSize,
        pageIndex: pageIndex,
        sortValue: sortValue,
        currentFilters: currentFilters as IQuoteSearchByKey[],
        status: PENDING_APPROVAL_STATUS.PENDING_PAYMENT,
      });
      setTotalResults(pendingPaymentList?.totalResults);
      setPendingPaymentList(pendingPaymentList?.collectionDetails);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: (
        <div>
          <HeaderSort currentSortColumn={column} columnName={pendingPaymentTranslation("pendingOrderID")} headerKey="classNumber" onSort={onColumnSort} />
        </div>
      ),
      heading: pendingPaymentTranslation("pendingOrderID"),
      dataIndex: "classNumber",
      key: "classNumber",
      render: (classNumber: string, record: ICollectionDetails) => (
        <Link
          href={`/account/pending-payment/details?orderNumber=${record?.classNumber}&isPendingPayment=true&receiptModule=true`}
          className="text-linkColor hover:text-hoverColor underline"
          data-test-selector={`linkPendingOrder${record.classNumber}`}
        >
          {classNumber}
        </Link>
      ),
    },
    {
      title: <HeaderSort currentSortColumn={column} columnName={pendingPaymentTranslation("customerName")} headerKey="customerName" onSort={onColumnSort} />,
      dataIndex: "customerName",
      heading: pendingPaymentTranslation("customerName"),
      key: "customerName",
      displayOnMobile: true,
      render: (customerName: string, record: ICollectionDetails) => <span data-test-selector={`spnCustomerName${record.classNumber}`}>{customerName}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} columnName={pendingPaymentTranslation("accountName")} headerKey="accountName" onSort={onColumnSort} />,
      dataIndex: "accountName",
      key: "accountName",
      heading: pendingPaymentTranslation("accountName"),
      render: (accountName: string, record: ICollectionDetails) => <span data-test-selector={`spnAccountName${record.classNumber}`}>{accountName}</span>,
    },
    {
      title: (
        <HeaderSort
          className="min-[436px]:!w-max min-[378px]:!w-auto max-[400px]:w-[124px] max-[400px]:overflow-hidden max-[400px]:text-ellipsis"
          currentSortColumn={column}
          columnName={pendingPaymentTranslation("orderStatus")}
          headerKey="classStatus"
          onSort={onColumnSort}
        />
      ),
      dataIndex: "classStatus",
      key: "classStatus",
      heading: pendingPaymentTranslation("orderStatus"),
      displayOnMobile: true,
      render: (classStatus: string, record: ICollectionDetails) => <span data-test-selector={`spnOrderStatus${record.classNumber}`}>{classStatus}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} columnName={pendingPaymentTranslation("orderAmount")} headerKey="totalAmount" onSort={onColumnSort} />,
      dataIndex: "total",
      key: "totalAmount",
      showCurrencyCode: true,
      render: (total: number, record: ICollectionDetails) => (
        <span data-test-selector={`spnTotalAmount${record.classNumber}`}>
          <FormatPriceWithCurrencyCode price={total || 0} currencyCode={record?.currencyCode || "USD"} />
        </span>
      ),
      heading: pendingPaymentTranslation("orderAmount"),
    },
    {
      title: <HeaderSort currentSortColumn={column} columnName={pendingPaymentTranslation("createdDate")} headerKey="CreatedDate" onSort={onColumnSort} />,
      dataIndex: "createdDate",
      key: "createdDate",
      heading: pendingPaymentTranslation("createdDate"),
      render: (date: string, record: ICollectionDetails) => <span data-test-selector={`spnCreatedDate${record.classNumber}`}>{date}</span>,
    },
    {
      title: <div className="pl-1">{commonTranslation("actions")}</div>,
      width: 75,
      dataIndex: "",
      key: "actions",
      heading: "",
      render: (order: ICollectionDetails) => renderAction(order),
    },
  ];

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortCustomerNameFilter, sortAccountNameFilter, sortDateFilter, sortValue, sortAmountFilter, sortOrderStatusFilter, pageIndex, pageSize]);

  const renderAction = (order: ICollectionDetails) => {
    return (
      <div className="flex">
        <Button
          type="text"
          size="small"
          dataTestSelector={`btnView${order.classNumber}`}
          className="mr-2"
          aria-label={"Pending order details"}
          onClick={() => onReceiptClick(order)}
        >
          <Tooltip message={commonTranslation("view")}>
            <ZIcons name="eye" data-test-selector={`svgView${order.classNumber}`} />
          </Tooltip>
        </Button>
      </div>
    );
  };

  return (
    <>
      <Heading name={pendingPaymentTranslation("pendingPayment")} dataTestSelector="hdgPendingPayment" customClass="uppercase" level="h1" showSeparator />
      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-3" data-test-selector="divCustomerName">
          <FilterSortComponent
            buttonName={pendingPaymentTranslation("customerName")}
            onFilterSortClick={onFilterClicked}
            options={operators}
            defaultValue={0}
            optionType={"customerName"}
            inputValue={sortCustomerNameFilter}
          />
          {sortCustomerNameFilter && sortCustomerNameFilter?.type === "customerName" && (
            <div
              className="flex justify-center items-center cursor-pointer"
              onClick={() => {
                clearFilterValue("customerName");
              }}
            >
              <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="closeCustomerNameFilter" />
            </div>
          )}
        </div>
        <div className="flex gap-3" data-test-selector="divAccountName">
          <FilterSortComponent
            buttonName={pendingPaymentTranslation("accountName")}
            onFilterSortClick={onFilterClicked}
            options={operators}
            defaultValue={0}
            optionType={"accountName"}
            inputValue={sortAccountNameFilter}
          />
          {sortAccountNameFilter && sortAccountNameFilter?.type === "accountName" && (
            <div
              className="flex justify-center items-center cursor-pointer"
              onClick={() => {
                clearFilterValue("accountName");
              }}
            >
              <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="closeAccountNameFilter" />
            </div>
          )}
        </div>
        <div className="flex gap-3" data-test-selector="divPendingOrderStatus">
          <FilterSortComponent
            buttonName={pendingPaymentTranslation("orderStatus")}
            onFilterSortClick={onFilterClicked}
            options={operators}
            defaultValue={0}
            optionType={"orderStatus"}
            inputValue={sortOrderStatusFilter}
          />
          {sortOrderStatusFilter && sortOrderStatusFilter?.type === "orderStatus" && (
            <div
              className="flex justify-center items-center cursor-pointer"
              onClick={() => {
                clearFilterValue("orderStatus");
              }}
            >
              <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="closeOrderStatusFilter" />
            </div>
          )}
        </div>
        <div className="flex gap-3" data-test-selector="divPendingOrderAmount">
          <FilterSortComponent
            buttonName={pendingPaymentTranslation("orderAmount")}
            onFilterSortClick={onFilterClicked}
            options={operatorsOfAmount}
            defaultValue={1}
            optionType={"amount"}
            inputValue={sortAmountFilter}
          />
          {sortAmountFilter && sortAmountFilter?.type === "amount" && (
            <div
              className="flex justify-center items-center cursor-pointer"
              onClick={() => {
                clearFilterValue("amount");
              }}
            >
              <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="closeAmountFilter" />
            </div>
          )}
        </div>
        <div className="flex gap-3" data-test-selector="divCreatedDate">
          <FilterSortComponent
            buttonName={pendingPaymentTranslation("createdDate")}
            onFilterSortClick={onFilterClicked}
            options={operatorsOfDate}
            defaultValue={1}
            optionType={"date"}
            inputValue={sortDateFilter}
          />
          {sortDateFilter && sortDateFilter?.type === "date" && (
            <div
              className="flex justify-center items-center cursor-pointer"
              onClick={() => {
                clearFilterValue("date");
              }}
            >
              <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="CloseDateFilter" />
            </div>
          )}
        </div>
      </div>
      <TableWrapper renderAction={renderAction} columns={columns as []} loading={loading} expandedRowByKey="classNumber" data={pendingPaymentList as []} />
      {pendingPaymentList && pendingPaymentList?.length > 0 && (
        <Pagination totalResults={totalResults || 0} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} />
      )}
    </>
  );
};
