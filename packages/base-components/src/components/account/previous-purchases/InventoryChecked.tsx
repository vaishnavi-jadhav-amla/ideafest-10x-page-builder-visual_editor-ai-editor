import { IAddOnSku, IInventoryCheckProps } from "@znode/types/account";

import { useState } from "react";
import { useTranslationMessages } from "@znode/utils/component";
import { validateProductInventory } from "../../../http-request";

export default function InventoryStatusContainer({ setInvalidInventory, productId, sku, qty, addOnList, setValidationMessages }: IInventoryCheckProps) {
  const [status, setStatus] = useState<{ message: string; isInValid: boolean | null }>({ message: "", isInValid: null });
  const previousPurchasesTranslations = useTranslationMessages("PreviousPurchases");
  const behaviorMsgTranslations = useTranslationMessages("BehaviorMsg");
  const renderStatus = (statusDetails: { message: string; isInValid: boolean | null }) => {
    if (statusDetails?.message) {
      return statusDetails.message;
    }
    return (
      <div
        className="cursor-pointer capitalize text-linkColor whitespace-nowrap underline"
        onClick={() => {
          setStatus({ message: previousPurchasesTranslations("checking"), isInValid: null });
          fetchInventoryStatus(sku, productId, qty, addOnList).then((res) => {
            if (res) {
              setInvalidInventory(productId, !res.isSuccess, res.message);
              setStatus({ message: res.message, isInValid: res.isSuccess });
            } else {
              setStatus({ message: previousPurchasesTranslations("failed"), isInValid: false });
              setInvalidInventory(productId, true, behaviorMsgTranslations("behaviorErrorMsg"));
              setValidationMessages((prev) => ({
                ...prev,
                [productId]: behaviorMsgTranslations("behaviorErrorMsg"),
              }));
            }
          });
        }}
      >
        {previousPurchasesTranslations("checkInventory")}
      </div>
    );
  };

  return (
    <div
      className={
        status?.isInValid
          ? "text-green-600 capitalize whitespace-nowrap"
          : status.message === previousPurchasesTranslations("checking") && status.isInValid === null
          ? "capitalize whitespace-nowrap"
          : "text-red-600 capitalize whitespace-nowrap"
      }
    >
      {previousPurchasesTranslations("failed") === status?.message ? "-" : renderStatus(status)}
    </div>
  );
}

const fetchInventoryStatus = async (sku: string, productId: string, qty: number, addOnList: IAddOnSku[]): Promise<{ isSuccess: boolean; message: string } | null> => {
  const addOnListDetails = addOnList.length > 0 ? addOnList.map((addOn) => ({ sku: addOn.sku, quantity: 1 })) : [];
  const response = await validateProductInventory([
    {
      sku,
      productId,
      inventoryFlag: true,
      addOnSkuList: [],
      personalizedDetails: [],
      quantity: Number(qty || 1),
    },
    ...addOnListDetails,
  ]);
  if (response.length > 0) {
    return response[0];
  }
  return null;
};
