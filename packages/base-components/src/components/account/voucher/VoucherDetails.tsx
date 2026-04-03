"use client";

import { IVoucherDetailsResponse, IVoucherList } from "@znode/types/account";
import { LoadingSpinnerComponent, ZIcons } from "../../common/icons";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Button from "../../common/button/Button";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import HeaderSort from "../../common/header-sort/HeaderSort";
import Heading from "../../common/heading/Heading";
import Link from "next/link";
import Pagination from "../../common/pagination/Pagination";
import { SETTINGS } from "@znode/constants/settings";
import { Separator } from "../../common/separator";
import TableWrapper from "../../common/table/TableWrapper";
import { Tooltip } from "../../common/tooltip";
import { getVoucherDetails } from "../../../http-request";
import { useTranslationMessages } from "@znode/utils/component";

interface IRecordType {
  currencyCode: string;
  orderNumber?: string;
  omsOrderId?: number;
  giftCardId?: number;
}
interface IDynamicData {
  [key: string]: string | number | unknown;
}

export const VoucherDetails = ({ cardId }: { cardId: number | string }) => {
  const voucherTranslation = useTranslationMessages("Voucher");
  const commonTranslation = useTranslationMessages("Common");
  const [voucherDetails, setVoucherDetails] = useState<IVoucherDetailsResponse>();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const paramData = useSearchParams();
  const [column, setColumn] = useState<string>("");
  const [sortValue, setSortValue] = useState({});
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
  const [totalResults, setTotalResults] = useState<number>(0);

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const voucherDetails = await getVoucherDetails({ cardId: cardId as number, pageSize, pageIndex, sortValue, voucherNumber: paramData.get("voucherNumber") as string });
      if (voucherDetails.data && voucherDetails.data.voucherCard) {
        setVoucherDetails(voucherDetails.data);
        setTotalResults(voucherDetails.data.totalResults);
        setLoading(false);
      } else {
        return router.push("/404");
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, pageIndex, sortValue]);

  const columns = [
    {
      title: <HeaderSort currentSortColumn={column} headerKey="orderNumber" columnName={voucherTranslation("orderNumber")} onSort={onColumnSort} />,
      dataIndex: "orderNumber",
      key: "orderNumber",
      heading: voucherTranslation("orderNumber"),
      render: (orderNumber: string, record: IRecordType) => (
        <Link className="text-linkColor hover:text-hoverColor text-sm underline" href={`/account/order/details/${orderNumber}`} data-test-selector={`linkOrderNumber${record.orderNumber}`}>
          {orderNumber}
        </Link>
      ),
      displayOnMobile: true,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="transactionDate" columnName={voucherTranslation("orderDate")} onSort={onColumnSort} />,
      dataIndex: "transactionDate",
      key: "transactionDate",
      heading: voucherTranslation("orderDate"),
      displayOnMobile: true,
      className: "whitespace-nowrap",
      render: (orderDate: string, record: IRecordType) => <span data-test-selector={`spnOrderDate${record.orderNumber}`}>{orderDate}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="notes" columnName={voucherTranslation("notes")} onSort={onColumnSort} />,
      dataIndex: "notes",
      key: "notes",
      heading: voucherTranslation("notes"),
      render: (notes: string, record: IRecordType) => <span data-test-selector={`spnOrderNotes${record.orderNumber}`}>{notes}</span>,
    },
    {
      title: <HeaderSort currentSortColumn={column} headerKey="transactionAmount" columnName={voucherTranslation("amountUsed")} onSort={onColumnSort} />,
      dataIndex: "transactionAmount",
      key: "transactionAmount",
      showCurrencyCode: true,
      heading: voucherTranslation("amountUsed"),
      render: (transactionAmount: number, record: IRecordType) => (
        <span data-test-selector={`spnTransactionAmount${record.orderNumber}`}>
          <FormatPriceWithCurrencyCode price={transactionAmount || 0} currencyCode={record?.currencyCode || "USD"} />
        </span>
      ),
    },
    {
      title: commonTranslation("actions"),
      dataIndex: "",
      key: "actions",
      heading: "",
      render: (Name: string, record: IRecordType) => {
        return record.orderNumber ? (
          <Button
            type="text"
            size="small"
            dataTestSelector={`btnViewOrder${record.orderNumber}`}
            className="pr-3"
            onClick={() => router.push(`/account/order/details/${record.orderNumber}`)}
          >
            <Tooltip message={commonTranslation("view")}>
              <ZIcons name="eye" data-test-selector={`svgViewOrder${record.orderNumber}`} />
            </Tooltip>
          </Button>
        ) : (
          <div></div>
        );
      },
    },
  ];

  const voucherCardData = voucherDetails?.voucherCard;
  const voucherHistoryList = voucherDetails?.voucherHistoryList || [];

  const startDate = voucherCardData?.startDate;
  const expirationDate = voucherCardData?.expirationDate ?? "";

  const onPageSizeChange = async (pageSize: number) => {
    setPageIndex(1);
    setPageSize(pageSize);
  };
  const onPageIndexChange = async (pageIndex: number) => {
    setPageIndex(pageIndex);
  };

  const renderAction = (record: IVoucherList) => {
    return record.orderNumber ? (
      <Link className="text-blue-600" href={`/order/details/${record.orderNumber}`} data-test-selector={`linkView${record.orderNumber}`}>
        <Tooltip message={commonTranslation("view")}>
          <ZIcons name="eye" />
        </Tooltip>
      </Link>
    ) : (
      <div></div>
    );
  };
  return voucherCardData ? (
    <>
      <Heading name={voucherTranslation("voucherDetails")} dataTestSelector="hdgVoucherDetails" level="h2" customClass="uppercase" showSeparator />
      <div className="lg:flex justify-between mb-4">
        <div className={"text-left mt-4 text-xl font-semibold"} data-test-selector="divVoucherNumber">
          {voucherTranslation("voucherNumber")}: {voucherCardData.cardNumber}
        </div>
        <div className={"text-left mt-4 text-xl font-semibold"} data-test-selector="divTotalRemainingAmount">
          {voucherTranslation("totalRemaining")}:{" "}
          {<FormatPriceWithCurrencyCode price={voucherCardData.remainingAmount || 0} currencyCode={voucherCardData.currencyCode || "USD"} />}
        </div>
      </div>
      <Separator customClass="mt-0" />
      <div className="p-2">
        <div className="flex pb-2">
          <p className="font-medium w-48" data-test-selector="paraVoucherNameLabel">
            {voucherTranslation("voucherName")}:
          </p>
          <p data-test-selector="paraCardName">{voucherCardData.name}</p>
        </div>
        <div className="flex pb-2">
          <p className="font-medium w-48" data-test-selector="paraVoucherNumberLabel">
            {voucherTranslation("voucherNumber")}:
          </p>
          <p data-test-selector="paraVoucherCardNumber">{voucherCardData.cardNumber}</p>
        </div>
        <div className="flex pb-2">
          <p className="font-medium w-48" data-test-selector="paraStartDateLabel">
            {commonTranslation("startDate")}:
          </p>
          <p data-test-selector="paraStartDate">{startDate as string}</p>
        </div>
        <div className="flex pb-2">
          <p className="font-medium w-48" data-test-selector="paraExpirationDateLabel">
            {voucherTranslation("expirationDate")}:
          </p>
          <p data-test-selector="paraExpirationDate">{expirationDate}</p>
        </div>
        <div className="flex pb-2">
          <p className="font-medium w-48" data-test-selector="paraVoucherAmountLabel">
            {voucherTranslation("voucherAmount")}:
          </p>
          <p data-test-selector="paraGiftCardAmount">
            {<FormatPriceWithCurrencyCode price={voucherCardData.originalAmount || 0} currencyCode={voucherCardData.currencyCode || "USD"} />}
          </p>
        </div>
      </div>

      <div className="mt-4" data-test-selector="divVoucherHistory">
        <TableWrapper renderAction={renderAction} columns={columns as IDynamicData[]} loading={loading} expandedRowByKey="giftCardId" data={voucherHistoryList as []} />
        {voucherHistoryList && voucherHistoryList.length > 0 && (
          <Pagination totalResults={totalResults} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} />
        )}
      </div>
    </>
  ) : (
    <LoadingSpinnerComponent minHeight="min-h-[50vh]" />
  );
};
