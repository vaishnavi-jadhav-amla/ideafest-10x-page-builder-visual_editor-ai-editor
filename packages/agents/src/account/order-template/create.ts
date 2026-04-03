import { getPortalDetails } from "../../portal";

import { getCatalogCode } from "../../category";
import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ICreateOrderTemplate, ICreateTemplateResponse } from "@znode/types/account";
import { IUser } from "@znode/types/user";
import { OrderTemplates_createOrderTemplates } from "@znode/clients/cp";

export async function createOrderTemplate(templateModel: ICreateOrderTemplate, userDetails: IUser | null) {
  try {
    if (!templateModel || !userDetails) {
      return handleCreateOrderTemplateFailure();
    }

    const portalData = await getPortalDetails();
    templateModel.CatalogCode = await getCatalogCode(portalData, userDetails || undefined);
    const createTemplateResponse = await OrderTemplates_createOrderTemplates(templateModel);

    if (createTemplateResponse?.IsSuccess) {
      return { status: createTemplateResponse?.IsSuccess, isTemplateModified: true } as ICreateTemplateResponse;
    } else {
      return handleCreateOrderTemplateFailure();
    }
  } catch (error) {
    logServer.error(AREA.ORDER_TEMPLATES, errorStack(error));
    return { status: false, isTemplateModified: false } as ICreateTemplateResponse;
  }
}

export function handleCreateOrderTemplateFailure() {
  logServer.error(AREA.ORDER_TEMPLATES, "Failed to create order template.");
  return { status: false, isTemplateModified: false } as ICreateTemplateResponse;
}
