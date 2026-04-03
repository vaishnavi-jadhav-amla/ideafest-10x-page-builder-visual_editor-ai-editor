import { LoaderComponent } from "../../../common/loader-component";
import { LoginToSeePricing } from "../../../common/login-to-see-pricing";
import { Price } from "../../../product/price/Price";
import { useEffect } from "react";
import { useUser } from "../../../../stores";
import { PRODUCT } from "@znode/constants/product";
import { useTranslationMessages } from "@znode/utils/component";

interface ITypeaheadProductPrice {
  priceDetails?: IPriceDetails;
  productId: number;
  loginToSeePricing: string;
  setLoginRequiredToSeePricing?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IPriceDetails {
  currencyCode?: string;
  retailPrice?: number;
  salesPrice?: number;
  pricingValidations?: IPricingValidation[];
}
export interface IPricingValidation {
  validationType?: string;
  validationMessage?: string;
}

const TypeaheadProductPrice = ({ priceDetails, productId, loginToSeePricing, setLoginRequiredToSeePricing }: ITypeaheadProductPrice) => {
  const productTranslations = useTranslationMessages("Product");
  const { user, loadUser, isUserSessionLoading } = useUser();
  useEffect(() => {
    if (!user) {
      loadUser(); // Load user data if not already loaded
      if (isLoginRequired && !isUserSessionLoading && !user && setLoginRequiredToSeePricing) setLoginRequiredToSeePricing(true);
    } else {
      setLoginRequiredToSeePricing && setLoginRequiredToSeePricing(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getProductPricingValidationRules = (): IPricingValidation => {
    if (priceDetails?.pricingValidations && priceDetails.pricingValidations.length > 0) {
      for (const pricingValidation of priceDetails.pricingValidations) {
        if (pricingValidation.validationType) return { validationType: pricingValidation.validationType, validationMessage: pricingValidation.validationMessage || "" };
      }
    }
    return { validationType: "", validationMessage: "" };
  };
  const pricingValidationRules: IPricingValidation = getProductPricingValidationRules();

  const getPricingValidationElement = (pricingValidation: IPricingValidation) => {
    switch (pricingValidation.validationType) {
      case PRODUCT.OBSOLETE_VALIDATION_KEY:
        return <div className="tracking-wide text-errorColor">{productTranslations("priceAheadObsoleteMsg")}</div>;
      case PRODUCT.PRICE_NOT_SET_VALIDATION_KEY:
        return <div className="tracking-wide text-errorColor">{productTranslations("priceNotSet")}</div>;
      default:
        return <></>;
    }
  };

  const isLoginRequired = loginToSeePricing ? JSON.parse(loginToSeePricing) : false;
  const isLoginRequiredFlag = isLoginRequired && (isUserSessionLoading || !user);

  const LoginToSeePricingElement = () => {
    if (isUserSessionLoading) {
      return (
        <div className="flex justify-start">
          <LoaderComponent isLoading={true} height="20px" width="20px" />
        </div>
      );
    } else return <LoginToSeePricing isLoginRequired={isLoginRequired} isObsolete={false} productUrl={""} />;
  };

  return (
    <>
      {isLoginRequiredFlag ? (
        LoginToSeePricingElement()
      ) : pricingValidationRules?.validationType ? (
        <>{getPricingValidationElement(pricingValidationRules)}</>
      ) : (
        <div className="break-words " data-test-selector={`divProductPrice${productId}`}>
          <Price
            retailPrice={(priceDetails as IPriceDetails)?.retailPrice as number}
            salesPrice={(priceDetails as IPriceDetails)?.salesPrice}
            currencyCode={priceDetails?.currencyCode}
            id={productId}
          />
        </div>
      )}
    </>
  );
};

export default TypeaheadProductPrice;
