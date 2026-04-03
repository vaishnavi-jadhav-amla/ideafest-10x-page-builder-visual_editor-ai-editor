"use client";

import { ICalculateSummary, ICommerceCollectionClassDetail } from "@znode/types/account";
import { ORDER, ORDER_DATA_TYPE } from "@znode/constants/order";
import { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { Heading } from "../../common/heading/Heading";
import { IAddress } from "@znode/types/address";
import { IGeneralSetting } from "@znode/types/general-setting";
import Link from "next/link";
import LoaderComponent from "../../common/loader-component/LoaderComponent";
import { QuoteCustomerInfo } from "./QuoteCustomerInfo";
import { QuoteDetails } from "./QuoteDetails";
import { QuoteProductList } from "./QuoteProductList";
import { QuoteProductTotal } from "./QuoteProductTotal";
import ReceiptBillingAddress from "../order-receipt/receipt-billing-address/ReceiptBillingAddress";
import ReceiptShippingAddress from "../order-receipt/receipt-shipping-address/ReceiptShippingAddress";
import TableWrapper from "../../common/table/TableWrapper";
import { getGeneralSettingList } from "../../../../../base-components/src/http-request";
import { quoteOrderDetails } from "../../../http-request/account/quote/quote-details";
import { useTranslationMessages } from "@znode/utils/component";

export const QuoteReceipt = () => {
  const quoteTranslation = useTranslationMessages("Quote");
  const commonTranslation = useTranslationMessages("Common");
  const [additionalInformation, setAdditionalInformation] = useState<{ name: string; information: string; createdBy: string }[]>([]);
  const [quoteReceiptData, setReceiptData] = useState<ICommerceCollectionClassDetail>();
  const [classNumber, setClassNumber] = useState<string>();
  const [calculatedCart, setCalculatedCart] = useState<ICalculateSummary>();
  const [generalSetting, setGeneralSetting] = useState<IGeneralSetting>();
  const [isError, setIsError] = useState(false);
  const getGeneralDetails = async () => {
    const generalSetting = await getGeneralSettingList();
    setGeneralSetting(generalSetting);
  };

  useEffect(() => {
    getGeneralDetails();
  }, []);
  const quoteDetails = async () => {
    const quoteNumber = sessionStorage.getItem("ConvertedClassNumber") || "";
    setClassNumber(quoteNumber);
    const quoteModel = await quoteOrderDetails({ orderType: ORDER_DATA_TYPE.QUOTE, quoteNumber });
    if (!quoteModel?.quoteData || !quoteNumber) {
      setIsError(true);
      return;
    }
    setReceiptData(quoteModel.quoteData);
    setAdditionalInformation(quoteModel.additionalInstructions);
    setCalculatedCart(quoteModel.calculateSummary);
  };

  useEffect(() => {
    quoteDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalSetting]);

  const shippingConstraintCode = quoteReceiptData?.orderShipments?.isShipCompletely ? ORDER.SHIP_COMPLETE : "";
  if (isError) {
    return (
      <div className="p-8 text-center">
        <Heading level="h1" customClass="mb-4">
          {quoteTranslation("quotenotfound")}
        </Heading>
        <Link href="/account/quote/list" className="text-linkColor hover:text-hoverColor border-b border-current">
          {quoteTranslation("returnorderhistory")}
        </Link>
      </div>
    );
  }
  if (!quoteReceiptData) {
    return <LoaderComponent width="50px" height="50px" isLoading={true} />;
  }

  const columnsAdditionalInformation = [
    {
      title: commonTranslation("name"),
      dataIndex: "name",
      key: "name",
      heading: commonTranslation("name"),
      displayOnMobile: true,
    },
    {
      title: commonTranslation("createdBy"),
      dataIndex: "createdBy",
      key: "createdBy",
      displayOnMobile: true,
      width: 200,
      heading: commonTranslation("createdBy"),
    },
    {
      title: commonTranslation("information"),
      dataIndex: "information",
      heading: commonTranslation("information"),
      key: "information",
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between" data-test-selector="divQuoteOrderReceipt">
        <h1 className="mt-4 mb-4 text-2xl font-normal uppercase md:font-semibold" data-test-selector="hdgQuoteThankYouPara">
          {quoteTranslation("thankYouForYourQuoteRequest")}
        </h1>
        <div className="flex items-center justify-center no-print">
          <Button
            type="primary"
            size="small"
            className="px-5 ml-1 mb-2 sm:mb-0 sm:mr-2 sm:me-2"
            ariaLabel="print button"
            dataTestSelector="btnQuoteReceiptPrint"
            onClick={() => {
              window.print();
            }}
          >
            {commonTranslation("print")}
          </Button>
        </div>
      </div>

      <div>
        {quoteReceiptData && (
          <div className="pb-4 mb-4">
            <p data-test-selector="paraThanksForShopping">
              {quoteTranslation("yourQuoteNumberIs")} <b>{classNumber} </b>
              <p className="no-print">
                {quoteTranslation("yourReviewData")}{" "}
                <Link className="text-linkColor hover:text-hoverColor media" data-test-selector="linkQuoteHistory" href="/account/quote/list">
                  <u>{quoteTranslation("quoteHistory")}</u>
                </Link>
              </p>
            </p>
          </div>
        )}
      </div>
      <div className="justify-between gap-4 lg:flex">
        {quoteReceiptData && (
          <div className="w-full p-4 md:mr-2 rounded-md shadow-md">
            <QuoteDetails quoteDetailsData={quoteReceiptData} />
          </div>
        )}
        {quoteReceiptData && (
          <div className="w-full p-4 mt-4 rounded-md shadow-md md:mt-0">
            <QuoteCustomerInfo quoteDetailsData={quoteReceiptData} />
          </div>
        )}
      </div>
      <div className="mt-4 rounded-md shadow-md">
        <h1 className="px-4 py-4 mt-4 text-2xl font-semibold uppercase border-b" data-test-selector="hdgBillingShipping">
          {quoteTranslation("billingAndShipping")}
        </h1>
        <div className="grid grid-cols-2" data-test-selector="divReturnOrderReceipt">
          <div className="col-span-2 p-4 md:col-span-1" data-test-selector="divBillingAddressContainer">
            <ReceiptBillingAddress billingAddress={quoteReceiptData?.billingAddress as IAddress} />
          </div>

          <div className="col-span-2 p-4 md:col-span-1 break-inside-avoid-page" data-test-selector="divShippingAddressContainer">
            <ReceiptShippingAddress
              shippingAddress={quoteReceiptData?.shippingAddress as IAddress}
              shippingConstraint={quoteReceiptData?.shippingConstraintCode || shippingConstraintCode}
              inHandDate={quoteReceiptData?.inHandDate || ""}
              showShippingConstraint={quoteReceiptData?.isShippingConstraint || false}
              shippingType={quoteReceiptData?.shippingMethodName || ""}
              generalSetting={generalSetting}
            />
          </div>
        </div>
      </div>
      <div className="mt-4">{quoteReceiptData && quoteReceiptData?.lineItemDetails && <QuoteProductList productList={quoteReceiptData?.lineItemDetails} />}</div>
      <div>{calculatedCart && <QuoteProductTotal quoteProductTotalData={calculatedCart} />}</div>
      {additionalInformation.length > 0 && (
        <>
          <Heading name={commonTranslation("note")} level="h3" customClass="xs:w-auto uppercase" dataTestSelector="hdgQuoteNumber" showSeparator />
          <TableWrapper columns={columnsAdditionalInformation as []} loading={false} expandedRowByKey="name" data={additionalInformation as []} />
        </>
      )}
    </>
  );
};
