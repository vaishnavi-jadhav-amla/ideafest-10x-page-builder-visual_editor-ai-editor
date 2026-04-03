"use client";

import "../../common/table/rc-table.scss";

import { IReturnHistoryList, IReturnHistoryResponse } from "@znode/types/account/rma-return-order";
import React, { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { FilterOperators } from "@znode/utils/server";
import FilterSortComponent from "../../common/filter-sort/FilterSort";
import HeaderSort from "../../common/header-sort/HeaderSort";
import { Heading } from "../../common/heading";
import Link from "next/link";
import Pagination from "../../common/pagination/Pagination";
import { RETURN_ORDER } from "@znode/constants/return-order";
import { SETTINGS } from "@znode/constants/settings";
import TableWrapper from "../../common/table/TableWrapper";
import { Tooltip } from "../../common/tooltip";
import { ZIcons } from "../../common/icons";
import { getReturnOrderList } from "../../../http-request/account";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export const ReturnOrder = ({ isDashboard }: { isDashboard: boolean }) => {
  const Operators = [
    { text: "contains", value: FilterOperators.Contains },
    { text: "is", value: FilterOperators.Is },
    { text: "beginsWith", value: FilterOperators.StartsWith },
    { text: "endsWith", value: FilterOperators.EndsWith },
  ];

  const OperatorsOfDate = [
    { text: "on", value: FilterOperators.Between },
    { text: "after", value: FilterOperators.GreaterThan },
    { text: "before", value: FilterOperators.LessThan },
    { text: "onOrAfter", value: FilterOperators.GreaterThanOrEqual },
    { text: "onOrBefore", value: FilterOperators.LessThanOrEqual },
    { text: "notOn", value: FilterOperators.NotEquals },
  ];

  const returnOrderTranslations = useTranslations("ReturnOrder");
  const commonTranslations = useTranslations("Common");
  const router = useRouter();
  const [orderHistoryList, setOrderHistoryList] = useState<IReturnHistoryResponse>();
  const [loading, setIsLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [sortValue, setSortValue] = useState({});
  const [column, setColumn] = useState<string>("");
  const [sortFilter, setSortFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortDateFilter, setSortDateFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  const redirectionAction = (returnStatus: string, returnNumber: string, classNumber?: string) => {
    return returnStatus === RETURN_ORDER.NOT_SUBMITTED
      ? `/account/return-order/edit?orderNumber=${classNumber}&returnNumber=${returnNumber}`
      : `/account/return-order/receipt/${returnNumber}?isReceiptDetails=true`;
  };

  const columns = [
    {
      title: <HeaderSort currentSortColumn={column} headerKey="ClassNumber" columnName={returnOrderTranslations("returnNumber")} onSort={onColumnSort} />,
      dataIndex: "returnNumber",
      heading: returnOrderTranslations("returnNumber"),
      width: 100,
      displayOnMobile: true,
      key: "returnNumber",
      render: (returnNumber: string, record: IReturnHistoryList) => {
        return (
          <Link
            className="flex flex-wrap items-center justify-between underline cursor-pointer text-linkColor hover:text-hoverColor "
            href={redirectionAction(record.returnStatus, record.returnNumber, record.linkedClassNumber)}
            data-test-selector="linkReturnNumber"
            prefetch={true}
          >
            <div className="mr-2 ">{returnNumber}</div>
          </Link>
        );
      },
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="ClassStatus" columnName={returnOrderTranslations("returnStatus")} onSort={onColumnSort} />,
      dataIndex: "returnName",
      heading: returnOrderTranslations("returnStatus"),
      width: 100,
      key: "returnName",
      render: (returnName: string) => <div>{returnName}</div>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="OrderDate" columnName={returnOrderTranslations("returnDate")} onSort={onColumnSort} />,
      dataIndex: "returnDate",
      width: 100,
      heading: returnOrderTranslations("returnDate"),
      key: "returnDate",
      displayOnMobile: true,
      render: (returnDate: Date, record: IReturnHistoryList) => !(record.returnStatus === RETURN_ORDER.NOT_SUBMITTED ) ? returnDate : "",
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="Quantity" columnName={returnOrderTranslations("returnTotalQty")} onSort={onColumnSort} />,
      dataIndex: "totalExpectedReturnQuantity",
      width: 100,
      key: "totalExpectedReturnQuantity",
      heading: returnOrderTranslations("returnQty"),
      render: (totalExpectedReturnQuantity: number) => `${totalExpectedReturnQuantity}` || "0",
    },
    {
      title: commonTranslations("actions"),
      dataIndex: "",
      key: "actions",
      heading: "",
      width: 50,
      render: (record: IReturnHistoryList) => {
        return renderAction(record);
      },
    },
  ];
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const currentFilters = [sortDateFilter, sortFilter].filter((val) => val !== undefined && val !== null && val?.key !== "");
      const returnOrderList = await getReturnOrderList({
        pageSize,
        pageIndex,
        sortValue,
        currentFilters: currentFilters as { key: string; value: string; type: string; columns: { status: string; date: string } }[],
      });
      const returnList = returnOrderList?.data;
      if (returnList && returnList.returnList) {
        setOrderHistoryList(returnList);
      }
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, sortValue, sortFilter, sortDateFilter]);

  const onPageSizeChange = async (pageSize: number) => {
    setPageIndex(1);
    setIsLoading(true);
    setPageSize(pageSize);
  };

  const onPageIndexChange = async (pageIndex: number) => {
    setPageIndex(pageIndex);
    setIsLoading(true);
  };

  const onFilterClicked = (selectedOption: string, val: string, type: string) => {
    if (type === "status") {
      setSortFilter({ key: selectedOption, value: val, type: type, columns: { status: "ClassStatus", date: "OrderDate" } });
    }
    if (type === "date") {
      setSortDateFilter({ key: selectedOption, value: val, type: type, columns: { status: "ClassStatus", date: "OrderDate" } });
    }
  };

  const clearFilterValue = (type: string) => {
    if (type === "status") {
      setSortFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
    if (type === "date") {
      setSortDateFilter({ key: "", value: "", type: "", columns: { status: "", date: "" } });
    }
  };

  const ordersList = orderHistoryList?.returnList || [];
  const totalResults = orderHistoryList?.totalResults || 0;

  const renderAction = (record: IReturnHistoryList) => {
    return (
      <div className="flex">
        <Link prefetch={true} href={redirectionAction(record.returnStatus, record.returnNumber, record.linkedClassNumber)} className="mr-4" aria-label="Return details">
          <Tooltip message={commonTranslations("viewReturn")}>
            <ZIcons name="eye" />
          </Tooltip>
        </Link>
        {record.returnStatus === RETURN_ORDER.NOT_SUBMITTED && (
          <Link prefetch={true} href={`/account/return-order/edit?orderNumber=${record.linkedClassNumber}&returnNumber=${record.returnNumber}`}>
            <Tooltip message={commonTranslations("editReturn")}>
              <ZIcons name="pencil" height={"18px"} width={"18px"} strokeWidth={"2px"} />
            </Tooltip>
          </Link>
        )}
      </div>
    );
  };
  return (
    <>
      {!isDashboard && (
        <>
          <Heading name={returnOrderTranslations("returnOrderHistory")} dataTestSelector="hdgReturnOrderHistory" customClass="uppercase" level="h2" showSeparator />
          <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
            <div className="flex space-x-4">
              <div className="flex gap-8">
                <FilterSortComponent
                  buttonName={returnOrderTranslations("returnStatus")}
                  onFilterSortClick={onFilterClicked}
                  options={Operators}
                  defaultValue={0}
                  optionType={"status"}
                  inputValue={sortFilter}
                />
                {sortFilter && sortFilter?.type === "status" && (
                  <div className="relative">
                    <button
                      className="absolute text-gray-600 top-2 right-0"
                      data-test={"btnClearStatusFilter"}
                      onClick={() => {
                        clearFilterValue("status");
                      }}
                    >
                      <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-8">
                <FilterSortComponent
                  buttonName={returnOrderTranslations("returnDate")}
                  onFilterSortClick={onFilterClicked}
                  options={OperatorsOfDate}
                  defaultValue={1}
                  optionType={"date"}
                  inputValue={sortDateFilter}
                />
                {sortDateFilter && sortDateFilter?.type === "date" && (
                  <div className="relative">
                    <button
                      className="absolute text-gray-600 top-2 right-0"
                      data-test={"btnClearDateFilter"}
                      onClick={() => {
                        clearFilterValue("date");
                      }}
                    >
                      <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <Button type="primary" size="small" dataTestSelector="linkCreateReturn" onClick={() => router.push("/account/return-order/create")}>
                {returnOrderTranslations("createReturn")}
              </Button>
            </div>
          </div>
        </>
      )}
      <TableWrapper
        renderAction={renderAction}
        emptyText={returnOrderTranslations("noReturns")}
        columns={columns as []}
        loading={loading}
        expandedRowByKey="returnNumber"
        data={ordersList as []}
      />
      {ordersList?.length > 0 && !isDashboard && <Pagination totalResults={totalResults} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} />}
    </>
  );
};
