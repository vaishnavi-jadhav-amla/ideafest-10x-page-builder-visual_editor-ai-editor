import DisplayAddress from "../display-address/DisplayAddress";
import { Heading } from "../../../common/heading";
import { IAddress } from "@znode/types/address";
import React from "react";
import { useTranslationMessages } from "@znode/utils/component";

const ReceiptBillingAddress = ({ billingAddress, isFromOrderStatus = false }: { billingAddress: string | IAddress; isFromOrderStatus?: boolean }) => {
  const commonTranslation = useTranslationMessages("Common");

  return (
    <>
      {!isFromOrderStatus && <Heading name={commonTranslation("billingTo")} level="h3" dataTestSelector="hdgBillingTo" customClass="uppercase" showSeparator />}

      {typeof billingAddress === "string" ? (
        <div className="p-2" data-test-selector="divBillingAddress">
          <div dangerouslySetInnerHTML={{ __html: billingAddress }}></div>
        </div>
      ) : (
        <DisplayAddress userAddress={billingAddress} addressType="Billing" />
      )}
    </>
  );
};

export default ReceiptBillingAddress;
