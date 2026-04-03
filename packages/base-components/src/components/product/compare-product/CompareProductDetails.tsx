"use client";

import { ICompareProduct, IProductDetails } from "@znode/types/product-details";
import React, { useEffect, useState } from "react";
import { convertFirstLetterToLowerCase, formatTestSelector } from "@znode/utils/common";

import AddToCart from "../product-details/add-to-cart/AddToCart";
import AddToCartNotification from "../../add-to-cart-notification/AddToCartNotification";
import Button from "../../common/button/Button";
import { Heading } from "../../common/heading";
import { IAttributesDetails } from "@znode/types/product";
import ImageWrapper from "../../common/image/Image";
import { LoaderComponent } from "../../common/loader-component";
import { NavLink } from "../../common/nav-link";
import { PRODUCT_TYPE } from "@znode/constants/product";
import { Price } from "../price/Price";
import RatingWrapper from "../../common/rating/RatingWrapper";
import SignInOrRegisterText from "../../sign-in-register-text/SignInOrRegisterText";
import { Tooltip } from "../../common/tooltip";
import { ZIcons } from "../../common/icons";
import { getCompareProductDetails } from "../../../http-request";
import { useProduct } from "../../../stores/product";
import { useRouter } from "next/navigation";
import { useTranslationMessages } from "@znode/utils/component";
import useUserStore from "../../../stores/user-store";

