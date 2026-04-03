import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";

import { getSavedUserSession } from "@znode/utils/common";
import { writeReview } from "@znode/agents/review";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const reviewModel = payload;
    const { userName } = (await getSavedUserSession()) || {};
    const { storeCode } = await getPortalHeader();
    if (storeCode) {
      const updatedReviewModel = {
        ...reviewModel,
        userName: userName ?? reviewModel.userName,
        storeCode,
      };
      const reviewData: string | null = await writeReview(updatedReviewModel);
      if (reviewData) {
        return sendSuccess({ status: reviewData }, "Product review submitted successfully.");
      } else {
        return sendError("Something Went wrong", 500);
      }
    } else {
      return sendError(`Invalid Portal ID ${storeCode}.`, 500);
    }
  } catch (error) {
    return sendError("An error occurred while submitting the product review. " + String(error), 500);
  }
}
