import { AREA, errorStack, logServer } from "@znode/logger/server";
import { IOrderTemplateList } from "@znode/types/account/order-templates";
import { getOrderTemplateList } from "./list";

export async function isTemplateAlreadyExist(templateName: string, userId: number | undefined) {
  try {
    if (!templateName || templateName === "" || !userId) return false;

    const formattedTemplateName = templateName.trim();
    const templateList: IOrderTemplateList = await getOrderTemplateList(userId, undefined, undefined, undefined, undefined);

    const template = templateList?.collectionDetails?.find(
      (template: { className: string; classNumber?: string }) => template?.className?.toLocaleLowerCase() === formattedTemplateName.toLocaleLowerCase()
    );

    return template ? true : false;
  } catch (error) {
    logServer.error(AREA.ORDER_TEMPLATES, errorStack(error));
    return false;
  }
}
