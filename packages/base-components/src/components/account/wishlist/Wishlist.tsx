"use client";

import { IProductDetails, IPublishBundleProductsDetails } from "@znode/types/product-details";
import { IWishlist, IWishlistResponse } from "@znode/types/account";
import React, { useEffect, useState } from "react";
import { addToCart, deleteWishList, getWishList } from "../../../http-request";
import { checkForExistingCartId, generatePayload, generateQueryString, setCartCookie, useTranslationMessages } from "@znode/utils/component";
import { formatTestSelector, getAttributeValue } from "@znode/utils/common";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Button from "../../common/button/Button";
import { CustomImage } from "../../common/image";
import { DynamicPagination } from "../../common/pagination";
import { FormatPriceWithCurrencyCode } from "../../common/format-price";
import { Heading } from "../../common/heading";
import { IPageList } from "@znode/types/portal";
import Link from "next/link";
import { LoaderComponent } from "../../common/loader-component";
import { NoRecordFound } from "../../common/no-record-found";
import { PAGINATION } from "@znode/constants/pagination";
import { PRODUCT_TYPE } from "@znode/constants/product";
import { useCartDetails, useProduct, useToast, useWishListStore } from "../../../stores";
import { ZIcons } from "../../common/icons";
import { Tooltip } from "../../common/tooltip";

const columns = [
  { title: "item", span: "col-span-1" },
  { title: "description", span: "col-span-3" },
  { title: "price", span: "col-span-1" },
  { title: "", span: "col-span-2" },
  { title: "", span: "col-span-1" },
];
const initialRow = {
  userWishlistId: 0,
  isRemoving: false,
  isLoadOnAddToCart: false,
};
const constructUrl = (details: IWishlist) => {
  return `/${details.seoUrl || "product/" + details.publishProductId}`;
};

