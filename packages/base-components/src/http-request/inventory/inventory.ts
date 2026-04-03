import { IAllLocationInventory } from "@znode/types/product";
import { httpRequest } from "../base";

export const allInventoryLocations = async (productId:number) => {
    const inventoryDetails = await httpRequest<IAllLocationInventory>({ endpoint: `/api/inventory-location?productId=${productId}`});
    return inventoryDetails;
};
