import { AREA, errorStack, logServer } from "@znode/logger/server";
import { FilterCollection, FilterKeys, FilterOperators, convertPascalCase } from "@znode/utils/server";

import { CustomerReviewModel } from "@znode/clients/v1";
import { CustomersReviews_customersReviewsGet } from "@znode/clients/v2";
import { IReview } from "@znode/types/review";
import { convertDateTime } from "@znode/utils/component";
import { getGeneralSettingList } from "../../general-setting";
import { getPortalDetails } from "../../portal/portal";
import { getSavedUserSession } from "@znode/utils/common";

export async function getReviewList(pageSize: number, pageNumber: number) {
  try {
    const portalData = await getPortalDetails();
    const user = await getSavedUserSession();
    const localeCode = portalData.localeCode || "";

    const filters = getReviewFilters(user?.userId || 0, portalData.portalId);
    const reviewList = await CustomersReviews_customersReviewsGet(localeCode, convertPascalCase(filters), undefined, pageNumber, pageSize);
    if (reviewList?.CustomerReviewList && reviewList?.CustomerReviewList?.length > 0) {
      const generalSetting = await getGeneralSettingList();
      const updatedReviewList = reviewList?.CustomerReviewList?.map((item: CustomerReviewModel) => {
        const { UserId, SEOUrl, ProductName, Rating, Headline, Comments, UserLocation, CreatedDate, UserName, PublishProductId } = item;
        return {
          userId: UserId,
          userName: UserName,
          seoUrl: SEOUrl,
          productName: ProductName,
          rating: Rating,
          headline: Headline,
          comments: Comments,
          userLocation: UserLocation,
          createdDate: convertDateTime(String(CreatedDate), generalSetting?.dateFormat, generalSetting?.timeFormat, generalSetting?.displayTimeZone),
          publishProductId: PublishProductId,
        };
      }) as IReview[];
      return {
        data: updatedReviewList,
        pageIndex: reviewList.PaginationDetail?.PageIndex,
        pageSize: reviewList.PaginationDetail?.PageSize,
        totalResults: reviewList.PaginationDetail?.TotalResults,
        totalPages: reviewList.PaginationDetail?.TotalPages,
        pageList: portalData.pageList,
      };
    }
    return {
      data: [],
      pageIndex: pageNumber,
      pageSize: pageSize,
      totalResults: 0,
      totalPages: 0,
      pageList: [],
    };
  } catch (error) {
    logServer.error(AREA.USER, errorStack(error));
    return {
      data: [],
      pageIndex: pageNumber,
      pageSize: pageSize,
      totalResults: 0,
      totalPages: 0,
      pageList: [],
    };
  }
}
function getReviewFilters(userId: number, portalId: number) {
  const filters: FilterCollection = new FilterCollection();
  if (userId !== undefined && userId > 0) filters.add(FilterKeys.UserId, FilterOperators.Equals, userId.toString());
  filters.add(FilterKeys.PortalId, FilterOperators.Equals, portalId.toString());
  return filters.filterTupleArray;
}