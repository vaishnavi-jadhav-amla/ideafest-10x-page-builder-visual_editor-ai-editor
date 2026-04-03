import { CommerceCollections_bulkQuantity } from "@znode/clients/cp";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IBulkQuantity, IUpdateBulkItemQuantityResponse } from "@znode/types/account";
import { convertCamelCase } from "@znode/utils/server";

export async function bulkQuantityUpdate(bulkQuantityModel: IBulkQuantity): Promise<IUpdateBulkItemQuantityResponse> {
  try {
    const response = await CommerceCollections_bulkQuantity(bulkQuantityModel.classType, bulkQuantityModel.classNumber, bulkQuantityModel.updateClassItemQuantity);

    if (response) {
      const updateBulkItemQuantityResponse = convertCamelCase(response);
      return {
        isSuccess: updateBulkItemQuantityResponse.isSuccess,
        validationDetails: updateBulkItemQuantityResponse.validationDetails,
      } as IUpdateBulkItemQuantityResponse;
    } else {
      return handleBulkQuantityUpdateFailure();
    }
  } catch (error) {
    logServer.error(AREA.ORDER_TEMPLATES, errorStack(error));
    return getBulkQuantityUpdateFailureResponse();
  }
}

export function handleBulkQuantityUpdateFailure() {
  logServer.error(AREA.ORDER_TEMPLATES, "Failed to update order template items quantity.");
  return getBulkQuantityUpdateFailureResponse();
}

function getBulkQuantityUpdateFailureResponse() {
  return {
    isSuccess: false,
    validationDetails: undefined,
  } as IUpdateBulkItemQuantityResponse;
}
