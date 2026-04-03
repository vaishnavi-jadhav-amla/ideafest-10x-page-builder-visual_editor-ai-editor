"use client";

import { IAttributesDetails, IProductAddOn, IProductAddOnValues } from "@znode/types/product";
import { IChildProductData, IConfigurableProduct, IProductDetails } from "@znode/types/product-details";
import { useEffect, useState } from "react";

import AddToCart from "../../add-to-cart/AddToCart";
import AddToCartNotification from "../../../../add-to-cart-notification/AddToCartNotification";
import ConfigurableProductGridData from "./ConfigurableProductGridData";
import { IUser } from "@znode/types/user";
import { PRODUCT } from "@znode/constants/product";
import { SETTINGS } from "@znode/constants/settings";
import { ZIcons } from "../../../../common/icons";
import { useProduct } from "../../../../../stores";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../../../../stores/user-store";

interface IConfigurableProductDetails {
  configurableProductDetails: IConfigurableProduct[] | undefined;
  product: IProductDetails;
  loginRequired: boolean | undefined;
  stockNotification?: boolean;
}

const ConfigurableProductGrid = ({ configurableProductDetails, product, loginRequired, stockNotification }: IConfigurableProductDetails) => {
  const t = useTranslationMessages("Common");
  const { user } = useUser();
  const { product: productStore } = useProduct();
  const { selectedAddons } = productStore;
  const [enableAddToCartButton, setEnableAddToCartButton] = useState(true);
  const [sortAs, setSortAs] = useState(false);
  const [currentSortColumn, setCurrentSortColumn] = useState<number>(0);
  const [productData, setProductData] = useState<IConfigurableProduct[]>([]);
  const [childData, setChildData] = useState<IChildProductData[]>([]);
  const isParentObsolete = product?.isObsolete;
  const configurableProductSku = product?.configurableProductSKUs;
  const [isConfigurableProductValidList, setIsConfigurableProductValidList] = useState(true);

  let isCallForPricingPromotion = false;
  const promotionCallForPricing = product.promotions?.filter((x) => x.promotionType?.toLowerCase() === PRODUCT.CALL_FOR_PRICING_MESSAGE.toLowerCase()).at(0)?.promotionType;
  if (promotionCallForPricing) isCallForPricingPromotion = true;

  useEffect(() => {
    checkAddToCartButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddons]);

  useEffect(() => {
    if (configurableProductDetails) {
      setProductData(configurableProductDetails);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configurableProductDetails]);

  function checkAddToCartButton() {
    if (isParentObsolete) {
      setEnableAddToCartButton(false);
      return;
    }
    if (!product?.addOns || product.addOns.length === 0 || !product.addOns.some((x) => x.isRequired)) {
      setEnableAddToCartButton(true);
      return;
    }
    if (product?.addOns.length > 0) {
      validateAllSku();
    }
  }
  const validateAllSku = async () => {
    const allSelectedSkuList: IProductAddOn[] = [];
    selectedAddons.forEach((items: IProductAddOn) => {
      items.addOnValues?.forEach((item: IProductAddOnValues) => allSelectedSkuList.push(item));
    });

    if (allSelectedSkuList && allSelectedSkuList.length > 0) {
      const checkedQty = allSelectedSkuList.filter((item) => item.quantity === 0);
      const donTTrackInventory = allSelectedSkuList.map((item) => item.dontTrackInventory)[0];
      if (checkedQty.length > 0 && !donTTrackInventory) {
        setEnableAddToCartButton(false);
      } else {
        setEnableAddToCartButton(true);
      }
    }
  };

  useEffect(() => {
    if (childData.length > 0) {
      setIsConfigurableProductValidList(childData.every((product) => product.isValid));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childData, product.configChildProductData]);
  const getProductData = (enteredQuantity: string, productSku: string | undefined, validationMessage: string, productId: number, inStockQty: number) => {
    const productQuantity = Number(enteredQuantity);
      const productData: IChildProductData = {
        sku: String(productSku),
        quantity: productQuantity,
        inStockQty: inStockQty,
        productId: productId,
        isValid: validationMessage === "" ? true : false,
      };

      setChildData((prevConfigurableProductData) => {
        const updatedConfigurableProductData = prevConfigurableProductData.some((item) => item.sku === productSku)
          ? prevConfigurableProductData.map((item) => (item.sku === productSku ? productData : item))
          : [...prevConfigurableProductData, productData]; // Add new product if not found

        return updatedConfigurableProductData;
      });
    
  };

  const renderConfigurableAttributesHeadings = (productData: IConfigurableProduct[]) => {
    return (
      productData &&
      productData[0]?.configurableAttributeCodeList?.map((ConfigurableAttributeCode: string, i: number) => {
        const isCurrentSortColumn = i === currentSortColumn;
        const isAscendingOrder = isCurrentSortColumn && sortAs;

        const attributeLabel = productData[0]?.productAttributes?.find((attr) => attr.attributeCode === ConfigurableAttributeCode)?.attributeName || ConfigurableAttributeCode;
        return (
          <th className="px-2 py-3 text-sm font-bold tracking-wider text-center text-gray-700 uppercase bg-gray-100" key={i}>
            <div className="flex items-center gap-2">
              <span>{attributeLabel}</span>
              <button
                className="cursor-pointer w-4"
                onClick={() => {
                  sortColumnByName(ConfigurableAttributeCode, i);
                }}
              >
                {
                  <ZIcons
                    name={isCurrentSortColumn && isAscendingOrder ? "chevron-down" : "chevron-up"}
                    width="15px"
                    height="15px"
                    color={`${SETTINGS.DEFAULT_ICONS_COLOR}`}
                    data-test-selector={isAscendingOrder ? "svgChevronDown" : "svgChevronUp"}
                  />
                }
              </button>
            </div>
          </th>
        );
      })
    );
  };

  const sortColumnByName = (colCode: string, columnIndex: number) => {
    setSortAs((prevSortAs) => {
      return currentSortColumn === columnIndex ? !prevSortAs : true;
    });

    setCurrentSortColumn(columnIndex);

    const sortedConfigurableProductDetails: IConfigurableProduct[] = [];
    const listOfParams =
      configurableProductDetails &&
      configurableProductDetails.map((val, index) => {
        if (val && val?.productAttributes) {
          const filteredParam =
            val?.productAttributes?.find((configurableProductAttribute: IAttributesDetails) => configurableProductAttribute?.attributeCode === colCode)?.selectValues?.at(0)
              ?.value || "";
          return { filterParam: filteredParam, index: index };
        }
      });

    const sortedArray = () => {
      return (
        listOfParams &&
        listOfParams.sort((a, b) => {
          if (a && b && a?.filterParam && b?.filterParam) {
            const comparison = a?.filterParam.localeCompare(b?.filterParam);
            return sortAs ? comparison : -comparison;
          } else {
            return 0;
          }
        })
      );
    };

    const arrayData = sortedArray();

    arrayData &&
      arrayData.forEach((value) => {
        const index = value?.index || 0;
        const currentData = configurableProductDetails && configurableProductDetails[index];
        currentData && sortedConfigurableProductDetails.push(currentData);
      });

    setProductData(sortedConfigurableProductDetails);
  };

  return (
    productData && (
      <>
        <div className="min-w-full mt-3 overflow-x-auto shadow-md rounded-cardBorderRadius print-overflow-x-none">
          <table className="w-full overflow-hidden leading-normal table-auto print-table" data-test-selector="tblConfigurableProductGrid">
            <thead>
              <tr className="border border-b-2 border-gray-200">
                <th className="px-5 py-3 text-sm font-bold tracking-wider text-center text-gray-700 uppercase bg-gray-100">{t("product")}</th>
                {renderConfigurableAttributesHeadings(productData)}
                <th className="px-5 py-3 text-sm font-bold tracking-wider text-center text-gray-700 uppercase bg-gray-100">{t("price")}</th>
                <th className="w-1/5 px-5 py-3 text-sm font-bold tracking-wider text-center text-gray-700 uppercase bg-gray-100">{t("quantity")}</th>
              </tr>
            </thead>
            <tbody>
              {
                <ConfigurableProductGridData
                  productGridData={productData}
                  handleBlur={getProductData}
                  isParentObsolete={isParentObsolete || false}
                  enableAddToCartButton={!enableAddToCartButton}
                  userData={user as IUser}
                  loginRequired={loginRequired || false}
                  stockNotification={stockNotification || false}
                  sku={configurableProductSku || ""}
                  isLoginToSeePricing={product.isLoginToSeePricing}
                />
              }
            </tbody>
          </table>
        </div>
        <div className="mt-2">
          <AddToCart
            productDetails={product}
            showQuantityBox={true}
            configurableErrorMessage={""}
            isCallForPricingPromotion={isCallForPricingPromotion}
            isProductCompare={false}
            groupProductData={childData}
            isGroupListValid={isConfigurableProductValidList}
            isLoginToSeePricing={product.isLoginToSeePricing}
          />
        </div>
        <AddToCartNotification />
      </>
    )
  );
};

export default ConfigurableProductGrid;
