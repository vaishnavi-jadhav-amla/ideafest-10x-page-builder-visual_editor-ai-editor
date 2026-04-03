"use client";

import { IQuote, IQuoteResponse, IQuoteSearchByKey } from "@znode/types/account";
import { useEffect, useState } from "react";

import { AccountNameFilter } from "../../common/filter-sort/AccountNameFilter";
import Button from "../../common/button/Button";
import { FilterOperators } from "@znode/utils/server";
import FilterSortComponent from "../../common/filter-sort/FilterSort";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import HeaderSort from "../../common/header-sort/HeaderSort";
import Heading from "../../common/heading/Heading";
import { IUserAccountList } from "@znode/types/user";
import Link from "next/link";
import Pagination from "../../common/pagination/Pagination";
import { SETTINGS } from "@znode/constants/settings";
import TableWrapper from "../../common/table/TableWrapper";
import { Tooltip } from "../../common/tooltip";
import { LoadingSpinnerComponent, ZIcons } from "../../common/icons";
import { getQuoteList } from "../../../http-request/account/quote/quote-order-list";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useUser } from "../../../stores";
import { useCommonDetails } from "../../../stores/common";
interface IRecordType {
  classNumber: string;
  omsQuoteId: number;
  currencyCode?: string;
}
export const QuoteOrderList = () => {
   const { isEnableQuoteRequest } = useCommonDetails();
  const quoteTranslations = useTranslations("Quote");
  const commonTranslations = useTranslations("Common");
  const { user } = useUser();

  const [quoteOrderList, setQuoteOrderList] = useState<IQuoteResponse | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [sortValue, setSortValue] = useState({});
  const [column, setColumn] = useState<string>("");
  const [sortFilter, setSortFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const [sortDateFilter, setSortDateFilter] = useState<{ key: string; value: string; type: string; columns: { status: string; date: string } }>();
  const router = useRouter();
  const [totalResults, setTotalResults] = useState<number>(0);
  const [selectedAccountDetails, setSelectedAccountDetails] = useState<IUserAccountList | null>(null);

  const handleSelectedAccountDetails = (details: IUserAccountList | null) => {
    setSelectedAccountDetails(details);
  };

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

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  /**
   * Columns list which will display as header of the table
   */
  const columns = [
    {
      title: <HeaderSort currentSortColumn={column} headerKey="classNumber" columnName={quoteTranslations("quoteNumber")} onSort={onColumnSort} />,
      dataIndex: "classNumber",
      heading: quoteTranslations("quoteNumber"),
      key: "classNumber",
      displayOnMobile: true,
      render: (classNumber: string, record: IRecordType) => {
        return (
          <Link
            prefetch={true}
            className="flex flex-wrap items-center justify-between underline cursor-pointer text-linkColor hover:text-hoverColor "
            href={`/account/quote/details/${record.classNumber}`}
            data-test-selector={`linkQuoteNumber${record.classNumber}`}
          >
            <div className="mr-2 ">{classNumber}</div>
          </Link>
        );
      },
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="classStatus" columnName={quoteTranslations("quoteStatus")} onSort={onColumnSort} />,
      dataIndex: "classStatus",
      key: "classStatus",
      heading: quoteTranslations("quoteStatus"),
      render: (classStatus: string, record: IRecordType) => <span data-test-selector={`spnQuoteStatus${record.classNumber}`}>{classStatus}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="createdDate" columnName={quoteTranslations("createdDate")} onSort={onColumnSort} />,
      dataIndex: "createdDate",
      key: "createdDate",
      displayOnMobile: true,
      heading: quoteTranslations("createdDate"),
      render: (createdDate: string, record: IRecordType) => <span data-test-selector={`spnCreatedDate${record.classNumber}`}>{createdDate}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="expirationDate" columnName={quoteTranslations("expirationDate")} onSort={onColumnSort} />,
      dataIndex: "expirationDate",
      key: "expirationDate",
      heading: quoteTranslations("expirationDate"),
      render: (expirationDate: string, record: IRecordType) => (
        <span data-test-selector={`spnExpirationDate${record.classNumber}`}>{expirationDate === "Invalid Date" ? "-" : expirationDate}</span>
      ),
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="totalAmount" columnName={quoteTranslations("orderAmount")} onSort={onColumnSort} />,
      dataIndex: "total",
      key: "totalAmount",
      heading: quoteTranslations("orderAmount"),
      render: (total: number, record: IRecordType) => {
        return (
          <div data-test-selector={`divTotalAmount${record.classNumber}`}>
            <FormatPriceWithCurrencyCode price={total || 0} currencyCode={record?.currencyCode || "USD"} />
          </div>
        );
      },
    },
    {
      title: <div className="pl-2 text-center">{commonTranslations("actions")}</div>,
      dataIndex: "",
      heading: "",
      key: "actions",
      render: (record: IRecordType) => {
        return (
          <div className="flex justify-center">
            <Button
              type="text"
              size="small"
              dataTestSelector={`btnViewQuoteDetails${record.classNumber}`}
              aria-label="Quote details"
              onClick={() => router.push(`/account/quote/details/${record.classNumber}`)}
            >
              <Tooltip message={commonTranslations("view")}>
                <ZIcons name="eye" data-test-selector={`svgViewQuoteDetails${record.classNumber}`} />
              </Tooltip>
            </Button>
          </div>
        );
      },
    },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const currentFilters = [sortDateFilter, sortFilter].filter((val) => val !== undefined && val !== null && val?.key !== "");
      const quoteList = await getQuoteList({
        pageSize: pageSize,
        pageIndex: pageIndex,
        sortValue: sortValue,
        currentFilters: currentFilters as IQuoteSearchByKey[],
        status: "",
        accountId:selectedAccountDetails?.accountId||null
      });

      setQuoteOrderList({
        paginationDetail: quoteList?.paginationDetail,
        collectionDetails: quoteList?.collectionDetails,
        pageIndex: quoteList?.pageIndex,
        pageSize: quoteList?.pageSize,
        totalResults: quoteList?.totalResults,
        totalPages: quoteList?.totalPages,
      });

      setTotalResults(quoteList?.paginationDetail?.totalResults);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!isEnableQuoteRequest && isEnableQuoteRequest !== undefined) {
      router.push("/404");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnableQuoteRequest]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, pageIndex, sortValue, sortFilter, sortDateFilter,selectedAccountDetails?.accountId]);

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
      setSortFilter({ key: selectedOption, value: val, type: type, columns: { status: "classStatus", date: "classStatus" } });
    }
    if (type === "date") {
      setSortDateFilter({ key: selectedOption, value: val, type: type, columns: { status: "createdDate", date: "createdDate" } });
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

  const quoteList = quoteOrderList?.collectionDetails || [];
  const renderAction = (record: IQuote) => {
    return (
      <Button
        type="text"
        size="small"
        dataTestSelector="btnViewQuoteDetails"
        aria-label="Quote details"
        onClick={() => router.push(`/account/quote/details/${record.classNumber}`)}
      >
        <Tooltip message={quoteTranslations("view")}>
          <ZIcons name="eye" width={"20px"} />
        </Tooltip>
      </Button>
    );
  };
  return isEnableQuoteRequest? (
    <>
      <Heading name={quoteTranslations("quoteHistory")} level="h1" dataTestSelector="hdgQuoteHistory" customClass="uppercase" showSeparator />
      <div className="flex items-center justify-between mt-2">
        <div className="flex space-x-4">
          <div className="flex gap-8" data-test-selector="divQuoteStatusFilter">
            <FilterSortComponent
              buttonName={quoteTranslations("quoteStatus")}
              onFilterSortClick={onFilterClicked}
              options={operators}
              defaultValue={0}
              optionType={"status"}
              inputValue={sortFilter}
            />
            {sortFilter && sortFilter?.type === "status" && (
              <div className="relative">
                <button
                  className="absolute text-gray-600 top-2 right-0"
                  onClick={() => {
                    clearFilterValue("status");
                  }}
                >
                  <Tooltip message={commonTranslations("removeFilter")}>
                    <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="closeQuoteStatusFilter" />
                  </Tooltip>
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-8" data-test-selector="divQuoteDateFilter">
            <FilterSortComponent
              buttonName={quoteTranslations("quoteDate")}
              onFilterSortClick={onFilterClicked}
              options={operatorsOfDate}
              defaultValue={1}
              optionType={"date"}
              inputValue={sortDateFilter}
            />
            {sortDateFilter && sortDateFilter?.type === "date" && (
              <div className="relative">
                <button
                  className="absolute text-gray-600 top-2 right-0"
                  onClick={() => {
                    clearFilterValue("date");
                  }}
                >
                  <Tooltip message={commonTranslations("removeFilter")}>
                    <ZIcons name="x" strokeWidth={"1.5px"} color={`${SETTINGS.DEFAULT_ICONS_COLOR}`} data-test-selector="closeQuoteDateFilter" />
                  </Tooltip>
                </button>
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
      <TableWrapper renderAction={renderAction} columns={columns as []} loading={isLoading} expandedRowByKey="omsQuoteId" data={quoteList as []} />
      {quoteList?.length > 0 && totalResults && <Pagination totalResults={totalResults} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} />}
    </>
  ):
  (
     <LoadingSpinnerComponent />
  );
};

export default QuoteOrderList;
