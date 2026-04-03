import { getPortalDetails } from "../../portal";

import { getCatalogCode } from "../../category";
import { IUser } from "@znode/types/user";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ICreateOrderTemplate, ICreateTemplateResponse } from "@znode/types/account";
import { OrderTemplates_updateOrderTemplates } from "packages/clients/src/znode-client/commerce/order-templates";
import { isOrderTemplateItemsModified } from "./is-items-modified";
import { convertCamelCase } from "@znode/utils/server";

export async function updateOrderTemplate(templateModel: ICreateOrderTemplate, userDetails: IUser | null) {
  try {
    if (!templateModel) {
      return handleUpdateOrderTemplateFailure();
    }

    if (templateModel.OrderTemplateNumber) {
      const formattedTemplateDetails = convertCamelCase(templateModel.SkuDetails);
      const isDataModified = await isOrderTemplateItemsModified(formattedTemplateDetails, templateModel.OrderTemplateNumber);
      if (isDataModified) {
        const portalData = await getPortalDetails();
        templateModel.CatalogCode = await getCatalogCode(portalData, userDetails || undefined);
        const createTemplateResponse = await OrderTemplates_updateOrderTemplates(templateModel);

        if (createTemplateResponse?.IsSuccess) {
          return { status: createTemplateResponse?.IsSuccess, isTemplateModified: true } as ICreateTemplateResponse;
        }
      } else if (isDataModified === false) {
        return { status: true, isTemplateModified: false } as ICreateTemplateResponse;
      } else return handleUpdateOrderTemplateFailure();
    }
  } catch (error) {
    logServer.error(AREA.ORDER_TEMPLATES, errorStack(error));
    return { status: false, isTemplateModified: false } as ICreateTemplateResponse;
  }
}

export function handleUpdateOrderTemplateFailure() {
  logServer.error(AREA.ORDER_TEMPLATES, "Failed to update order template.");
  return { status: false, isTemplateModified: false } as ICreateTemplateResponse;
}
