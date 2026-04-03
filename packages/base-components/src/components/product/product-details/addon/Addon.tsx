import { INVENTORY, PRODUCT } from "@znode/constants/product";
import { formatTestSelector, getAttributeValue } from "@znode/utils/common";
import { useEffect, useState } from "react";

import { CheckboxAddon } from "./addon-variants/checkbox-addon/CheckboxAddon";
import { DropdownAddon } from "./addon-variants/dropdown-addon/DropdownAddon";
import { Heading } from "../../../common/heading";
import { IAttributeDetails } from "@znode/types/attribute";
import { IProductAddOn } from "@znode/types/product";
import { RadioAddon } from "./addon-variants/radio-addon/RadioAddon";
import { useProduct } from "../../../../stores";
import { useTranslationMessages } from "@znode/utils/component";

interface AddOnProps {
  addOnData: IProductAddOn[];
  addOnError: string | null;
  currencyCode: string;
  isLoginToSeePricing: boolean | undefined;
}

const AddOn: React.FC<AddOnProps> = ({ addOnData, addOnError, currencyCode = "USD", isLoginToSeePricing }) => {
  const t = useTranslationMessages("Addon");
  const [message, setMessage] = useState("");
  const {
    setIsAddToCart,
    setSelectedAddons,
    setAddOnValidation,
    product: { addOnValidation, selectedAddons, addToCartNotificationData },
  } = useProduct();

  function findDefaultAddOnValues(data: IProductAddOn[]): IProductAddOn[] {
    const defaultValues: IProductAddOn[] = [];
    data.forEach((group: IProductAddOn) => {
      group.addOnValues?.forEach((value) => {
        if (value.isDefault) {
          const inventoryStatus = getAttributeValue(value?.attributes as IAttributeDetails[], PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues");
          const dontTrackInventory = inventoryStatus === INVENTORY.DONT_TRACK_INVENTORY || false;
          const allowBackOrdering = inventoryStatus === INVENTORY.ALLOW_BACK_ORDERING || false;
          if (value?.quantity === 0 && !dontTrackInventory && !allowBackOrdering) {
            setAddOnValidation({ [`${group.groupName}`]: t("productOutOfStock") });
            setIsAddToCart(true);
          }
          const addonData = {
            groupName: group.groupName,
            addOnValues: value.sku
              ? [
                  {
                    sku: value.sku,
                    quantity: value?.quantity || 0,
                    dontTrackInventory,
                    allowBackOrdering,
                  },
                ]
              : [],
          };
          defaultValues.push(addonData);
        }
      });
    });

    return defaultValues;
  }

  useEffect(() => {
    const defaultAddOnValues = findDefaultAddOnValues(addOnData);
    setSelectedAddons(defaultAddOnValues as IProductAddOn[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToCartNotificationData]);

  useEffect(() => {
    setMessage(addOnError as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOnError]);

  const renderAddOn = () => {
    const sortedData =
      addOnData && addOnData.sort((currentAddOn: IProductAddOn, nextAddOn: IProductAddOn) => (currentAddOn?.displayOrder as number) - (nextAddOn.displayOrder as number));
    return sortedData?.map((addOn: IProductAddOn, i: number) => {
      const { groupName, isRequired, displayType } = addOn;
      const shouldShowError = isRequired && message && ((message?.length > 0) as boolean);
      return (
        <div className="py-1 heading-3" key={i} data-test-selector={formatTestSelector("divAddOnGroup", `${groupName}`)}>
          <label className="block pb-1" data-test-selector={formatTestSelector("lblAddOnGroup", `${groupName}`)}>
            {groupName}{" "}
            {isRequired && (
              <span className="text-errorColor" data-test-selector={formatTestSelector("spnAddOnGroupRequired", `${groupName}`)}>
                *
              </span>
            )}
          </label>
          {displayType === "RadioButton" ? (
            <RadioAddon addOn={addOn} shouldShowError={shouldShowError as boolean} currencyCode={currencyCode} isLoginToSeePricing={isLoginToSeePricing} />
          ) : displayType === "DropDown" ? (
            <DropdownAddon addOn={addOn} shouldShowError={shouldShowError as boolean} currencyCode={currencyCode} isLoginToSeePricing={isLoginToSeePricing} />
          ) : (
            <CheckboxAddon addOn={addOn} shouldShowError={shouldShowError as boolean} currencyCode={currencyCode} isLoginToSeePricing={isLoginToSeePricing} />
          )}
        </div>
      );
    });
  };

  const validateSelectedAddonValues = (addonValidationData: Record<string, string>): boolean => {
    const allValuesEmpty = Object.values(addonValidationData).every((value) => value === "");
    if (allValuesEmpty) return false;
    const hasNonEmptyValue = Object.values(addonValidationData).some((value) => value !== "");
    if (hasNonEmptyValue) return true;
    return false;
  };

  useEffect(() => {
    if (addOnValidation && Object.keys(addOnValidation).length > 0) {
      validateSelectedAddonValues(addOnValidation) ? setIsAddToCart(true) : setIsAddToCart(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOnValidation, selectedAddons]);

  return (
    addOnData && (
      <div className="mb-1">
        <Heading name={t("addOnOptions")} customClass="pb-0" level="h2" dataTestSelector="hdgAddOnOptions" />
        {renderAddOn()}
      </div>
    )
  );
};

export default AddOn;
