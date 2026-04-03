import DisplayAddress from "../../address/display/DisplayAddress";
import Heading from "../../common/heading/Heading";
import { IAddressData } from "@znode/types/address";
import Link from "next/link";
import { Tooltip } from "../../common/tooltip";
import { ZIcons } from "../../common/icons";
import { useTranslationMessages } from "@znode/utils/component";

export const PrimaryBillingShippingAddress = ({ addressData, disableAddressButton }: IAddressData) => {
  const addressTranslation = useTranslationMessages("Address");
  const commonTranslation = useTranslationMessages("Common");

  const { shippingAddress = null, billingAddress = null } = addressData ?? {};

  return (
    <div>
      <div className="grid-cols-2 gap-8 mb-5 md:grid">
        <div className="col-span-1 mb-5 md:mb-0" data-test-selector="divPrimaryShippingAddressContainer">
          <Heading name={addressTranslation("primaryShipping")} customClass="uppercase" level="h3" showSeparator dataTestSelector="hdgPrimaryShipping" />
          <div className="md:pl-3">
            {shippingAddress?.addressId && (
              <div className="flex justify-between gap-1 w-full">
                <div className="w-4/5 flex-grow">
                  <p className="pb-2 font-semibold break-words" data-test-selector="paraPrimaryShippingAddressName">
                    {shippingAddress.displayName}
                  </p>
                  <DisplayAddress userAddress={shippingAddress} addressType="PrimaryShipping" />
                </div>
                {!disableAddressButton && addressData && (
                  <div>
                    <div className="flex">
                      <Link
                        href={`/account/address-book/add-edit-address?addressId=${shippingAddress.addressId}`}
                        className="pr-2"
                        data-test-selector="linkEditPrimaryShippingAddress"
                        aria-label="primary shipping address edit icon"
                      >
                        <Tooltip message={commonTranslation("edit")}>
                          <ZIcons name="pencil" data-test-selector={`svgEditPrimaryShippingAddress${shippingAddress.addressId}`} />
                        </Tooltip>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!shippingAddress && (
              <div className="text-center" data-test-selector="divNoRecordsFoundShippingAddress">
                {addressTranslation("noRecordsFound")}
              </div>
            )}
          </div>
        </div>
        <div className="col-span-1 " data-test-selector="divPrimaryBillingAddressContainer">
          <Heading name={addressTranslation("primaryBilling")} customClass="uppercase" level="h3" showSeparator dataTestSelector="hdgPrimaryBilling" />
          <div className="md:pl-3">
            {billingAddress?.addressId ? (
              <div className="flex justify-between gap-1 w-full">
                <div className="w-4/5 flex-grow">
                  <p className="pb-2 font-semibold break-words" data-test-selector="paraPrimaryBillingAddressName">
                    {billingAddress?.displayName}
                  </p>
                  <DisplayAddress userAddress={billingAddress} addressType="PrimaryBilling" />
                </div>
                {!disableAddressButton && (
                  <div>
                    <div className="flex">
                      <Link
                        href={`/account/address-book/add-edit-address?addressId=${billingAddress.addressId}`}
                        className="pr-1"
                        data-test-selector="linkEditPrimaryBillingAddress"
                      >
                        <span className="icon edit-icon" title="Edit Address">
                          <Tooltip message={commonTranslation("edit")}>
                            <ZIcons name="pencil" data-test-selector={`svgEditPrimaryBillingAddress${billingAddress.addressId}`} />
                          </Tooltip>
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            {!billingAddress ? (
              <div className="text-center" data-test-selector="divNoRecordsFoundBillingAddress">
                {addressTranslation("noRecordsFound")}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
