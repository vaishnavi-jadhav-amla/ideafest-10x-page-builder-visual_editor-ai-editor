"use client";

import React, { useEffect, useState } from "react";

import { InventoryDetails } from "../inventory-detail/InventoryDetail";
import { Modal } from "../../../../common/modal/Modal";
import { NavLink } from "../../../../common/nav-link";
import { stringToBoolean } from "@znode/utils/common";
import { useModal } from "../../../../../stores/modal";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../../../../stores";

interface IAllLocationInventory {
  loginRequired?: boolean;
  inStockQuantity?: number;
  disablePurchasing?: boolean;
  defaultInventoryCount?: string;
  defaultWarehouseName?: string;
  productId: number;
  productSku: string;
  productName: string;
  isMaskedModal?: boolean;
  displayAllWarehousesStock?: string;
}

const AllLocationInventory: React.FC<IAllLocationInventory> = ({
  loginRequired,
  inStockQuantity,
  disablePurchasing,
  defaultInventoryCount,
  defaultWarehouseName,
  productId,
  productName,
  productSku,
  isMaskedModal = false,
  displayAllWarehousesStock,
}) => {
  const productTranslations = useTranslationMessages("Product");
  const { user, loadUser } = useUser();
  const { openModal, isInventory } = useModal();
  // const { setProductId } = useContext(Context);
  const [maskedModalActivatedId, setMaskedModalActivatedId] = useState("");

  useEffect(() => {
    if (!user) {
      loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleInventoryModel = () => {
    // setProductId(productId);
    openModal("InventoryDetails");
    isMaskedModal && setMaskedModalActivatedId("InventoryDetails");
  };

  const maskedCloseModal = () => {
    setMaskedModalActivatedId("");
  };

  const displayDefaultAndAllLocationsInventory = () => {
    if ((inStockQuantity || 0) > 0 && disablePurchasing && stringToBoolean(displayAllWarehousesStock as string)) {
      return (
        <>
          <Modal size="xl" modalId="InventoryDetails" isMaskedModal={isMaskedModal} maskedCloseModal={maskedCloseModal} maskedModalActivatedId={maskedModalActivatedId}>
            {isInventory && <InventoryDetails productId={productId} productName={productName} productSku={productSku} />}
          </Modal>
          <div className="w-auto lg:w-full lg:col-span-2 mt-2 lg:mt-0" data-test-selector="divAllLocationInventoryContainer">
            <div className="px-3 pb-2 bg-gray-100 rounded-md">
              <div className="flex justify-between items-center mb-1 border-b-2 align-center heading-3">
                <div data-test-selector="divLabelInventory">{productTranslations("labelInventory")}</div>
                <NavLink
                  url="javascript:void(0)"
                  className="p-0 text-sm text-linkColor hover:text-hoverColor underline"
                  onClick={(e) => {
                    e.preventDefault();
                    handleInventoryModel();
                  }}
                  dataTestSelector="linkInventoryDetails"
                  ariaLabel={productTranslations("details")}
                >
                  {productTranslations("details")}
                </NavLink>
              </div>

              <div className="flex text-sm">
                <p className="text-green-700" data-test-selector="paraDefaultInventoryCount">
                  {Number(defaultInventoryCount) || 0}
                </p>
                <p className="pl-2" data-test-selector="paraDefaultWarehouseName">
                  {defaultWarehouseName || ""}
                </p>
              </div>
              <div className="flex text-sm">
                <p className="text-green-700" data-test-selector="paraInStockQuantity">
                  {inStockQuantity || 0}
                </p>
                <p className="pl-2" data-test-selector="paraLabelAllLocations">
                  {productTranslations("allLocations")}
                </p>
              </div>
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  return (!loginRequired || user) && displayDefaultAndAllLocationsInventory();
};

export default AllLocationInventory;