interface IProductData {
  productList: ICompareProduct[];
  comparableAttributes: IAttributesDetails[];
  isLoginToSeePricing: boolean;
}
function CompareProductDetails() {
  const { product, deleteCompareProduct, deleteAllCompareProduct } = useProduct();
  const router = useRouter();
  const { user } = useUserStore();
  const productMessages = useTranslationMessages("Product");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [productData, setProductData] = useState<IProductData>();
  const getProductList = async () => {
    if (product.compareProductList && product.compareProductList.length > 0) {
      setIsLoading(true);
      const compareProductList = await getCompareProductDetails({ productList: product.compareProductList as ICompareProduct[], isProductList: false });
      setProductData(compareProductList as IProductData);
      setIsLoading(false);
    } else {
      setProductData({
        productList: [],
        comparableAttributes: [],
        isLoginToSeePricing: false,
      });
      router.push("/");
    }
  };
  useEffect(() => {
    getProductList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.compareProductList]);

  const handleDeleteProduct = () => {
    deleteAllCompareProduct();
    router.push("/");
  };

  const renderProductDetails = () =>
    productData?.productList?.map((product: ICompareProduct, index: number) => {
      const productInformation = {
        ...product,
        addOns: [],
        productId: product.productId,
        sku: product.sku as string,
        name: product.name as string,
        imageLargePath: product.image as string,
        retailPrice: product.retailPrice as number,
        rating: product.rating as number,
        salesPrice: product.salesPrice as number,
        znodeCatalogId: product.znodeCatalogId,
        currencySuffix: product.currencySuffix as string,
        seoTitle: product.seoTitle as string,
        allLocationQuantity: product.allLocationQuantity as number,
        defaultWarehouseCount: product.defaultWarehouseCount as number,
        allWarehousesStock: product.allWarehousesStock as string,
        attributes: product.attributes,
        quantity: product.quantity,
      };
      const productUrl = product.seoUrl ? "/" + product.seoUrl : `/product/${product.productId}`;
      return (
        <div
          key={index}
          className="flex flex-col relative min-w-[calc(100vw-5rem)] sm:min-w-[15rem] whitespace-pre-wrap break-words w-full border rounded-cardBorderRadius print-w-full mt-4 md:mt-2 md:w-1/3"
        >
          {product.isShowViewDetails || product.isCallForPricing ? (
            <div className="text-center w-full pt-0 sm:pt-2" data-test-selector={`divProduct${product.productId}`}>
              <NavLink
                url={productUrl}
                className="w-full"
                dataTestSelector={`linkProductImage${product.productId}`}
                data-test-selector={`linkProduct${product.productId}`}
                ariaLabel="View details"
              >
                <div className="flex w-full p-5 mb-1 no-print justify-center">
                  <Button type="primary" ariaLabel="view details button" className="btn btn-primary px-2 w-full uppercase" dataTestSelector={`btnViewDetails${product.productId}`}>
                    {productMessages("viewDetails")}
                  </Button>
                </div>
              </NavLink>
            </div>
          ) : (
            <div className="flex flex-col w-full p-5 mb-1 no-print justify-center ">
              {product && <AddToCart productDetails={productInformation as IProductDetails} showQuantityBox={false} btnStyle={{ class: "w-full" }} isProductCompare={true} />}
            </div>
          )}
          <button
            className="absolute -top-3 -right-2 bg-black text-white rounded-full p-1"
            onClick={() => {
              const filterProduct = productData?.productList?.filter((item: ICompareProduct) => item.productId !== product.productId);
              setProductData({ ...productData, productList: filterProduct });
              deleteCompareProduct(product.productId);
            }}
          >
            <Tooltip message={productMessages("remove")}>
              <ZIcons name="x" color="white" width="13" height="13" data-test-selector={`svgRemoveProduct${product.productId}`} />
            </Tooltip>
          </button>

          <div className="flex flex-col gap-2 px-5 pb-5 z-30 relative w-full">
            <div className="flex gap-2 p-3 items-start my-2 flex-col w-full ">
              <ImageWrapper
                imageLargePath={product.image ?? ""}
                seoTitle={product.name as string}
                dataTestSelector={`${product.productId}`}
                cssClass="w-52 h-52 object-contain"
                parentCSS="flex justify-center w-full"
              />
            </div>
            <div className="flex flex-col gap-2 w-full px-2 my-2 ">
              <div className="flex flex-col ">
                <label className="font-semibold" data-test-selector={`lblProductName${product.productId}`}>
                  {productMessages("productName")}
                </label>
                <p data-test-selector={`paraProductName${product.productId}`}>{product.name || "-"}</p>
              </div>
            </div>
            <div className="flex flex-col my-2 px-2">
              <label className="font-semibold" data-test-selector={`lblProductReviews${product.productId}`}>
                {productMessages("reviews")}
              </label>
              <div className="flex items-center" data-test-selector={`divProductRating${product.productId}`}>
                <RatingWrapper
                  productUrl={productUrl}
                  showReview={true}
                  ratingCount={parseInt(String(product?.rating)) || 0}
                  totalReviews={Number(product.totalReviews)}
                  id={product.productId}
                  productSku={product.sku}
                />
              </div>
            </div>
            {!product.isCallForPricing && (
              <div className={`flex flex-col px-2 my-2 ${productData.isLoginToSeePricing && !user ? "no-print" : ""}`}>
                <label className="font-semibold" data-test-selector={`lblProductPrice${product.productId}`}>
                  {productMessages("price")}
                </label>
                <div className="flex items-center" data-test-selector={`divProductPrice${product.productId}`}>
                  {productData.isLoginToSeePricing && !user ? (
                    <SignInOrRegisterText isReadyCheckoutTextShow={false} />
                  ) : product.retailPrice !== null && product.retailPrice !== 0 ? (
                    <Price
                      retailPrice={Number(product.retailPrice)}
                      currencyCode=""
                      isObsolete={false}
                      isCallForPricing={false}
                      salesPrice={Number(product.salesPrice)}
                      id={product.productId}
                    />
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            )}

            {PRODUCT_TYPE.CONFIGURABLE_PRODUCT_LABEL === product.productType && (
              <div className="flex flex-col px-2 my-2">
                <label className="font-semibold" data-test-selector={`lblVariantDetails${product.productId}`}>
                  {productMessages("variantDetails")}
                </label>
                <div className="flex items-center" data-test-selector={`divProductDesc${product.productId}`}>
                  {product.variantDescription ? <div dangerouslySetInnerHTML={{ __html: product.variantDescription }} /> : "-"}
                </div>
              </div>
            )}

            {productData.comparableAttributes.length > 0 &&
              productData.comparableAttributes.map((attribute) => {
                const productAttributeData = product[convertFirstLetterToLowerCase(attribute.attributeCode as string)] || "";
                if (attribute.attributeTypeName === "Yes/No") {
                  return (
                    <div className="flex flex-col gap-2 w-full px-2 my-2">
                      <div className="flex flex-col">
                        <label className="font-semibold" data-test-selector={formatTestSelector("lblComparableAttribute", `${attribute.attributeName}`)}>
                          {attribute.attributeName}
                        </label>
                        <ZIcons
                          name={productAttributeData === "true" ? "check" : "x"}
                          color={productAttributeData === "true" ? "black" : "gray"}
                          data-test-selector={formatTestSelector("svgComparableAttribute", `${attribute.attributeName}`)}
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  attribute.attributeCode !== "ProductImage" &&
                  attribute.attributeCode !== "ProductName" && (
                    <div className="flex flex-col gap-2 w-full px-2 my-2 ">
                      <div className="flex flex-col ">
                        <label className="font-semibold" data-test-selector={formatTestSelector("lbl", `${attribute.attributeName}${product.productId}`)}>
                          {attribute.attributeName}
                        </label>
                        {productAttributeData ? (
                          <div
                            
                            dangerouslySetInnerHTML={{ __html: productAttributeData }}
                            data-test-selector={formatTestSelector("divAttributeValue", `${attribute.attributeName}${product.productId}`)}
                          />
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                  )
                );
              })}
          </div>
        </div>
      );
    });

  const onPrintClickHandler = () => {
    window.print();
  };
  return (
    <>
      <Heading name="Compare Products" customClass="border-none mb-4 uppercase text-white bg-black text-center no-print" dataTestSelector="hdgCompareProducts" />
      {isLoading && (
        <div className="flex justify-center items-center">
          <LoaderComponent isLoading={true} width="50px" height="50px" overlay />
        </div>
      )}
      {productData?.productList && productData.productList.length > 0 ? (
        <>
          <div className="flex items-end justify-end font-semibold mb-3 gap-4 no-print">
            <Button
              type="link"
              className="cursor-pointer text-sm p-0"
              onClick={() => {
                typeof window !== "undefined" && window.scroll({ top: 0, left: 0, behavior: "instant" });
                router.back();
              }}
              dataTestSelector="btnBack"
            >
              {productMessages("back")}
            </Button>

            <Button type="link" className="cursor-pointer text-sm p-0" onClick={onPrintClickHandler} dataTestSelector="btnPrint">
              {productMessages("print")}
            </Button>
            <Button type="link" className="cursor-pointer text-sm p-0" onClick={handleDeleteProduct} dataTestSelector="btnRemoveAllItems">
              {productMessages("removeAllItems")}
            </Button>
          </div>
          <div className="gap-8 border-t p-5 mb-2 px-6 print-display-block flex overflow-x-auto custom-scroll">{renderProductDetails()}</div>
          <AddToCartNotification />
        </>
      ) : (
        <div className="flex w-full my-5 justify-center items-center">{!isLoading && productMessages("noProductForCompare")}</div>
      )}
    </>
  );
}

export default CompareProductDetails;
