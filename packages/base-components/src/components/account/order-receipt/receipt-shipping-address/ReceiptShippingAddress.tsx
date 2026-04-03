import { CHECKOUT } from "@znode/constants/checkout";
import DisplayAddress from "../display-address/DisplayAddress";
import { Heading } from "../../../common/heading";
import { IAddress } from "@znode/types/address";
import { IGeneralSetting } from "@znode/types/general-setting";
import { useTranslationMessages } from "@znode/utils/component";

const ReceiptShippingAddress = ({
  shippingAddress,
  shippingConstraint,
  showShippingConstraint,
  inHandDate,
  shippingType,
  isFromOrderStatus = false,
}: {
  shippingAddress: string | IAddress;
  shippingConstraint: string;
  showShippingConstraint?: boolean;
  inHandDate?: string;
  shippingType?: string;
  generalSetting?: IGeneralSetting;
  isFromOrderStatus?: boolean;
}) => {
  const commonTranslation = useTranslationMessages("Common");
  const orderTranslation = useTranslationMessages("Orders");
  return (
    <>
      {!isFromOrderStatus && <Heading name={commonTranslation("shippingTo")} level="h3" dataTestSelector="hdgShippingTo" customClass="uppercase" showSeparator />}

      <div className={isFromOrderStatus ? "px-3 pb-3 pt-0" : "p-0"} data-test-selector="divShippingAddress">
        {typeof shippingAddress === "string" ? (
          <div className="p-2" data-test-selector="divBillingAddress">
            <div dangerouslySetInnerHTML={{ __html: shippingAddress }}></div>
          </div>
        ) : (
          <DisplayAddress userAddress={shippingAddress} addressType="Shipping" />
        )}
        {showShippingConstraint && (
          <div className="mt-3 flex flex-col">
            {inHandDate !== "" && (
              <div className="grid grid-cols-2 pb-2" data-test-selector="divDate">
                <p className="col-span-1 font-medium" data-test-selector="paraInHandsDatelabel">
                  {commonTranslation("inHandsDate")}:
                </p>
                <p className="px-1 sm:px-0" data-test-selector="paraInHandsDate">{inHandDate}</p>
              </div>
            )}
            <div className="grid grid-cols-2 pb-2" data-test-selector="divShippingConstraints">
              <p className="col-span-1 font-medium" data-test-selector="paraShippingConstraintsLabel">
                {orderTranslation("shippingConstraints")}:
              </p>
              <p className="px-1 sm:px-0" data-test-selector="paraShippingConstraint">
                {shippingConstraint === CHECKOUT.SHIP_COMPLETE ? orderTranslation("shipComplete") : orderTranslation("shipPartial")}
              </p>
            </div>
            {shippingType && (
              <div className="grid grid-cols-2" data-test-selector="divShippingType">
                <p className="col-span-1 font-medium" data-test-selector="paraShippingMethodLabel">
                  {orderTranslation("shippingMethod")}:
                </p>
                <p className="px-1 sm:px-0" data-test-selector="paraShippingtype">{shippingType}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ReceiptShippingAddress;