const checkIsInvalidChildProduct = (products: IPublishBundleProductsDetails[]) => {
  return products.some((data) => {
    const isObsolete = getAttributeValue(data.attributes || [], "IsObsolete", "attributeValues") || "";
    return isObsolete === "true";
  });
};
const showViewDetails = (details: IWishlist) => {
  const { isObsolete, isOutOfStock, price, isCallForPricing, isAddonsRequired, productType, isPersonalizable } = details;
  if (productType === PRODUCT_TYPE.SIMPLE_PRODUCT_LABEL || productType === PRODUCT_TYPE.BUNDLE_PRODUCT_LABEL) {
    return (
      isObsolete === "true" ||
      isOutOfStock ||
      price === 0 ||
      isCallForPricing ||
      isAddonsRequired ||
      isPersonalizable ||
      (productType === PRODUCT_TYPE.BUNDLE_PRODUCT ? checkIsInvalidChildProduct(details?.publishBundleProducts || []) : false)
    );
  }
  return true;
};
export const Wishlist = () => {
  const { refreshCartItems } = useCartDetails();
  const {
    product: { cartCount },
  } = useProduct();
  const { updateWishListSkus } = useWishListStore();
  const { success, error } = useToast();
  const router = useRouter();
  const pathName = usePathname();
  const wishlistTranslations = useTranslationMessages("WishList");
  const wishlistMessage = useTranslationMessages("WishList");
  const commonMessage = useTranslationMessages("Common");
  const [productList, setProductList] = useState<IWishlist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [wishlistRow, setWishlistRow] = useState(initialRow);
  const [paginationDetails, setPaginationDetails] = useState({
    totalResult: 0,
    pageList: [] as IPageList[],
  });
  const searchParams = useSearchParams();
  const pageSize = searchParams.get("pageSize") || PAGINATION.DEFAULT_TABLE_PAGE_SIZE;
  const pageNumber = searchParams.get("pageNumber") || PAGINATION.DEFAULT_TABLE_PAGE_INDEX;

  useEffect(() => {
    fetchWishlistProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, pageNumber]);

  const fetchWishlistProducts = async (showLoader = true) => {
    try {
      showLoader && setLoading(true);
      const wishlistData: IWishlistResponse = await getWishList({
        pageIndex: pageNumber,
        pageSize: pageSize,
        sortValue: {},
      });
      setProductList(wishlistData?.wishList || []);
      setPaginationDetails({ ...paginationDetails, totalResult: wishlistData.totalResults, pageList: wishlistData.pageList });
    } catch (error) {
      setProductList([]);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (wishlistId: number, productSku: string) => {
    try {
      if (checkIsLoaderActive()) return;
      setWishlistRow({ ...wishlistRow, userWishlistId: wishlistId, isRemoving: true });
      const deleteWishlistResponse = await deleteWishList(productSku);
      if (deleteWishlistResponse) {
        if (Number(pageNumber) > 1 && productList.length === 1) {
          router.push(`${generateQueryString(pathName, searchParams, Number(pageNumber) - 1, "pageNumber", String(pageSize))}`);
          return;
        }
        await fetchWishlistProducts(false);
        success(wishlistMessage("successWishListRemoved"));
        updateWishListSkus([productSku], "REMOVE");
      } else error(commonMessage("somethingWentWrong"));
    } catch (err) {
      error(commonMessage("somethingWentWrong"));
    } finally {
      setWishlistRow(initialRow);
    }
  };

  const checkIsLoaderActive = () => {
    const { isRemoving, isLoadOnAddToCart } = wishlistRow;
    return isRemoving || isLoadOnAddToCart;
  };

  const handleAddToCart = async (product: IProductDetails) => {
    try {
      if (checkIsLoaderActive()) return;
      setWishlistRow({ ...wishlistRow, userWishlistId: product.userWishListId || 0, isLoadOnAddToCart: true });
      let quantity = Number(getAttributeValue(product.attributes || [], "MinimumQuantity", "attributeValues"));
      quantity = typeof quantity === "number" ? quantity || 1 : 1;
      product = { ...product, quantity };
      const cartId = checkForExistingCartId();
      const cartRequest = generatePayload(product, cartId);
      const addToCartResponse = await addToCart(cartRequest);

      if (addToCartResponse?.addToCartStatus) {
        setCartCookie(addToCartResponse.cartId, addToCartResponse.cartNumber);
        !cartCount && refreshCartItems();
        router.push("/cart");
      } else error(wishlistMessage("errorAddToCart"));
      return addToCartResponse;
    } catch (err) {
      error(commonMessage("somethingWentWrong"));
    } finally {
      setWishlistRow(initialRow);
    }
  };

  return (
    <>
      <Heading name={wishlistMessage("wishlist")} level="h1" customClass="uppercase" dataTestSelector="hdgWishlist" showSeparator />
      {loading ? (
        <LoaderComponent isLoading={loading} containerHeight />
      ) : !loading && productList.length === 0 ? (
        <NoRecordFound text={`${commonMessage("noRecordsFound")}`} customClass="my-2" />
      ) : (
        <div>
          <Heading
            name={`${wishlistMessage("showing")}  ${productList.length} ${wishlistMessage("of")} ${paginationDetails.totalResult} ${wishlistMessage("result")}.`}
            level="h2"
            customClass="uppercase pt-0"
            dataTestSelector="hdgWishlistCount"
          />

          <div className="wishlist-col hidden sm:grid grid-cols-8 gap-4 px-1 py-2 font-bold">
            {columns.map((column) => (
              <div className={`col-span-8 sm:${column.span}`} data-test-selector={formatTestSelector("divWishlistColumn", column.title)}>
                {column.title ? wishlistMessage(column.title) : ""}
              </div>
            ))}
          </div>

          {productList.map((details: IWishlist, index) => (
            <>
              <div className="grid grid-cols-8 gap-4 py-4 px-1">
                <div className="col-span-8 sm:col-span-1">
                  <CustomImage
                    src={details.imageThumbNailPath || ""}
                    alt="Wish List Image"
                    className="product-img-thumbnail cursor-pointer"
                    width={60}
                    height={60}
                    dataTestSelector={`imgWishList${details.publishProductId}`}
                    onClick={() => router.push(constructUrl(details))}
                  />
                </div>
                <div className="col-span-8 sm:col-span-3" data-test-selector={`divProductName${details.publishProductId}`}>
                  <div data-test-selector={`divProductDetails${details.publishProductId}`}>
                    <Link
                      className="font-semibold text-linkColor hover:text-hoverColor"
                      data-test-selector={`linkProductName${details.publishProductId}`}
                      href={constructUrl(details)}
                    >
                      {details.name}
                    </Link>{" "}
                    <div data-test-selector={`divWishlistAddedDate${details.publishProductId}`}>
                      {details.wishListAddedDate ? `${wishlistMessage("added")} ${details.wishListAddedDate}` : ""}
                    </div>
                  </div>
                </div>
                <div className="col-span-8 sm:col-span-1 font-semibold" data-test-selector={`divPrice${details.publishProductId}`}>
                  {!details.isCallForPricing && details.price !== null ? (
                    <FormatPriceWithCurrencyCode price={details.price || 0} currencyCode={details.currencyCode || "USD"} />
                  ) : (
                    <p data-test-selector={`paraProductPriceNotSet${details.publishProductId}`}>{wishlistMessage("priceNotSet")}</p>
                  )}
                </div>
                <div className="col-span-8 sm:col-span-3">
                  <div className="flex items-center gap-2">
                    <Button
                      disabled={details.price == null || details.price < 0}
                      className="px-3"
                      type="primary"
                      size="small"
                      disabled={details.price === null}
                      onClick={() => (showViewDetails(details) ? router.push(constructUrl(details)) : handleAddToCart(details as unknown as IProductDetails))}
                      loading={wishlistRow.userWishlistId === details?.userWishListId && wishlistRow.isLoadOnAddToCart}
                      loaderText={commonMessage("loading")}
                      dataTestSelector={showViewDetails(details) ? `btnViewDetails${details.publishProductId}` : `btnAddToCart${details.publishProductId}`}
                      showLoadingText={true}
                      loaderHeight={"20px"}
                      loaderWidth={"20px"}
                    >
                      {commonMessage(showViewDetails(details) ? "viewDetails" : "addToCart")}
                    </Button>
                    <Button
                      className="px-1 xl:px-3"
                      type="link"
                      loading={wishlistRow.userWishlistId === details?.userWishListId && wishlistRow.isRemoving}
                      loaderHeight={"20px"}
                      loaderWidth={"20px"}
                      dataTestSelector={`btnRemove${details.publishProductId}`}
                      size="small"
                      disabled={wishlistRow.isRemoving}
                      onClick={() => removeProduct(details?.userWishListId || 0, details.sku || "")}
                    >
                      <Tooltip message={wishlistTranslations("removeFromWishlist")}>
                        <ZIcons name="trash-2" className="text-black" data-test-selector="svgCartNotificationClose" />
                      </Tooltip>
                    </Button>
                  </div>
                </div>
              </div>
              {index !== productList.length - 1 && <div className="separator-xs" />}
            </>
          ))}

          <DynamicPagination totalProducts={paginationDetails.totalResult} pageSize={Number(pageSize)} pageList={paginationDetails.pageList} />
        </div>
      )}
    </>
  );
};
