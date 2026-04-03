"use Client";

import { useEffect, useState } from "react";

import { Heading } from "../../../../common/heading";
import { IInventory } from "@znode/types/product";
import LoaderComponent from "../../../../common/loader-component/LoaderComponent";
import { Separator } from "../../../../common/separator";
import { allInventoryLocations } from "../../../../../http-request";
import { formatTestSelector } from "@znode/utils/common";
import { useTranslations } from "next-intl";

export const InventoryDetails = (props: { productId: number; productName: string, productSku: string }) => {
  const inventoryMessages = useTranslations("Inventory");
  const [loading, setLoading] = useState<boolean>(true);
  const [defaultLocation, setDefaultLocation] = useState<IInventory>();
  const [otherLocation, setOtherLocation] = useState<IInventory[]>();

  const getInvoiceData = async () => {
    setLoading(true);
    const inventoryDetails = await allInventoryLocations(props.productId);
    setDefaultLocation(inventoryDetails.defaultWarehouse);
    setOtherLocation(inventoryDetails.inventory);
    setLoading(false); // Set loading to false after processing data
  };

  useEffect(() => {
    if (props.productId) getInvoiceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return defaultLocation && otherLocation ? (
    <div data-test-selector="divInventoryCheckContainer">
      <h3 className="font-bold text-xl" data-test-selector="hdgInventoryCheck">
        {inventoryMessages("inventoryCheck")}
      </h3>
      <p className="mb-2 text-sm" data-test-selector="paraProductName">
        {props.productName}
      </p>
      <div className="p-2 bg-gray-200" data-test-selector="divDefaultLocationContainer">
        <Heading name={inventoryMessages("defaultLocation")} level="h3" dataTestSelector="hdgDefaultLocation" customClass="pt-0" />
        {defaultLocation && (
          <div className="flex items-center text-sm" data-test-selector="divDefaultLocationDetails">
            <h2 className="px-3 text-xl font-bold" data-test-selector="hdgInventoryQuantity">
              {defaultLocation?.quantity}
            </h2>
            <div data-test-selector="divDefaultAddressContainer">
              <p data-test-selector={formatTestSelector("paraWarehouseDetails", defaultLocation?.warehouseName || "")}>
                {defaultLocation?.warehouseName} {defaultLocation?.warehouseCityName} {defaultLocation?.warehousePostalCode}
              </p>
              <p className="text-black" data-test-selector={formatTestSelector("paraWarehouseAddress", defaultLocation?.warehouseName || "")}>
                {defaultLocation?.warehouseAddress} {defaultLocation?.warehouseStateName}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="p-2 mt-1 overflow-y-auto h-[20vh] sm:h-[25vh] md:h-[40vh] custom-scroll">
        <Heading name={inventoryMessages("otherLocations")} level="h3" dataTestSelector="hdgOtherLocations" customClass="pt-0" />
        {otherLocation && otherLocation.length > 0 ? (
          otherLocation?.map((item: IInventory, index) => {
            const { quantity, warehouseName, warehouseCityName, warehousePostalCode, warehouseAddress, warehouseStateName } = item as IInventory;
            return (
              <>
                <div className="grid grid-cols-12 text-sm" key={index} data-test-selector={`divLocWarehouse${index}`}>
                  <h2 className="px-3 text-xl font-bold col-span-2" data-test-selector={`hdgQtyWarehouse${index}`}>
                    {quantity}
                  </h2>
                  <div className="col-span-10" data-test-selector={`divAddrWarehouse${index}`}>
                    <p data-test-selector={`paraWarehouseName${index}`}>
                      {warehouseName} {warehouseCityName} {warehousePostalCode}
                    </p>
                    <p className="text-primaryColor" data-test-selector={`paraWarehouseAddress${index}`}>
                      {warehouseAddress} {warehouseStateName}
                    </p>
                  </div>
                </div>
                {otherLocation.length - 1 !== index ? <Separator /> : null}
              </>
            );
          })
        ) : (
          <div className="text-center font-bold mt-10" data-test-selector="divNoOtherLocations">
            {inventoryMessages("noOtherLocations")}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="w-96 h-96 flex justify-center items-center">
      <LoaderComponent isLoading={loading} height={"50px"} width={"50px"} />
    </div>
  );
};
