"use client";

import { useEffect, useState } from "react";

import Button from "../../common/button/Button";
import { IProductReview } from "@znode/types/product-details";
import Link from "next/link";
import { PAGINATION } from "@znode/constants/pagination";
import { PRODUCT } from "@znode/constants/product";
import Rating from "../../common/rating/Rating";
import { ZIcons } from "../../common/icons";
import { formatTestSelector } from "@znode/utils/common";
import { useProduct } from "../../../stores/product";
import { useTranslationMessages } from "@znode/utils/component";
import { useRouter } from "next/navigation";

interface ITabInformation {
  id: string;
  title: string;
  content: string;
  isCustomField: boolean;
}

interface ITabSectionProps {
  tabList: ITabInformation[];
  productReviews: IProductReview[];
  productId?: number;
  name: string;
  sku: string;
}

export default function ProductTabSection({ tabList = [], productReviews = [], productId, name, sku }: ITabSectionProps) {
  const productTranslations = useTranslationMessages("Product");
  const router = useRouter();
  const commonTranslations = useTranslationMessages("Common");
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<ITabInformation | null>(tabList[0]);
  const { setIsReviewTriggered, product } = useProduct();
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (product.isReviewTriggered) {
      setReviewTabDataAndScroll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.isReviewTriggered]);

  const setReviewTabDataAndScroll = () => {
    let reviewTabData = null;
    if (Array.isArray(tabList)) {
      reviewTabData = tabList.find((item) => item?.title === PRODUCT.REVIEWS);
      if (reviewTabData) {
        setActiveTab(reviewTabData);
        scrollOnSPecificDiv();
      }
    }
    setIsReviewTriggered(false);
  };
  useEffect(() => {
    document.getElementById("readRating")?.addEventListener("click", function () {
      setReviewTabDataAndScroll();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollOnSPecificDiv = () => {
    const element = document.getElementById("reviewList");
    if (element) {
      const targetRect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const newScrollPosition = targetRect.top + window.scrollY + targetRect.height / 4 - windowHeight / 2;
      window.scrollTo({
        top: newScrollPosition,
        behavior: "smooth",
      });
    }
  };
  const handleTabChange = (activeTabData: ITabInformation) => {
    setActiveTab(activeTab?.id === activeTabData.id && isMobile ? null : activeTabData);
  };

  const renderTabName = (tabData: ITabInformation) => {
    if (tabData?.title === PRODUCT.LONG_DESCRIPTION_TITLE) {
      return productTranslations("productDetails");
    } else if (tabData?.title === PRODUCT.PRODUCT_SPECIFICATION) {
      return productTranslations("specifications");
    } else if (tabData?.title === PRODUCT.SHIPPING_INFORMATION) {
      return productTranslations("shipping");
    } else if (tabData?.title === PRODUCT.REVIEWS) {
      return productTranslations("review");
    } else {
      return productTranslations("additionalInformation");
    }
  };

  const onReviewBtnClick = (url: string) => {
    const productUrl = url;
    router.push(productUrl);
  };

  const renderReviewList = (reviewData: IProductReview[]) => {
    return (
      reviewData &&
      reviewData.map((review: IProductReview, i: number) => {
        return (
          <div key={i} className={`p-3 shadow-md bg-zinc-100 rounded-sm ${i !== 0 && "mt-4"}`} data-test-selector={`divReviewCard${i}`}>
            <div className="flex" data-test-selector="divStarRating">
              <Rating isVisible={true} disableActions={true} ratingValue={review.rating} handleRatingClick={() => null} dataTestSelector={`Rating${i}`} />
              <p className="w-2/3 pl-2 font-medium grow" data-test-selector={`paraReviewHeadline${i}`}>
                {review.headline}
              </p>
            </div>
            <p data-test-selector={`paraReviewUser${i}`}>
              {commonTranslations("by")} {review?.userName} {commonTranslations("in")} {review?.userLocation}, {review?.createdDate}
            </p>
            <p className="break-words" data-test-selector={`paraReviewComments${i}`}>
              {review?.comments}
            </p>
          </div>
        );
      })
    );
  };

  const totalReviewCount = productReviews.length || 0;
  return (
    <div className="w-full mb-2 text-black bg-white" id="reviewList">
      <div className="w-full">
        {isMobile ? (
          <div className="w-full" role="tablist">
            {tabList.map((item: ITabInformation) => {
              const isActiveClass = ` transition-all ${
                activeTab?.id === item.id ? "max-h-[2000px] overflow-auto duration-1000 delay-300 " : "max-h-0 overflow-hidden  duration-500  delay-0  "
              }  `;
              return (
                <div key={item.id} className={activeTab?.id === item.id ? " border border-cardBorderColor w-full mb-1 " : "w-full mb-1"}>
                  <button
                    className={`flex justify-between items-center w-full p-4 text-left relative tab flex-1 font-medium text-lg  uppercase tracking-wide cursor-pointer border border-cardBorderColor ${
                      activeTab?.id === item.id ? " bg-gray-100 font-semibold mb-0 border-b-0 " : ""
                    } `}
                    onClick={() => handleTabChange(item)}
                    aria-expanded={activeTab?.id === item.id}
                    aria-controls={`accordion-content-${item.id}`}
                  >
                    <span className="font-medium">{item.title}</span>
                    {activeTab?.id === item.id ? <ZIcons name="chevron-up" /> : <ZIcons name="chevron-down" data-test-selector="svgChevronDown" />}
                  </button>
                  {activeTab?.id === item.id && (
                    <>
                      {activeTab?.title !== PRODUCT.REVIEWS && (
                        <div
                          id={`accordion-content-${item.id}`}
                          className={`${isActiveClass} p-4 ignore-tailwind`}
                          role="region"
                          aria-labelledby={`accordion-header-${item.id}`}
                          dangerouslySetInnerHTML={{ __html: item.content || "" }}
                        ></div>
                      )}

                      {activeTab?.title === PRODUCT.REVIEWS && activeTab?.id === item.id && (
                        <div className="p-2">
                          <div className="flex justify-end mt-2">
                            <Link
                              href={item.content}
                              className="px-4 py-2 mb-4 text-sm tracking-wider uppercase transition duration-300 ease-in-out btn btn-secondary"
                              data-test-selector="linkWriteReview"
                            >
                              {productTranslations("writeReview")}
                            </Link>
                          </div>
                          {activeTab?.title === PRODUCT.REVIEWS && activeTab?.id === item.id && (
                            <>
                              {totalReviewCount > PAGINATION.DEFAULT_TABLE_PAGE_SIZE
                                ? renderReviewList(productReviews.slice(0, PAGINATION.DEFAULT_TABLE_PAGE_SIZE))
                                : renderReviewList(productReviews)}
                              {totalReviewCount > PAGINATION.DEFAULT_TABLE_PAGE_SIZE && (
                                <div className="mt-4 text-center ">
                                  <Link className="text-linkColor hover:text-hoverColor underline" href={`/product/all-reviews/${productId}?SKU=${sku}&Name=${name}`}>
                                    {productTranslations("read")} {totalReviewCount - PAGINATION.DEFAULT_TABLE_PAGE_SIZE} {productTranslations("moreReviews")}
                                  </Link>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full">
            <div className="flex w-full pb-0 separator-sm heading-3" role="tablist" aria-label="Product Details Tabs">
              {tabList.map((item: ITabInformation) => (
                <button
                  key={item.id}
                  className={`flex-1 px-4 py-2  uppercase ${activeTab?.id === item.id ? "separator-sm mb-0 mt-0" : ""}`}
                  onClick={() => handleTabChange(item)}
                  id={`tab-${item.id}`}
                  aria-selected={activeTab?.id === item.id}
                  aria-controls={`tabpanel-${item.id}`}
                  role="tab"
                  data-test-selector={formatTestSelector("btn", item.title)}
                  tabIndex={activeTab?.id === item.id ? 0 : -1}
                >
                  {renderTabName(item)}
                </button>
              ))}
            </div>
            <div className="w-full mt-4">
              {tabList.map((item) =>
                activeTab?.title === PRODUCT.REVIEWS && activeTab?.id === item.id ? (
                  <div
                    data-test-selector="divReviewTabContent"
                    key={item.id}
                    id={`tabpanel-${item.id}`}
                    role="tabpanel"
                    hidden={activeTab?.id !== item.id}
                    aria-labelledby={`tab-${item.id}`}
                  >
                    <div className="flex justify-end">
                      <Button type="secondary" size="small" className="mb-4" dataTestSelector="btnWriteReview" onClick={() => onReviewBtnClick(item.content)}>
                        {productTranslations("writeReview")}
                      </Button>
                    </div>
                    {activeTab?.title === PRODUCT.REVIEWS && activeTab?.id === item.id && (
                      <>
                        {totalReviewCount > PAGINATION.DEFAULT_TABLE_PAGE_SIZE
                          ? renderReviewList(productReviews.slice(0, PAGINATION.DEFAULT_TABLE_PAGE_SIZE))
                          : renderReviewList(productReviews)}
                        {totalReviewCount > PAGINATION.DEFAULT_TABLE_PAGE_SIZE && (
                          <div className="mt-4 text-center ">
                            <Link
                              className="text-linkColor hover:text-hoverColor underline"
                              href={`/product/all-reviews/${productId}?SKU=${sku}&Name=${name}`}
                              data-test-selector={formatTestSelector("link", `ReadMoreReviews${productId}`)}
                            >
                              {productTranslations("read")} {totalReviewCount - PAGINATION.DEFAULT_TABLE_PAGE_SIZE} {productTranslations("moreReviews")}
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    key={item.id}
                    id={`tabpanel-${item.id}`}
                    role="tabpanel"
                    hidden={activeTab?.id !== item.id}
                    aria-labelledby={`tab-${item.id}`}
                    className={`${activeTab?.id === item.id ? "block" : "hidden"} w-full px-4 ignore-tailwind`}
                    data-test-selector={formatTestSelector("div", `${item.title}TabContent`)}
                    dangerouslySetInnerHTML={{ __html: item.content || "" }}
                  ></div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
