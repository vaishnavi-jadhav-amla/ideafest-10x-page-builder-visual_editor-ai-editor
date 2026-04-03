import { AREA, errorStack, logServer } from "@znode/logger/server";

import { CustomersReviews_customersReviews } from "@znode/clients/v2";
import { IProductReviewRequest } from "@znode/types/review";
import { convertPascalCase } from "@znode/utils/server";
import { getPortalDetails } from "../portal";
import { getSavedUserSession } from "@znode/utils/common";
import { getProductDetails } from "../product";

export async function writeReview(reviewModel: IProductReviewRequest): Promise<string | null> {
  try {
    const productReviewData = convertPascalCase(reviewModel);
    const reviewDetail = await CustomersReviews_customersReviews(productReviewData);
    return reviewDetail?.Status || null;
  } catch (error) {
    logServer.error(
      AREA.PRODUCT,
      `The error occurred in the writeReview() method with parameters sku:${reviewModel?.sku}, productName:${reviewModel?.productName}, rating:${reviewModel?.rating}, headline:${
        reviewModel?.headline
      }, comments:${reviewModel?.comments}, userLocation:${reviewModel?.userLocation} in review.ts file. ${errorStack(error)}`
    );
    return null;
  }
}

export async function getPublishProductDetails(publishProductId: number) {
  const portalData = await getPortalDetails();
  const userData = await getSavedUserSession();
  const productResponse = await getProductDetails(publishProductId, portalData, userData);
  return productResponse;
}
