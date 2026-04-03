"use client";

import { ICalculateSummary, IQuoteDetails, IQuoteDetailsResponse } from "@znode/types/account";
import { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import DisplayAddress from "../../address/display/DisplayAddress";
import { Heading } from "../../common/heading";
import { IAddress } from "@znode/types/address";
import { IPaymentOption } from "@znode/types/payment";
import { LoadingSpinnerComponent } from "../../common/icons";
import { Modal } from "../../common/modal/Modal";
import PaymentApplicationLoader from "../../common/loader-component/PaymentApplicationLoader";
import { PaymentOptions } from "../../checkout/payment/payment-options/PaymentOptions";
import { QuoteCustomerInfo } from "./QuoteCustomerInfo";
import { QuoteDetails } from "./QuoteDetails";
import { QuoteProductList } from "./QuoteProductList";
import { QuoteProductTotal } from "./QuoteProductTotal";
import TableWrapper from "../../common/table/TableWrapper";
import { getPaymentConfigurations } from "../../../http-request";
import { useCheckout } from "../../../stores/checkout";
import { useModal } from "../../../stores";
import { useRouter } from "next/navigation";
import { useTranslationMessages } from "@znode/utils/component";

export const QuoteOrderDetails = ({ quoteDetails, currencyCode }: { quoteDetails: IQuoteDetailsResponse; currencyCode: string }) => {
  const quoteTranslation = useTranslationMessages("Quote");
  const commonTranslations = useTranslationMessages("Common");

  const router = useRouter();
  const [additionalInformation, setAdditionalInformation] = useState<{ name: string; information: string; createdBy: string }[]>([]);
  const [quoteDetailsData, setQuoteDetailsData] = useState<IQuoteDetails>();
  const [calculatedCart, setCalculatedCart] = useState<ICalculateSummary>();
  const [loading, setIsLoading] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<IPaymentOption[]>();
  const [isPaymentProcessing, setPaymentProcessing] = useState(false);
  const { setShippingAddressId, setBillingAddressId } = useCheckout();
  const { openModal } = useModal();

  const handleConvertOrderClick = async () => {
    openModal("PaymentOptions");
    const paymentData = await getPaymentConfigurations();
    setPaymentMethod(paymentData);
  };

  const appendQuoteDetails = async () => {
    if (!quoteDetails?.isSuccess || (quoteDetails?.quoteData?.quoteNumber === undefined && quoteDetails?.quoteNumber === undefined)) {
      router.push("/404");
    } else {
      setQuoteDetailsData(quoteDetails?.quoteData);
      setAdditionalInformation(quoteDetails?.additionalInstructions);
      setCalculatedCart(quoteDetails?.calculateSummary);
      quoteDetailsData?.shippingAddressId && setShippingAddressId(quoteDetailsData?.shippingAddressId);
      quoteDetailsData?.billingAddressId && setBillingAddressId(quoteDetailsData?.billingAddressId);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    appendQuoteDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columnsAdditionalInformation = [
    {
      title: commonTranslations("name"),
      dataIndex: "name",
      key: "name",
      heading: commonTranslations("name"),
      displayOnMobile: true,
    },
    {
      title: commonTranslations("createdBy"),
      dataIndex: "createdBy",
      key: "createdBy",
      displayOnMobile: true,
      width: 200,
      heading: commonTranslations("createdBy"),
    },
    {
      title: commonTranslations("information"),
      dataIndex: "information",
      heading: commonTranslations("information"),
      key: "information",
    },
  ];

  const renderOrderDetails = () => {
    return (
      <>
        <div className="flex flex-wrap items-center justify-between my-2 lg:flex " data-test-selector="divReturnOrderReceipt">
          <Heading
            name={`${quoteTranslation("quoteOrderNumber")} ${quoteDetailsData?.quoteNumber}`}
            level="h2"
            customClass="xs:w-auto uppercase"
            dataTestSelector="hdgQuoteNumber"
          />
          <div className="no-print">
            <Button
              type="primary"
              size="small"
              className="mr-2 w-auto"
              dataTestSelector="btnQuotePrint"
              onClick={() => {
                window.print();
              }}
              ariaLabel="Print button"
            >
              {commonTranslations("print")}
            </Button>
            {quoteDetailsData && (
              <Button
                type="primary"
                size="small"
                className="w-auto"
                onClick={handleConvertOrderClick}
                dataTestSelector="btnConvertToOrder"
                disabled={!quoteDetailsData?.enableConvertToOrder}
                ariaLabel="convert to order button"
              >
                {quoteTranslation("convertToOrder")}
              </Button>
            )}
            <Modal customClass="overflow-y-auto w-full" modalId="PaymentOptions" size="3xl" maxHeight="xl">
              <div className="w-100">
                {paymentMethod ? (
                  <PaymentOptions
                    paymentOptions={paymentMethod}
                    isFromQuote={true}
                    quoteNumber={String(quoteDetailsData?.quoteNumber)}
                    setPaymentProcessing={setPaymentProcessing}
                    isAddEditAddressOpen={{
                      isShippingAddressOpen: false,
                      isBillingAddressOpen: false,
                    }}
                    total={Number(quoteDetailsData?.total)}
                    isOfflinePayment={false}
                    currencyCode={currencyCode}
                  />
                ) : (
                  <div className="flex justify-center w-100 h-96 align-center">
                    <LoadingSpinnerComponent minHeight="min-h-[50vh]" />
                  </div>
                )}
              </div>
            </Modal>
            <PaymentApplicationLoader isPaymentProcessing={isPaymentProcessing} />
          </div>
        </div>
        <div className="justify-between mb-4 lg:flex">
          {quoteDetailsData && (
            <div className="w-full mr-2">
              <QuoteDetails quoteDetailsData={quoteDetailsData} />
            </div>
          )}
          {quoteDetailsData && (
            <div className="w-full">
              <QuoteCustomerInfo quoteDetailsData={quoteDetailsData} />
            </div>
          )}
        </div>
        <div className="justify-between mb-4 lg:flex" data-test-selector="divReturnOrderReceipt">
          <div className="w-full mr-2">
            <Heading name={quoteTranslation("billingTo")} level="h3" dataTestSelector="hdgBillingTo" customClass="uppercase" showSeparator />
            <DisplayAddress userAddress={quoteDetailsData?.billingAddress as IAddress} addressType="Billing" />
          </div>
          <div className="w-full">
            <Heading name={quoteTranslation("shippingTo")} level="h3" dataTestSelector="hdgShippingTo" customClass="uppercase" showSeparator />
            <DisplayAddress
              userAddress={quoteDetailsData?.shippingAddress as IAddress}
              addressType="Shipping"
              shippingConstraint={quoteDetailsData?.shippingConstraintCode || ""}
              inHandDate={quoteDetailsData?.inHandDate || ""}
              showShippingConstraint={quoteDetailsData?.isShippingConstraint || false}
              shippingType={quoteDetailsData?.shippingMethodName}
            />
          </div>
        </div>
        <div>{quoteDetailsData?.lineItemDetails && <QuoteProductList productList={quoteDetailsData?.lineItemDetails} />}</div>
        <div>{calculatedCart && <QuoteProductTotal quoteProductTotalData={calculatedCart} />}</div>
      </>
    );
  };

  return loading ? (
    <LoadingSpinnerComponent minHeight="min-h-[50vh]" />
  ) : (
    <>
      <Heading name={quoteTranslation("quoteOrderDetails")} level="h2" dataTestSelector="hdgQuoteOrderDetails" customClass="uppercase" showSeparator /> {renderOrderDetails()}{" "}
      {additionalInformation.length > 0 && (
        <>
          <Heading name={commonTranslations("note")} level="h3" customClass="xs:w-auto uppercase" dataTestSelector="hdgQuoteNumber" showSeparator />
          <TableWrapper columns={columnsAdditionalInformation as []} loading={loading} expandedRowByKey="name" data={additionalInformation as []} />
        </>
      )}
    </>
  );
};
