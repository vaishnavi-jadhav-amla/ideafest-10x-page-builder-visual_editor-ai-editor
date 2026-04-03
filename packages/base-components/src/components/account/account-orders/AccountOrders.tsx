/* eslint-disable max-lines-per-function */
"use client";

import React, { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { FilterCollection } from "@znode/types/enums";
import FilterSortComponent from "../../common/filter-sort/FilterSort";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import HeaderSort from "../../common/header-sort/HeaderSort";
import Heading from "../../common/heading/Heading";
import Link from "next/link";
import Pagination from "../../common/pagination/Pagination";
import { SETTINGS } from "@znode/constants/settings";
import TableWrapper from "../../common/table/TableWrapper";
import { Tooltip } from "../../common/tooltip";
import { ZIcons } from "../../common/icons";
import { getAccountOrderList } from "../../../http-request";
import { useRouter } from "next/navigation";
import { useTranslationMessages } from "@znode/utils/component";

interface IFilterType {
  key: string;
  value: string;
  type: string;
  columns: { status: string; date?: string };
}
interface IAccountOrdersProps {
  userId: number;
}

export function AccountOrders({ userId }: IAccountOrdersProps) {
  const orderTranslations = useTranslationMessages("Orders");
  const commonTranslations = useTranslationMessages("Common");
  const [loading, setIsLoading] = useState<boolean>(true);
  const [column, setColumn] = useState<string>("");
  const [sortValue, setSortValue] = useState({});
  const [orderListData, setOrderListData] = useState([]);
  const [sortFilter, setSortFilter] = useState<IFilterType>();
  const [sortOrderNumberFilter, setSortOrderNumberFilter] = useState<IFilterType>();
  const [sortUserNameFilter, setSortUserNameFilter] = useState<IFilterType>();
  const [sortPaymentStatusFilter, setSortPaymentStatusFilter] = useState<IFilterType>();
  const [sortPaymentTypeFilter, setSortPaymentTypeFilter] = useState<IFilterType>();

  const [pageSize, setPageSize] = useState<number>(SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [TotalResults, setTotalResults] = useState<number>(0);
  const router = useRouter();

  const operators = [
    { text: "contains", value: FilterCollection.Contains },
    { text: "is", value: FilterCollection.Is },
    { text: "beginsWith", value: FilterCollection.StartsWith },
    { text: "endsWith", value: FilterCollection.EndsWith },
  ];

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  const onReceiptClick = (orderNumber: string) => {
    router.push(`/account/account-orders/details/${orderNumber}?receiptModule=true&returnAccount=true`);
  };

  const columns = [
    {
      title: <HeaderSort currentSortColumn={column} headerKey="classNumber" columnName={orderTranslations("orderNumber")} onSort={onColumnSort} />,
      dataIndex: "orderNumber",
      heading: orderTranslations("orderNumber"),
      key: "classNumber",
      displayOnMobile: true,
      width: 550,
      render: (orderNumber: string, record: { orderNumber: string }) => (
        <Link
          className="text-sm  text-linkColor hover:text-hoverColor underline"
          href={`/account/account-orders/details/${record.orderNumber}?receiptModule=true&returnAccount=true`}
          aria-label={orderNumber}
          data-test-selector={`linkOrderNumber${record.orderNumber}`}
        >
          {orderNumber}
        </Link>
      ),
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="customerName" columnName={orderTranslations("username")} onSort={onColumnSort} />,
      dataIndex: "userName",
      heading: orderTranslations("username"),
      key: "customerName",
      width: 300,
      render: (customerName: string, record: { orderNumber: string }) => <span data-test-selector={`spnUserName${record.orderNumber}`}>{customerName}</span>,
    },

    {
      title: <HeaderSort currentSortColumn={column} headerKey="classStatus" columnName={orderTranslations("orderStatus")} onSort={onColumnSort} />,
      dataIndex: "orderState",
      key: "classStatus",
      width: 300,
      displayOnMobile: true,
      heading: orderTranslations("OrderStatus"),
      render: (classStatus: string, record: { orderNumber: string }) => (
        <span className="capitalize" data-test-selector={`spnOrderStatus${record.orderNumber}`}>
          {classStatus.toLowerCase()}
        </span>
      ),
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="paymentStatus" columnName={orderTranslations("paymentStatus")} onSort={onColumnSort} />,
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 300,
      heading: orderTranslations("paymentStatus"),
      render: (paymentStatus: string, record: { orderNumber: string }) => <span data-test-selector={`spnPaymentStatus${record.orderNumber}`}>{paymentStatus}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="paymentName" columnName={orderTranslations("paymentType")} onSort={onColumnSort} />,
      dataIndex: "paymentType",
      key: "paymentName",
      width: 300,
      heading: orderTranslations("paymentType"),
      render: (paymentName: string, record: { orderNumber: string }) => <span data-test-selector={`spnPaymentType${record.orderNumber}`}>{paymentName}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="totalAmount" columnName={orderTranslations("orderAmount")} onSort={onColumnSort} />,
      dataIndex: "total",
      key: "totalAmount",
      heading: orderTranslations("orderAmount"),
      width: 300,
      showCurrencyCode: true,
      render: (total: number, record: { orderNumber: string; currencyCode: string }) => (
        <span data-test-selector={`spnOrderAmount${record.orderNumber}`}>
          <FormatPriceWithCurrencyCode price={total || 0} currencyCode={record.currencyCode} />
        </span>
      ),
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="createdDate" columnName={orderTranslations("orderDate")} onSort={onColumnSort} />,
      dataIndex: "orderDate",
      key: "createdDate",
      heading: orderTranslations("orderDate"),
      width: 300,
      render: (orderDate: string, record: { orderNumber: string }) => <span data-test-selector={`spnOrderDate${record.orderNumber}`}>{orderDate}</span>,
    },
    {
      title: <div className="pl-1">{commonTranslations("actions")}</div>,
      dataIndex: "",
      heading: "",
      key: "actions",
      width: 300,
      render: (orderId: { omsOrderId: number; orderNumber: string }) => renderAction(orderId),
    },
  ];

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const currentFilters = [sortFilter, sortOrderNumberFilter, sortUserNameFilter, sortPaymentStatusFilter, sortPaymentTypeFilter].filter(
        (val) => val !== undefined && val !== null && val?.key !== ""
      );
      const { data } = await getAccountOrderList({
        pageSize,
        pageIndex,
        sortValue,
        userId,
        currentFilters: currentFilters as { key: string; value: string; type: string; columns: { status: string; date: string } }[],
      });
      if (data.orderList.length > 0) {
        setOrderListData(data.orderList);
        setTotalResults(data.totalResults);
      } else {
        setOrderListData([]);
        setTotalResults(data.totalResult);
      }
    } catch (err) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onPageSizeChange = async (pageSize: number) => {
    setPageIndex(1);
    setPageSize(pageSize);
  };

  const onPageIndexChange = async (pageIndex: number) => {
    setPageIndex(pageIndex);
  };

  const onFilterClicked = (selectedOption: string, val: string, type: string) => {
    const applyFilter = { key: selectedOption, value: val, type: type, columns: { status: "OrderNumber" } };
    switch (type) {
      case "orderNumber":
        applyFilter.columns = { status: "classNumber" };
        setSortOrderNumberFilter(applyFilter);
        break;
      case "orderStatus":
        applyFilter.columns = { status: "classStatus" };
        setSortFilter(applyFilter);
        break;
      case "userName":
        applyFilter.columns = { status: "customerName" };
        setSortUserNameFilter(applyFilter);
        break;
      case "paymentStatus":
        applyFilter.columns = { status: "paymentStatus" };
        setSortPaymentStatusFilter(applyFilter);
        break;
      case "paymentType":
        applyFilter.columns = { status: "paymentName" };
        setSortPaymentTypeFilter(applyFilter);
        break;
      default:
        break;
    }
  };

  const clearFilterValue = (type: string) => {
    setIsLoading(true);
    const removeFilterData = { key: "", value: "", type: "", columns: { status: "" } };
    switch (type) {
      case "orderNumber":
        setSortOrderNumberFilter(removeFilterData);
        break;
      case "orderStatus":
        setSortFilter(removeFilterData);
        break;
      case "userName":
        setSortUserNameFilter(removeFilterData);
        break;
      case "paymentStatus":
        setSortPaymentStatusFilter(removeFilterData);
        break;
      case "paymentType":
        setSortPaymentTypeFilter(removeFilterData);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, pageIndex, sortValue, sortFilter, sortOrderNumberFilter, sortUserNameFilter, sortPaymentStatusFilter, sortPaymentTypeFilter]);

  const renderAction = (record: { orderNumber: string }) => {
    return (
      <div className="flex">
        <Button type="text" size="small" dataTestSelector={`btnView${record.orderNumber}`} onClick={() => onReceiptClick(record.orderNumber)}>
          <Tooltip message={commonTranslations("view")}>
            <ZIcons name="eye" data-test-selector={`svgView${record.orderNumber}`} />
          </Tooltip>
        </Button>
      </div>
    );
  };

  return (
    <div className="relative w-full">
      <div className="no-print">
        <Heading name={orderTranslations("accountOrders")} dataTestSelector="hdgAccountOrders" level="h1" customClass="uppercase" showSeparator />
        <div className="flex justify-between items-center mt-2 gap-2">
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-3">
              <FilterSortComponent
                buttonName={orderTranslations("orderNumber")}
                onFilterSortClick={onFilterClicked}
                options={operators}
                defaultValue={0}
                optionType={"orderNumber"}
                inputValue={sortOrderNumberFilter}
              />
              {sortOrderNumberFilter && sortOrderNumberFilter?.type === "orderNumber" && (
                <div
                  className="flex justify-center items-center cursor-pointer"
                  onClick={() => {
                    clearFilterValue("orderNumber");
                  }}
                >
                  <Tooltip message={commonTranslations("removeFilter")}>
                    <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="CloseOrderNumberFilter" />
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <FilterSortComponent
                buttonName={orderTranslations("username")}
                onFilterSortClick={onFilterClicked}
                options={operators}
                defaultValue={0}
                optionType={"userName"}
                inputValue={sortUserNameFilter}
              />
              {sortUserNameFilter && sortUserNameFilter?.type === "userName" && (
                <div
                  className="flex justify-center items-center cursor-pointer"
                  onClick={() => {
                    clearFilterValue("userName");
                  }}
                >
                  <Tooltip message={commonTranslations("removeFilter")}>
                    <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="CloseUserNameFilter" />
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <FilterSortComponent
                buttonName={orderTranslations("orderStatus")}
                onFilterSortClick={onFilterClicked}
                options={operators}
                defaultValue={0}
                optionType={"orderStatus"}
                inputValue={sortFilter}
              />
              {sortFilter && sortFilter?.type === "orderStatus" && (
                <div
                  className="flex justify-center items-center cursor-pointer"
                  onClick={() => {
                    clearFilterValue("orderStatus");
                  }}
                >
                  <Tooltip message={commonTranslations("removeFilter")}>
                    <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="CloseStatusFilter" />
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <FilterSortComponent
                buttonName={orderTranslations("paymentStatus")}
                onFilterSortClick={onFilterClicked}
                options={operators}
                defaultValue={0}
                optionType={"paymentStatus"}
                inputValue={sortPaymentStatusFilter}
              />
              {sortPaymentStatusFilter && sortPaymentStatusFilter?.type === "paymentStatus" && (
                <div
                  className="flex justify-center items-center cursor-pointer"
                  onClick={() => {
                    clearFilterValue("paymentStatus");
                  }}
                >
                  <Tooltip message={commonTranslations("removeFilter")}>
                    <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="ClosePaymentStatusFilter" />
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <FilterSortComponent
                buttonName={orderTranslations("paymentType")}
                onFilterSortClick={onFilterClicked}
                options={operators}
                defaultValue={0}
                optionType={"paymentType"}
                inputValue={sortPaymentTypeFilter}
              />
              {sortPaymentTypeFilter && sortPaymentTypeFilter?.type === "paymentType" && (
                <div
                  className="flex justify-center items-center cursor-pointer"
                  onClick={() => {
                    clearFilterValue("paymentType");
                  }}
                >
                  <Tooltip message={commonTranslations("removeFilter")}>
                    <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="ClosePaymentTypeFilter" />
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>
        <TableWrapper renderAction={renderAction} columns={columns as []} loading={loading} expandedRowByKey="OrderNumber" data={orderListData as []} />
        {orderListData && orderListData.length > 0 && <Pagination totalResults={TotalResults} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} />}
      </div>
    </div>
  );
}
