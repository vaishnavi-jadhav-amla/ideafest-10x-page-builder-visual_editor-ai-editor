import { IProductListCard } from "@znode/types/product";
import { Inventory } from "./Inventory";
import { LoginToSeePricing } from "../../../common/login-to-see-pricing";
import { useEffect } from "react";
import { useUser } from "../../../../../../base-components/src/stores/user-store";
import { stringToBooleanV2 } from "@znode/utils/common";

interface IInventory {
  productData: IProductListCard;
  productUrl: string;
  globalAttributes: { loginToSeePricingAndInventory: string; displayAllWarehousesStock?: string };
  isListMode: boolean;
}

export function InventoryWrapper({ productData, productUrl, globalAttributes, isListMode }: Readonly<IInventory>) {
  const { user, loadUser } = useUser();
  const { isObsolete } = productData;

  const { loginToSeePricingAndInventory, displayAllWarehousesStock } = globalAttributes || {};

  useEffect(() => {
    if (!user) {
      loadUser(); // Load user data if not already loaded
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loginRequiredForPricing = stringToBooleanV2(loginToSeePricingAndInventory ?? false);

  return (
    <>
      <LoginToSeePricing isLoginRequired={loginRequiredForPricing ? Boolean(loginRequiredForPricing) : false} isObsolete={isObsolete} productUrl={productUrl} />
      {(!loginRequiredForPricing || user) && (
        <div className={`${isListMode ? "md:w-1/2 xl:w-2/5" : ""}`}>
          <Inventory productData={productData} isObsolete={isObsolete || false} allInventory={displayAllWarehousesStock || "false"} productUrl={productUrl} />
        </div>
      )}
    </>
  );
}
