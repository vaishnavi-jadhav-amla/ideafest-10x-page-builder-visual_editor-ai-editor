"use client";

import { useEffect, useState } from "react";

import { DynamicPagination } from "../../common/pagination";
import { Heading } from "../../common/heading/Heading";
import { IPageList } from "@znode/types/portal";
import { IReview } from "@znode/types/review";
import Link from "next/link";
import { LoadingSpinnerComponent } from "../../common/icons";
import { NoRecordFound } from "../../common/no-record-found";
import { PAGINATION } from "@znode/constants/pagination";
import Rating from "../../common/rating/Rating";
import { Separator } from "../../common/separator";
import { getUserReviewHistory } from "../../../http-request/account/review-history/review-history";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export const ReviewHistory = () => {
  const reviewHistoryTranslations = useTranslations("ReviewHistory");
  const commonTranslations = useTranslations("Common");

  const searchParams = useSearchParams();
  const pageSize = searchParams.get("pageSize") || PAGINATION.DEFAULT_TABLE_PAGE_SIZE;
  const pageNumber = searchParams.get("pageNumber") || PAGINATION.DEFAULT_TABLE_PAGE_INDEX;
  const [paginationDetails, setPaginationDetails] = useState({
    totalResults: 0,
    totalPages: 0,
    pageList: [] as IPageList[],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [reviewHistoryList, setReviewHistoryList] = useState<IReview[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getUserReviewHistory({ pageNumber, pageSize });

      if (response?.data?.length > 0) {
        setReviewHistoryList(response.data);
        setPaginationDetails({
          totalResults: response.totalResults,
          totalPages: response.totalPages,
          pageList: response.pageList || [],
        });
      } else {
        setReviewHistoryList([]);
        setPaginationDetails({ totalResults: 0, totalPages: 0, pageList: [] });
      }
    } catch (error) {
      setReviewHistoryList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, pageNumber]);

  const reviewCount = reviewHistoryList.length;
  const reviewMessage = `${reviewHistoryTranslations("subTextReviewProducts").replace("%s", paginationDetails.totalResults.toString())}`;

  const renderReviewHistory = () => {
    return reviewHistoryList.map((review, index) => {
      const { userId, seoUrl, productName, rating, headline, comments, userName, userLocation, createdDate, publishProductId } = review;
      return (
        userId && (
          <>
            <div key={index + userId} className="flex items-center">
              <div>
                <Link className="text-linkColor hover:text-hoverColor underline" href={`/${seoUrl ?? "product/" + publishProductId}`} data-test-selector={`link${productName}`}>
                  {productName}
                </Link>
                <div data-test-selector={`divStarRating${userId}`} className="pt-[3px]">
                  <Rating isVisible={true} disableActions={true} ratingValue={rating} dataTestSelector={`Rating${review.userId}`} />
                  <strong className="font-semibold"> {headline}</strong>
                </div>
                <div data-test-selector={`divReviewComments${userId}`}>{comments}</div>
                <div>
                  {commonTranslations("by")} {userName} {commonTranslations("in")} {userLocation}, {createdDate}
                </div>
              </div>
            </div>
            {reviewCount - 1 !== index ? <Separator /> : null}
          </>
        )
      );
    });
  };

  return (
    <div>
      <Heading name={reviewHistoryTranslations("reviewHistory")} dataTestSelector="hdgReviewHistory" customClass="uppercase" level="h1" showSeparator />
      <div data-test-selector="divReviewHistory">
        {!loading && reviewCount !== 0 && (
          <h3 data-test-selector="hdgReviewMsg" className="pt-0 pb-3 my-0 uppercase heading-3">
            {reviewMessage}
          </h3>
        )}
        {loading ? (
          <LoadingSpinnerComponent minHeight="min-h-[50vh]" />
        ) : reviewHistoryList.length === 0 ? (
          <NoRecordFound text={commonTranslations("noRecordsFound")} />
        ) : (
          <>
            {renderReviewHistory()}
            <DynamicPagination totalProducts={paginationDetails.totalResults} pageSize={pageSize} pageList={paginationDetails.pageList} />
          </>
        )}
      </div>
    </div>
  );
};