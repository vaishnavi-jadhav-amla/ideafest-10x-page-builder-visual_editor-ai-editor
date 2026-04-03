"use client";

import { IReturnCalculateResponse, IReturnProductList, IReturnReceiptData } from "@znode/types/order";
import React, { useEffect, useState } from "react";

import { BreadCrumbs } from "../../../common/breadcrumb/BreadCrumbs";
import Button from "../../../common/button/Button";
import { Heading } from "../../../common/heading/Heading";
import ReturnDetails from "./ReturnDetails";
import ReturnProductList from "../ReturnProductList";
import ReturnProductTotal from "../ReturnProductTotal";
import TableWrapper from "../../../common/table/TableWrapper";
import { useSearchParams } from "next/navigation";
import { useTranslationMessages } from "@znode/utils/component";
import useUserStore from "../../../../stores/user-store";

function ReturnReceipt({ isGuest, returnReceiptDetails, priceRoundOff }: Readonly<{ isGuest?: boolean; returnReceiptDetails?: IReturnReceiptData; priceRoundOff: number }>) {
  const returnOrderTranslations = useTranslationMessages("ReturnOrder");
  const commonTranslation = useTranslationMessages("Common");
  const [calculateDetails, setCalculateDetails] = useState<IReturnCalculateResponse | null>({
    returnTotal: 0,
    returnSubTotal: 0,
    returnTaxCost: 0,
    returnShippingCost: 0,
    cultureCode: "",
    discount: 0,
    csrDiscount: 0,
    returnShippingDiscount: 0,
    returnCharges: 0,
    voucherAmount: 0,
  });
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const [receiptDetails, setReceiptDetails] = useState<IReturnReceiptData | null>(null);

  const fetchDetails = async () => {
    if (returnReceiptDetails?.classNumber) {
      setReceiptDetails(returnReceiptDetails);
      setCalculateDetails(returnReceiptDetails.calculateSummary ?? null);
    }
  };
  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const breadCrumbsData = {
    title: returnOrderTranslations("returnReceipt"),
    routingLabel: "Home",
    routingPath: "/",
  };

  const columnsAdditionalInformation = [
    {
      title: commonTranslation("date"),
      dataIndex: "date",
      key: "date",
      width: 200,
      heading: commonTranslation("date"),
      displayOnMobile: true,
    },
    {
      title: commonTranslation("time"),
      dataIndex: "time",
      key: "time",
      displayOnMobile: true,
      width: 200,
      heading: commonTranslation("time"),
    },
    {
      title: commonTranslation("updatedBy"),
      dataIndex: "updatedBy",
      heading: commonTranslation("updatedBy"),
      key: "updatedBy",
      width: 250,
    },
    {
      title: commonTranslation("notes"),
      dataIndex: "notes",
      heading: commonTranslation("notes"),
      key: "notes",
    },
  ];

  return (
    receiptDetails && (
      <div>
        {isGuest && (user?.userId ?? 0) === 0 && <BreadCrumbs customPath={breadCrumbsData} />}
        <Heading name={returnOrderTranslations("returnOrderReceipt")} level="h2" customClass="uppercase" dataTestSelector="hdgReturnReceipt" showSeparator />
        {!searchParams.has("isReceiptDetails") && (
          <div className="mb-8 mt-4">
            <Heading name={returnOrderTranslations("thanksForReturn")} level="h2" customClass="uppercase" dataTestSelector="hdgThankYouForReturn" />
            <p data-test-selector="paraThankyou">{returnOrderTranslations("thankMessage")}</p>
          </div>
        )}

        <div className="lg:flex justify-between mb-4 ">
          <Heading name={`${returnOrderTranslations("returnOrder")} ${receiptDetails?.classNumber}`} level="h2" customClass="uppercase" dataTestSelector="hdgTitleReturnNumber" />
          <div className="flex items-center no-print">
            <Button onClick={() => window.print()} className="tracking-wider text-sm ml-3" type="secondary" ariaLabel="back edit address button" dataTestSelector="btnPrint">
              {commonTranslation("print")}
            </Button>
          </div>
        </div>

        <div className="lg:flex justify-between gap-8 mb-4 mt-4" data-test-selector="divReturnOrderReceipt">
          <div className="w-full mr-2">
            <ReturnDetails
              priceRoundOff={priceRoundOff}
              returnDetails={{
                classNumber: receiptDetails?.classNumber,
                createdDate: receiptDetails?.createdDate,
                linkedClassNumber: receiptDetails?.linkedClassNumber,
                classStateName: receiptDetails?.classStateName,
                totalQty: Number(receiptDetails?.totalQty),
                totalReturnAmount: Number(receiptDetails?.calculateSummary?.returnTotal),
                currencyCode: receiptDetails?.currencyCode,
                currencySuffix: receiptDetails?.currencySuffix,
              }}
            />
          </div>
          <div className="w-full ml-2 no-print">
            <Heading name={returnOrderTranslations("returnCode")} level="h2" customClass="uppercase" dataTestSelector="hdgBarCode" showSeparator />
            <div className="flex justify-start items-center h-3/6">
              <div className="text-center">
                <img src={receiptDetails.barCodeImage} className="w-full h-full" alt="barCodeImage" data-test-selector="imgBarCode" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:flex print:flex justify-between gap-8 mb-4 mt-4" data-test-selector="divReturnOrderReceipt">
          <div className="w-full mr-2">
            <Heading name={returnOrderTranslations("shippingTo")} level="h2" customClass="uppercase" dataTestSelector="hdgShippingTo" showSeparator />

            <div
              className="p-2"
              dangerouslySetInnerHTML={{
                __html: receiptDetails.shippingAddress,
              }}
              data-test-selector="divShippingToAddress"
            ></div>
          </div>
          <div className="w-full ml-2">
            <Heading name={returnOrderTranslations("shippingFrom")} level="h2" customClass="uppercase" dataTestSelector="hdgShippingFrom" showSeparator />
            <div
              className="p-2 capitalize"
              dangerouslySetInnerHTML={{
                __html: receiptDetails?.billingAddress,
              }}
              data-test-selector="divShippingFromAddress"
            ></div>
          </div>
        </div>
        <div className="print:border print-next-page">
          <Heading name={returnOrderTranslations("productReturnList")} level="h2" customClass="uppercase" dataTestSelector="hdgProductReturnList" />
          <div>
            <ReturnProductList priceRoundOff={priceRoundOff} productList={receiptDetails?.lineItemDetails as IReturnProductList[]} isReceipt={true} reasonList={[]} />
          </div>
          <div className="border-t">
            <ReturnProductTotal priceRoundOff={priceRoundOff} isReceipt={true} calculateDetails={calculateDetails} currencyCode={receiptDetails.currencyCode} />
          </div>
        </div>
        {searchParams.has("isReceiptDetails") && searchParams.get("isReceiptDetails") === "true" && Number(receiptDetails.notes?.length ?? 0) > 0 && (
          <div className="no-print mt-2">
            <Heading name={commonTranslation("note")} level="h2" customClass="xs:w-auto uppercase" dataTestSelector="hdgNote" showSeparator />
            <TableWrapper columns={columnsAdditionalInformation as []} loading={false} expandedRowByKey="time" data={receiptDetails.notes as []} />
          </div>
        )}
      </div>
    )
  );
}

export default ReturnReceipt;
