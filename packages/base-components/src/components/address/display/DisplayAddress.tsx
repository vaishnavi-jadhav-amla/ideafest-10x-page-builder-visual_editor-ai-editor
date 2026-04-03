import { IDisplayAddress } from "@znode/types/address";
import { SHIPPING } from "@znode/constants/shipping";
import { useTranslationMessages } from "@znode/utils/component";

const DisplayAddress = ({ userAddress, addressType, shippingConstraint, showShippingConstraint, inHandDate, shippingType }: IDisplayAddress) => {
  const commonTranslation = useTranslationMessages("Common");
  const orderTranslation = useTranslationMessages("Orders");

  const addressParts = userAddress ? [userAddress.cityName, userAddress.stateName, userAddress.countryName, userAddress.postalCode] : [];

  const formattedAddress = addressParts?.filter(Boolean).join(", ");
  return (
    <div>
      {userAddress && (
        <>
          <div data-test-selector={`div${addressType}Address${userAddress.addressId}`}>
            <p className="font-semibold break-all">
              <span data-test-selector={`spn${addressType}FirstName${userAddress.addressId}`}>{userAddress.firstName}</span>{" "}
              <span data-test-selector={`spn${addressType}LastName${userAddress.addressId}`}>{userAddress.lastName}</span>
            </p>
          </div>
          <p className="break-all" data-test-selector={`para${addressType}CompanyName${userAddress.addressId}`}>
            {userAddress.companyName}{" "}
          </p>
          <p className="break-all" data-test-selector={`para${addressType}Address1_${userAddress.addressId}`}>
            {userAddress.address1}
          </p>
          <p className="break-all" data-test-selector={`para${addressType}Address2_${userAddress.addressId}`}>
            {userAddress.address2}
          </p>
          <p className="break-all" data-test-selector={`para${addressType}Address${userAddress.addressId}`}>
            {formattedAddress}
          </p>
          {userAddress.phoneNumber && (
            <p className="break-all" data-test-selector={`para${addressType}PhoneNumber${userAddress.addressId}`}>
              {commonTranslation("phone")}: {userAddress.phoneNumber}{" "}
            </p>
          )}
          {userAddress.addressId === 0 && addressType !== "Billing" && (
            <p data-test-selector={`para${addressType}Email${userAddress.addressId}`}>
              {commonTranslation("email")}: {userAddress.emailAddress ?? "NA"}
            </p>
          )}

          {showShippingConstraint && (
            <div className="mt-3 flex flex-col">
              {inHandDate ? (
                <div className="grid grid-cols-2 pb-2" data-test-selector="divDate">
                  <p className="col-span-1 font-medium">{commonTranslation("inHandsDate")}:</p>
                  <p>{inHandDate}</p>
                </div>
              ) : null}
              <div className="grid grid-cols-2 pb-2">
                <p className="col-span-1 font-medium" data-test-selector="paraShippingConstraintsLabel">
                  {orderTranslation("shippingConstraints")}:
                </p>
                <p data-test-selector="paraShippingConstraintValue">
                  {shippingConstraint === SHIPPING.SHIP_COMPLETE ? orderTranslation("shipComplete") : orderTranslation("shipPartial")}
                </p>
              </div>
              {shippingType ? (
                <div className="grid grid-cols-2" data-test-selector="divShippingType">
                  <p className="col-span-1 font-medium">{orderTranslation("shippingMethod")}:</p>
                  <p>{shippingType}</p>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DisplayAddress;
