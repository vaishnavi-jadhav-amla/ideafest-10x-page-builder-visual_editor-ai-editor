import { sendError, sendSuccess } from "@znode/utils/server";
import { getSavedUserSession } from "@znode/utils/common";
import { isTemplateAlreadyExist } from "@znode/agents/account/order-template/is-exist";

export async function POST(request: Request) {
  try {
    const { templateName } = (await request.json()) || {};

    const userDetails = await getSavedUserSession();
    const response = await isTemplateAlreadyExist(templateName, userDetails?.userId);
    return sendSuccess(response, "Template name verified.");
  } catch (error) {
    return sendError("An error occurred." + String(error), 500);
  }
}
