import { INVENTORY, PRODUCT } from "@znode/constants/product";

import ConfigurableProductGridInput from "./ConfigurableProductGridInput";
import { CustomImage } from "../../../../common/image/CustomImage";
import { IAttributesDetails } from "@znode/types/product";
import { IConfigurableProduct } from "@znode/types/product-details";
import { IUser } from "@znode/types/user";
import { Price } from "../../../price/Price";
import ProductDetailsInventory from "../../inventory/product-details-inventory/ProductDetailsInventory";
import { StopIcon } from "../../../../common/icons";
import TypicalLeadTiming from "../../../../typical-lead-timing/TypicalLeadTiming";
import { getAttributeValue } from "@znode/utils/common";
import { useTranslationMessages } from "@znode/utils/component";

interface IProductGridData {
  productGridData: IConfigurableProduct[];
  handleBlur: (_arg: string, _sku: string | undefined, _arg3: string, _arg4: number, _arg5: number) => void;
  isParentObsolete: boolean;
  enableAddToCartButton: boolean;
  userData: IUser;
  loginRequired: boolean;
  stockNotification: boolean;
  sku: string;
  isLoginToSeePricing?: boolean;
}

export default function ConfigurableProductGridData({
  productGridData,
  handleBlur,
  isParentObsolete,
  enableAddToCartButton,
  userData,
  loginRequired,
  stockNotification,
  sku,
  isLoginToSeePricing,
}: IProductGridData) {
  const commonTranslations = useTranslationMessages("Common");
  const renderProductAttributes = (configurableProductData: IConfigurableProduct) => {
    const configurableAttributeCodeList = configurableProductData?.configurableAttributeCodeList;
    const configurableProductAttributes = configurableProductData.productAttributes;
    const productName = configurableProductAttributes?.find(
      (configurableProductAttribute: IAttributesDetails) => configurableProductAttribute.attributeCode === PRODUCT.PRODUCT_NAME
    );
    const productSku = configurableProductAttributes?.find((configurableProductAttribute: IAttributesDetails) => configurableProductAttribute.attributeCode === PRODUCT.SKU);
    const configurableProductPrice = configurableProductData?.retailPrice;
    const currencySuffix = configurableProductData.currencySuffix;
    const outOfStockOption = getAttributeValue(configurableProductAttributes, PRODUCT.OUT_OF_STOCK_OPTIONS, "selectValues");
    const inStockQty = configurableProductData?.quantity;
    const productType = getAttributeValue(configurableProductAttributes, PRODUCT.PRODUCT_TYPE, "selectValues");
    const configDisablePurchasing = outOfStockOption === PRODUCT.DISABLE_PURCHASING ? true : false;
    const configAllowBackOrdering = outOfStockOption === INVENTORY.ALLOW_BACK_ORDERING ? true : false;
    const typicalLeadTime = getAttributeValue(configurableProductAttributes, PRODUCT.TYPICAL_LEAD_TIME, "attributeValues") || 0;
    const minQty = Number(getAttributeValue(configurableProductAttributes, PRODUCT.MINIMUM_QUANTITY, "attributeValues"));
    const maxQty = Number(getAttributeValue(configurableProductAttributes, PRODUCT.MAXIMUM_QUANTITY, "attributeValues"));
    const childSku = configurableProductData?.sku;

    const renderConfigurableAttributes = () => {
      return configurableAttributeCodeList.map((configurableAttributeCode: string, i: number) => {
        const configurableAttributesData = configurableProductAttributes?.find(
          (configurableProductAttribute: IAttributesDetails) => configurableProductAttribute.attributeCode === configurableAttributeCode
        );
        const configurableSelectedValue = configurableAttributesData?.selectValues && configurableAttributesData?.selectValues[0];
        return (
          <td className="font-semibold text-center text-sm px-2 py-3" key={i} data-test-selector={`colConfigurableAttributesVariant_${configurableSelectedValue?.code}`}>
            {(() => {
              switch (configurableAttributesData?.isSwatch) {
                case "true":
                  return (
                    <div data-test-selector={`lblSwatchImage_${configurableSelectedValue?.code}`}>
                      <CustomImage src={configurableSelectedValue?.path || ""} alt={configurableSelectedValue?.value || ""} title={configurableSelectedValue?.value} dataTestSelector={`SwatchImage_${configurableSelectedValue?.code}`} />
                    </div>
                  );
                case "false":
                  return (
                    <div className="ml-3" title={configurableSelectedValue?.value} data-test-selector={`lblSwatchIcon_${configurableSelectedValue?.code}`}>
                      <StopIcon color={configurableSelectedValue?.swatchText} />
                    </div>
                  );
                default:
                  return (
                    <label className="font-semibold" data-test-selector={`lblScratchText_${configurableSelectedValue?.code}`}>
                      {configurableSelectedValue?.value}
                    </label>
                  );
              }
            })()}
          </td>
        );
      });
    };

    return (
      <>
        <td className="text-sm px-5 py-3 w-max">
          <div className="flex gap-10 items-center w-max sm:w-auto print-flex-col">
            <CustomImage
              src={configurableProductData.imageName}
              alt="product Image"
              className="h-16 w-16 min-w-10"
              dataTestSelector={`imgProduct${configurableProductData?.publishProductId}`}
            />
            <div className="flex flex-col space-y-2 w-min sm:w-auto">
              <p className="font-medium">{productName?.attributeValues}</p>
              <div className="w-full flex gap-2 text-sm">
                <p className="font-medium sm:w-16">{commonTranslations("sku")}:</p>
                <div>{productSku?.attributeValues}</div>
              </div>
              {isParentObsolete === false && (
                <>
                  {(!loginRequired || userData) && (
                    <div className="w-full flex gap-2 text-sm">
                      <p className="font-medium sm:w-16">{commonTranslations("labelInventory")}:</p>
                      <div>
                        <p data-test-selector={`paraInventoryCount$${configurableProductData?.publishProductId}`}>{configurableProductData.warehouseName} </p>
                        <ProductDetailsInventory
                          inStockQuantity={inStockQty}
                          allowBackOrdering={configAllowBackOrdering}
                          disablePurchasing={configDisablePurchasing}
                          retailPrice={configurableProductPrice}
                          customClass="text-xs"
                          stockNotification={stockNotification}
                          sku={sku}
                          childProductSku={childSku}
                          productId={0}
                        />
                      </div>
                    </div>
                  )}
                  {!Number.isNaN(typicalLeadTime) && Number(typicalLeadTime) > 0 && (
                    <div className="flex gap-5 text-sm">
                      <TypicalLeadTiming typicalLeadTime={typicalLeadTime as number} productType={String(productType)} customLabelWidth="w-32" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </td>
        {renderConfigurableAttributes()}
        <td className="text-sm font-semibold px-5 py-3">
          {(!loginRequired || userData) && (
            <div className="flex flex-row	items-center">
              {isLoginToSeePricing && !userData ? null : (
                <Price
                  retailPrice={configurableProductData.retailPrice}
                  currencyCode={currencySuffix}
                  salesPrice={configurableProductData.salesPrice}
                  id={configurableProductData.publishProductId}
                />
              )}
            </div>
          )}
        </td>
        <td className="text-sm font-semibold px-5 py-3">
          <ConfigurableProductGridInput
            inStockQuantity={inStockQty}
            minQuantity={minQty}
            maxQuantity={maxQty}
            configProductSku={productSku}
            disablePurchasing={configDisablePurchasing}
            retailPrice={configurableProductPrice}
            handleBlurInput={handleBlur}
            disabled={enableAddToCartButton}
            productId={configurableProductData?.publishProductId}
          />
        </td>
      </>
    );
  };

  const renderConfigurableProducts = (configurableProducts: IConfigurableProduct[]) => {
    return (
      configurableProducts &&
      configurableProducts.map((configurableProduct: IConfigurableProduct) => {
        return (
          <tr className="border-x border-t border-gray-200" key={configurableProduct.publishProductId}>
            {renderProductAttributes(configurableProduct)}
          </tr>
        );
      })
    );
  };

  return <>{renderConfigurableProducts(productGridData)}</>;
}
