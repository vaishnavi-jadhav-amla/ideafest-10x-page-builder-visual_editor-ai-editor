"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Button from "../common/button/Button";
import { ICustomerReviewResponse } from "@znode/types/product";
import { IProductReview } from "@znode/types/product-details";
import LoaderComponent from "../common/loader-component/LoaderComponent";
import { NoRecordFound } from "../common/no-record-found";
import { PAGINATION } from "@znode/constants/pagination";
import { PRODUCT_REVIEW } from "@znode/constants/product";
import { ProductReviewPagination } from "./ProductReviewPagination";
import Rating from "../common/rating/Rating";
import { formatTestSelector } from "@znode/utils/common";
import { getProductReviewList } from "../../http-request/product-review-list";
import { useTranslationMessages } from "@znode/utils/component";

export function ProductReviewsList({ productId }: { productId: string }) {
  const productReviewsListTranslations = useTranslationMessages("ProductReviewsList");
  const commonTranslations = useTranslationMessages("Common");
  const searchParams = useSearchParams();
  const [pageSize, setPageSize] = useState(searchParams.get("pageSize") || PAGINATION?.DEFAULT_PAGINATION);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalReviewCount, setTotalReviewCount] = useState(0);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || PRODUCT_REVIEW.NEWEST_FIRST);
  const [reviewList, setReviewList] = useState<IProductReview[]>([]);
  const [isLoader, setIsLoader] = useState(true);
  const router = useRouter();
  const pathName = usePathname();

  const getReviewList = async () => {
    try {
      setIsLoader(true);
      const reviewData: ICustomerReviewResponse = await getProductReviewList({ productId, pageNumber, pageSize, sortBy });
      setReviewList(reviewData.customerReviewList || []);
      setTotalReviewCount(reviewData.totalResults || 0);
      setIsLoader(false);
    } catch (error) {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    router.push(`${pathName}?SKU=${searchParams.get("SKU")}&Name=${searchParams.get("Name")}&pageSize=${pageSize}&sortBy=${sortBy}`);
    getReviewList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, pageNumber, sortBy]);

  const renderReviewList = (reviewData: IProductReview[]) => {
    return (
      reviewData &&
      reviewData.map((review: IProductReview, i: number) => {
        return (
          <div
            key={review.publishProductId}
            className={`p-3 shadow-sm bg-zinc-100 rounded-sm  ${i !== 0 && "mt-4"}`}
            data-test-selector={formatTestSelector("div", `ReviewContainer${i}`)}
          >
            <div className="flex" data-test-selector={`divStarRating${i}`}>
              <Rating isVisible={true} disableActions={false} ratingValue={review.rating} handleRatingClick={() => null} dataTestSelector={`Rating${i}`} />
              <p className="w-2/3 pl-2 font-medium grow" data-test-selector={formatTestSelector("para", `ReviewHeadline${i}`)}>
                {review.headline}
              </p>
            </div>
            <p data-test-selector={formatTestSelector("para", `ReviewUser${i}`)}>
              By {review?.userName} in {review?.userLocation}, {review?.createdDate || ""}
            </p>
            <p data-test-selector={formatTestSelector("para", `ReviewComments${i}`)}>{review?.comments}</p>
          </div>
        );
      })
    );
  };

  const handledOnClickButton = (url: string) => {
    router.push(url);
  };

  const onPageSizeChange = async (pageSize: number) => {
    setPageNumber(1);
    setPageSize(`${pageSize}`);
  };

  const onPageIndexChange = async (pageIndex: number) => {
    setPageNumber(pageIndex);
  };

  const onPageSortChange = async (sortValue: string) => {
    setSortBy(sortValue);
  };

  return (
    <div className="flex justify-center mb-2">
      <div className="w-full mx-5">
        <div className="mt-2 text-2xl font-medium">{productReviewsListTranslations("reviews")}</div>
        <ProductReviewPagination totalResults={totalReviewCount} onPageSizeChange={onPageSizeChange} onPageIndexChange={onPageIndexChange} onPageSortChange={onPageSortChange} />
        <div className="items-center justify-between block sm:flex">
          <div className="mt-3 mb-2 text-2xl font-medium break-words" data-test-selector="divProductName" title={"Name"}>
            {searchParams.get("Name") || ""}
          </div>
          <div className="flex items-center justify-center w-full mt-2 sm:justify-end sm:w-1/2">
            <Button
              type="primary"
              size="small"
              className="whitespace-nowrap"
              dataTestSelector="btnRequestViewProductDetails"
              onClick={() => handledOnClickButton(`/product/${productId}`)}
              ariaLabel="view details button"
            >
              {productReviewsListTranslations("viewProductDetails")}
            </Button>
            <Button
              type="primary"
              size="small"
              className="ml-3 whitespace-nowrap"
              dataTestSelector="btnWriteReview"
              onClick={() => handledOnClickButton(`/write-review?id=${productId}&name=${searchParams.get("Name") || ""}&sku=${searchParams.get("SKU")}`)}
              ariaLabel="write reviews button"
            >
              {productReviewsListTranslations("writeReviews")}
            </Button>
          </div>
        </div>
        <div className="mt-3">
          {isLoader ? (
            <LoaderComponent isLoading={isLoader} width="60px" height="60px" />
          ) : reviewList.length > 0 ? (
            renderReviewList(reviewList)
          ) : (
            <NoRecordFound text={commonTranslations("noRecordsFound")} />
          )}
        </div>
      </div>
    </div>
  );
}
