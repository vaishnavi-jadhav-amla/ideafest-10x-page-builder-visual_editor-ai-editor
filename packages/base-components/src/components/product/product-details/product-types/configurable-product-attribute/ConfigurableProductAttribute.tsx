"use client";

import "./ConfigurableProduct.scss";

import { IAttributesDetails, IParameterProduct, IQuery } from "@znode/types/product";
import { IConfigurableAttribute, IProductAttributes } from "@znode/types/attribute";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { IProductDetails } from "@znode/types/product-details";
import Input from "../../../../common/input/Input";
import LoaderComponent from "../../../../common/loader-component/LoaderComponent";
import { ValidationMessage } from "../../../../../components/common/validation-message";
import { useQuickViewVariant } from "../../../../../stores/quick-view-config";
import { useTranslationMessages } from "@znode/utils/component";
import { CustomImage } from "../../../../common/image";


interface Props {
  products: IProductDetails;
  isQuickView: boolean;
}

// eslint-disable-next-line max-lines-per-function
const ConfigurableAttributeComponent: React.FC<Props> = ({ products, isQuickView }) => {
  const router = useRouter();
  const pathName = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const commonTranslations = useTranslationMessages("Common");
  const { configurableData, configurableProductId, sku, configurableproductSku: configurableProductSku } = products as IProductDetails;
  const searchParams = useSearchParams();
  const configurableDataContainerRef = useRef<HTMLDivElement>(null);
  const [selectedVariantRow, setSelectedVariantRow] = useState<string | null>("");
  const { setQuickViewVariant } = useQuickViewVariant();

  const paramData = useSearchParams();
  let facetData: IParameterProduct = {};
  facetData = {
    facetGroup: (paramData.has("facetGroup") && paramData.get("facetGroup")) || " ",
    fromSearch: (paramData.has("fromSearch") && paramData.get("fromSearch")) || "",
    pageSize: (paramData.has("pageSize") && paramData.get("pageSize")) || "",
    pageNumber: (paramData.has("pageNumber") && paramData.get("pageNumber")) || "",
  };

  useEffect(() => {
    document.body.classList.remove("overflow-hidden");
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const handleWindowLoad = () => {
    window &&
      window.addEventListener("load", () => {
        router.push(pathName);
      });
  };

  useEffect(() => {
    if (searchParams.has("ParentProductId")) {
      const configurableDataContainerElement = configurableDataContainerRef.current;
      if (configurableDataContainerElement && typeof window !== "undefined" && window.innerWidth < 500) {
        configurableDataContainerElement.scrollIntoView({ block: "center", behavior: "instant" });
      }
    }

    if (searchParams.has("codes")) {
      setSelectedVariantRow(searchParams.get("codes") || "");
    } else if (configurableData && configurableData?.configurableAttributes && configurableData.configurableAttributes.length > 0) {
      setSelectedVariantRow(configurableData.configurableAttributes[0]?.attributeCode ?? "");
    }
    handleWindowLoad();
    return () => {
      window.removeEventListener("load", handleWindowLoad);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isLoading]);

  const getCodes = (configProductData: IConfigurableAttribute) => {
    return (
      configProductData?.configurableAttributes &&
      configProductData?.configurableAttributes.map((configAttribute: IProductAttributes) => {
        return `${configAttribute?.attributeCode}`;
      })
    );
  };

  const getValues = (configProductData: IConfigurableAttribute, newValue: string, newCode: string) => {
    const attributeCodesArray: string[] = [];
    const attributeValuesArray: string[] = [];

    configProductData?.configurableAttributes?.forEach((configAttribute: IAttributesDetails) => {
      attributeCodesArray?.push(configAttribute?.attributeCode as string);
      attributeValuesArray?.push(configAttribute?.selectedAttributeValue?.at(0) as string);
    });

    const changedCodeIndex = attributeCodesArray?.indexOf(newCode);
    attributeValuesArray[changedCodeIndex] = newValue;
    return attributeValuesArray && attributeValuesArray.map((value: string) => value);
  };

  const handleAttributeChange = (value: string, codes: string, parentProductId: number, sku: string, configurableProductSKU?: string) => {
    if (configurableData) {
      const queryPayload: IQuery = {
        parentProductId: String(parentProductId),
        codes,
        values: encodeURIComponent(value),
        parentProductSKU: sku,
        sku: configurableProductSKU || "",
        selectedCodes: getCodes(configurableData)?.toString() as string,
        selectedValues: getValues(configurableData, value, codes).join("|"),
        parentProductSku: sku,
      };
      if (isQuickView) {
        setQuickViewVariant(queryPayload);
      } else {
        const query = `?facetGroup=${facetData.facetGroup}&fromSearch=${facetData.fromSearch}&pageSize= ${facetData.pageSize}&pageNumber=${facetData.pageNumber}`;
        const isFacetDataEmpty = Object.values(facetData).some((value) => value === "");
        const productParams = new URLSearchParams({
          parentProductId: String(parentProductId),
          codes,
          values: encodeURIComponent(value),
          parentProductSKU: sku,
          sku: configurableProductSKU || "",
          selectedCodes: getCodes(configurableData)?.toString() as string,
          selectedValues: getValues(configurableData, value, codes).join("|"),
        });
        const updatedUrl = !isFacetDataEmpty ? `${pathName}${query}${productParams.toString()}` : `${pathName}?${productParams.toString()}`;
        const urlObj = new URL(window?.location?.href || "");
        const currentUrl = `${urlObj?.pathname || ""}${urlObj?.search || ""}`;
        if (updatedUrl !== currentUrl) {
          document.body.classList.add("overflow-hidden");
          setIsLoading(true);
          router.push(updatedUrl);
        }
      }
    }
  };

  const renderConfigurableAttributes = (configurableAttributeData: IAttributesDetails, variantCode: string) => {
    if (configurableAttributeData?.configurableAttribute && configurableAttributeData?.configurableAttribute.length > 0) {
      const sortedData = configurableAttributeData?.configurableAttribute.sort((a: IProductAttributes, b: IProductAttributes) => Number(a.displayOrder) - Number(b.displayOrder));
      return sortedData.map((swatchAttribute: IProductAttributes, i: number) => {
        const isSelectedSwatch = swatchAttribute?.attributeValue && configurableAttributeData?.selectedAttributeValue?.includes(swatchAttribute?.attributeValue);
        const isAvailable = swatchAttribute?.isDisabled && variantCode !== null && variantCode !== selectedVariantRow && selectedVariantRow !== "";
        if (swatchAttribute.imagePath) {
          return (
            <div
              data-test-selector={`div${swatchAttribute?.attributeValue}`}
              className="w-max h-9"
              onClick={() =>
                handleAttributeChange(
                  swatchAttribute?.attributeValue || "",
                  configurableAttributeData && configurableAttributeData.attributeCode ? configurableAttributeData.attributeCode : "",
                  configurableProductId ? configurableProductId : 0,
                  sku ? sku : "",
                  configurableProductSku
                )
              }
            >
              <Input
                type="radio"
                key={`${i}-${isSelectedSwatch}`}
                className="hidden"
                id={`${configurableAttributeData?.attributeName}-${swatchAttribute?.attributeValue}`}
                value={swatchAttribute?.attributeValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleAttributeChange(
                    e.target.value,
                    configurableAttributeData && configurableAttributeData.attributeCode ? configurableAttributeData.attributeCode : "",
                    configurableProductId ? configurableProductId : 0,
                    sku ? sku : "",
                    configurableProductSku
                  )
                }
                dataTestSelector={`txt${swatchAttribute?.attributeValue}`}
                checked={isSelectedSwatch || false}
                ariaLabel="configured product"
              />
              <label className={"cursor-pointer font-semibold"} htmlFor={`${configurableAttributeData?.attributeName}-${swatchAttribute?.attributeValue}`}>
                <CustomImage
                  src={swatchAttribute?.imagePath}
                  alt={swatchAttribute?.attributeValue || ""}
                  title={swatchAttribute?.attributeValue}
                  width={36}
                  height={36}
                  className={`border border-gray-600 min-h-[36px] max-h-[36px] overflow-hidden
                            ${isSelectedSwatch ? "border-2 border-orange-500" : ""}
                              `}
                  dataTestSelector={`img${swatchAttribute?.attributeValue}`}
                />
              </label>
              {isAvailable && <div className="scratch-img-attribute"></div>}
            </div>
          );
        } else if (swatchAttribute.swatchText) {
          return (
            <div
              className="w-max h-9"
              data-test-selector={`div${swatchAttribute?.attributeValue} `}
              onClick={() =>
                handleAttributeChange(
                  swatchAttribute?.attributeValue || "",
                  configurableAttributeData && configurableAttributeData.attributeCode ? configurableAttributeData.attributeCode : "",
                  configurableProductId ? configurableProductId : 0,
                  sku ? sku : "",
                  configurableProductSku
                )
              }
            >
              <Input
                type="radio"
                key={`${i}-${isSelectedSwatch}`}
                className="hidden"
                id={`${configurableAttributeData?.attributeName}-${swatchAttribute?.attributeValue}`}
                value={swatchAttribute?.attributeValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleAttributeChange(
                    e.target.value,
                    configurableAttributeData && configurableAttributeData.attributeCode ? configurableAttributeData.attributeCode : "",
                    configurableProductId ? configurableProductId : 0,
                    sku ? sku : "",
                    configurableProductSku
                  )
                }
                dataTestSelector={`txt${swatchAttribute?.attributeValue}`}
                labelDataTestSelector={`lbl${swatchAttribute?.attributeValue}`}
                checked={isSelectedSwatch || false}
                ariaLabel="configured product"
              />
              <label
                className={"cursor-pointer font-semibold"}
                htmlFor={`${configurableAttributeData?.attributeName}-${swatchAttribute?.attributeValue}`}
                title={swatchAttribute?.attributeValue}
              >
                <div
                  className={`border border-gray-600  h-[35px] w-[35px] rounded
                        ${isSelectedSwatch ? "border-2 border-orange-500" : ""}`}
                  color={swatchAttribute?.swatchText}
                  style={{ backgroundColor: swatchAttribute?.swatchText }}
                ></div>
              </label>
              {isAvailable && <div className="scratch-img-attribute"></div>}
            </div>
          );
        } else {
          return (
            <div
              className="w-max h-9"
              data-test-selector={`div${swatchAttribute?.attributeValue} `}
              onClick={() =>
                handleAttributeChange(
                  swatchAttribute?.attributeValue || "",
                  configurableAttributeData && configurableAttributeData.attributeCode ? configurableAttributeData.attributeCode : "",
                  configurableProductId ? configurableProductId : 0,
                  sku ? sku : "",
                  configurableProductSku
                )
              }
            >
              <Input
                type="radio"
                key={`${i}-${isSelectedSwatch}`}
                className="hidden"
                id={`${configurableAttributeData?.attributeName}-${swatchAttribute?.attributeValue}`}
                value={swatchAttribute?.attributeValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleAttributeChange(
                    e.target.value,
                    configurableAttributeData && configurableAttributeData.attributeCode ? configurableAttributeData.attributeCode : "",
                    configurableProductId ? configurableProductId : 0,
                    sku ? sku : "",
                    configurableProductSku
                  )
                }
                dataTestSelector={`txt${swatchAttribute?.attributeValue}`}
                labelDataTestSelector={`lbl${swatchAttribute?.attributeValue}`}
                checked={isSelectedSwatch || false}
                ariaLabel="configured product"
              />
              <label htmlFor={`${configurableAttributeData?.attributeName}-${swatchAttribute?.attributeValue}`}>
                <div
                  className={`font-semibold text-sm cursor-pointer border border-gray-600 flex items-center justify-center px-2 h-[35px] w-auto rounded
                      ${isSelectedSwatch ? "border-2 border-orange-500" : ""} 
                          ${isAvailable ? "scratch-attribute" : ""}`}
                >
                  {swatchAttribute?.attributeValue}
                </div>
              </label>
            </div>
          );
        }
      });
    }
  };

  const renderAttributes = (configurableData: IConfigurableAttribute) => {
    return (
      configurableData?.configurableAttributes &&
      configurableData?.configurableAttributes.map((configurableAttribute: IAttributesDetails) => {
        return (
          <div className="pb-2" key={configurableAttribute?.attributeCode}>
            <div className="font-semibold pb-2" data-test-selector={`div${configurableAttribute?.attributeName} `}>
              {configurableAttribute?.attributeName}
            </div>
            <div className="flex gap-4 flex-wrap justify-start">{renderConfigurableAttributes(configurableAttribute, configurableAttribute?.attributeCode as string)}</div>
          </div>
        );
      })
    );
  };

  return (
    <>
      <div className="mb-3">
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-300 bg-opacity-40 z-50">
            <div className="relative">
              <LoaderComponent isLoading={true} height="50px" width="50px" />
            </div>
          </div>
        )}
        <div ref={configurableDataContainerRef} className="w-full">
          {configurableData && renderAttributes(configurableData)}
        </div>
      </div>
      {configurableData?.combinationErrorMessage ? (
        <ValidationMessage
          message={commonTranslations(configurableData?.combinationErrorMessage)}
          dataTestSelector="combinationErrorMessage"
          customClass="text-errorColor text-sm"
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default ConfigurableAttributeComponent;
