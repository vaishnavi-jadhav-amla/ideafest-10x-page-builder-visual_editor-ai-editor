/* eslint-disable max-lines-per-function */
"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { IAddToCartNotification, ICart, ICartItem } from "@znode/types/cart";
import { IChildProductData, IProductDetails, IPublishBundleProductsDetails, ISelectedAddOn } from "@znode/types/product-details";
import { INVENTORY, PRODUCT, PRODUCT_TYPE } from "@znode/constants/product";
import { IProductAddOn, IProductAddOnValues } from "@znode/types/product";
import { checkForExistingCartId, generatePayload, setCartCookie, useTranslationMessages } from "@znode/utils/component";
import { getAttributeValue, stringToBooleanV2 } from "@znode/utils/common";

import { COMMON } from "@znode/constants/common";
import { IAttributeDetails } from "@znode/types/attribute";
import { addToCart } from "../../../../http-request/cart/add-to-cart";
import { getCartItems } from "../.././../../http-request/cart/get-cart-items";
import { getCartNumber } from "../.././../../http-request/cart/get-cart-number";
import { useModal } from "../../../../stores";
import { useProduct } from "../../../../stores/product";
import { useToast } from "../../../../stores/toast";
import { useTranslations } from "next-intl";

interface ProductDetailsProps {
  productDetails: IProductDetails;
  configurableErrorMessage?: string;
  isCallForPricingPromotion?: boolean;
  groupProductData: IChildProductData[];
  isProductCompare?: boolean;
}

const submitAddToCart = async (product: IProductDetails) => {
  const cartId = checkForExistingCartId();
  const payloadCart = generatePayload(product, cartId);
  const addToCartResponse = await addToCart(payloadCart);

  if (addToCartResponse?.addToCartStatus && addToCartResponse.cartId && addToCartResponse.cartNumber) {
    setCartCookie(addToCartResponse.cartId, addToCartResponse.cartNumber);
  }
  return addToCartResponse;
};

export const useAddToCart = ({ productDetails, configurableErrorMessage, isCallForPricingPromotion, isProductCompare, groupProductData = [] }: ProductDetailsProps) => {
  const productTranslations = useTranslations("Product");
  const commonTranslations = useTranslationMessages("Common");
  const { error } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [qty, setQty] = useState<number>(1);
  const [validationMessage, setValidationMessage] = useState("");
  const [isPersonalizedFormValid, setIsPersonalizedFormValid] = useState(true);
  const [enableAddToCartButton, setEnableAddToCartButton] = useState(true);
  const [personalizeCodesAndValues, setPersonalizeCodesAndValues] = useState<{ [key: string]: string }>({});
  const { updateCartCount, product, setSelectedAddons, setAddToCartTriggerNotification, setAddToCartNotificationData, setProductOutOfStock, setIsGroupProduct } = useProduct();
  const [addOnError, setAddOnError] = useState<string>("");
  const [isInput, setIsInput] = useState<boolean>(false);

  const isAddonShow = !isProductCompare && productDetails.addOns?.length !== 0;
  const { closeModal } = useModal();
  const { inStockQty, disablePurchasing, retailPrice, isObsolete, quantity, productType, publishBundleProducts } = productDetails;
  const { selectedAddons } = product;

  const validateAllSku = async () => {
    const allSelectedSkuList: IProductAddOnValues[] = [];
    selectedAddons.forEach((items: IProductAddOn) => {
      items.addOnValues?.forEach((item: IProductAddOnValues) => allSelectedSkuList.push(item));
    });

    if (allSelectedSkuList && allSelectedSkuList.length > 0) {
      const checkedQty = allSelectedSkuList.filter((item) => item.quantity === 0);
      const dontTrackInventory = allSelectedSkuList.map((item) => item.dontTrackInventory)[0];
      const allowBackOrdering = allSelectedSkuList.map((item) => item.allowBackOrdering)[0];
      if (checkedQty.length > 0 && !dontTrackInventory && !allowBackOrdering) {
        setEnableAddToCartButton(false);
        setIsInput(true);
      } else {
        setEnableAddToCartButton(true);
        setIsInput(false);
      }
    }
  };
 
  const isCallForPricing = stringToBooleanV2( getAttributeValue(productDetails.attributes as [], PRODUCT.CALL_FOR_PRICING, "attributeValues"));
  const outOfStockOption = getAttributeValue(productDetails.attributes as [], PRODUCT.OUT_OF_STOCK_OPTIONS) as string;
  const isProductOutOfStock =
    retailPrice &&
    retailPrice > 0 &&
    (disablePurchasing || outOfStockOption === PRODUCT.DISABLE_PURCHASING) &&
    (inStockQty || quantity || 0) <= 0 &&
    productType !== PRODUCT_TYPE.BUNDLE_PRODUCT
      ? true
      : false;

  useEffect(() => {
    checkAddToCartButton();
    return () => {
      setProductOutOfStock({ productId: 0, message: productTranslations("outOfStock") });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddons]);

  useEffect(() => {
    if (configurableErrorMessage || isCallForPricingPromotion === true) {
      setEnableAddToCartButton(false);
    } else {
      setEnableAddToCartButton(true);
    }
  }, [configurableErrorMessage, isCallForPricingPromotion]);

  useEffect(() => {
    setQty(productDetails?.minimumQuantity || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function checkAddToCartButton() {
    if (retailPrice !== null) {
      setEnableAddToCartButton(true);
    }
    if (disablePurchasing && (inStockQty || quantity || 0) <= 0 && productType === PRODUCT_TYPE.BUNDLE_PRODUCT) {
      setEnableAddToCartButton(false);
      return;
    }
    if (retailPrice === null || (disablePurchasing && (inStockQty || quantity || 0) <= 0)) {
      setEnableAddToCartButton(false);
      return;
    }
    if (String(isObsolete) === "true") {
      setEnableAddToCartButton(false);
      return;
    }
    if (isCallForPricingPromotion || isCallForPricing) {
      setEnableAddToCartButton(false);
      return;
    }
    if (!productDetails?.addOns || productDetails.addOns.length === 0 || !productDetails.addOns.some((x) => x.isRequired)) {
      setEnableAddToCartButton(true);
      return;
    }
    isAddonShow && validateAllSku();
  }

  const productData = (productDetails: IProductDetails) => {
    return {
      id: productDetails.sKU,
      name: productDetails.name,
      brand: productDetails.brandName,
      quantity: productDetails.quantity,
      price: productDetails.retailPrice,
      variant: productDetails.configurableProductSKUs,
    };
  };

  function BundledProductsMinQtyForDisablePurchasing(products: IPublishBundleProductsDetails[]): {
    disablePurchasing: number;
    isDisablePurchasingProducts: boolean;
    bundleProductQuantity: number;
  } {
    let disablePurchasingCount = 0;
    let minInStockQty: number | null = null;
    let minBundleProductQuantity = 0;

    products.forEach((element) => {
      if (element.disablePurchasing) {
        disablePurchasingCount++;

        if (minInStockQty === null || Number(element.inStockQty) < minInStockQty) {
          minInStockQty = Number(element.inStockQty);
          minBundleProductQuantity = element.bundleProductQuantity;
        }
      }
    });

    return {
      disablePurchasing: disablePurchasingCount > 0 ? minInStockQty || 0 : 0,
      isDisablePurchasingProducts: disablePurchasingCount > 0,
      bundleProductQuantity: minBundleProductQuantity,
    };
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, product: IProductDetails) => {
    const quantityVal = event.target.value;
    if (!quantityVal.match(/\D/g)) {
      const inputQuantity = Number(quantityVal);
      const minQty = getAttributeValue(productDetails.attributes as [], PRODUCT.MINIMUM_QUANTITY, "attributeValues");
      const maxQty = getAttributeValue(productDetails.attributes as [], PRODUCT.MAXIMUM_QUANTITY, "attributeValues");
      const productType = product.productType === PRODUCT_TYPE.BUNDLE_PRODUCT;

      const bundledQuantity =
        productType && product.publishBundleProducts && product.publishBundleProducts.length > 0
          ? BundledProductsMinQtyForDisablePurchasing(product.publishBundleProducts || [])
          : { disablePurchasing: 0, isDisablePurchasingProducts: false, bundleProductQuantity: 0 };

      if (isNaN(inputQuantity)) {
        setValidationMessage(productTranslations("invalidQuantityMessage"));
        setEnableAddToCartButton(false);
        return;
      }
      setValidationMessage("");
      if (quantityVal.trim() !== "") {
        setQty(Number.parseInt(quantityVal, 10));
        if (isCallForPricingPromotion!==true)
        setEnableAddToCartButton(true);
        if (inputQuantity === 0) {
          setValidationMessage(productTranslations("invalidQuantityMessage"));
          setEnableAddToCartButton(false);
        } else if (inputQuantity > (product?.quantity || 0) && (productDetails.disablePurchasing === true || outOfStockOption === PRODUCT.DISABLE_PURCHASING) && !productType) {
          setValidationMessage(`${productTranslations("quantityExceedMessage")} (${product?.quantity || 0}).`);
          setEnableAddToCartButton(false);
        } else if (
          inputQuantity > (parseInt(`${Number(bundledQuantity.disablePurchasing) / bundledQuantity.bundleProductQuantity}`) || 0) &&
          bundledQuantity.isDisablePurchasingProducts &&
          productType
        ) {
          setValidationMessage(
            `${productTranslations("quantityExceedMessage")} (${parseInt(`${Number(bundledQuantity.disablePurchasing) / bundledQuantity.bundleProductQuantity}`) || 0}).`
          );
          setEnableAddToCartButton(false);
        } else if (Number(inputQuantity) > Number(maxQty) || +inputQuantity < Number(minQty)) {
          setValidationMessage(`${productTranslations("quantityInBetweenMessage")} ${minQty} ${productTranslations("to")} ${maxQty}.`);
          setEnableAddToCartButton(false);
        }
      } else {
        setEnableAddToCartButton(false);
        setQty(productDetails?.minimumQuantity || 1);
        setValidationMessage(productTranslations("enterNumericValue"));
      }
      isAddonShow && validateAllSku();
    } else {
      setValidationMessage(productTranslations("invalidQuantityMessage"));
      setEnableAddToCartButton(false);
      return;
    }
  };

  /** Out of Stock validation for simple product */
  const getCPCart = async () => {
    const cartNumber = await getCartNumber();
    if (cartNumber) {
      const cartData: ICart = await getCartItems(cartNumber);
      setIsLoading(false);
      return cartData;
    }
    setIsLoading(false);
    return null;
  };

  const validateSimpleProductWithMaxQtyAndInStockQty = ({ publishProductId, quantity }: { publishProductId: number; quantity: number }, matchedCartItem: ICartItem) => {
    if (!matchedCartItem) {
      return false;
    }
    const inStockQty = quantity;
    const maximumQuantity = Number(matchedCartItem.maximumQuantity);
    const updatedQuantity = matchedCartItem.quantity + qty;

    if (
      (matchedCartItem.quantity === maximumQuantity && matchedCartItem.outOfStockOption === PRODUCT.DISABLE_PURCHASING && matchedCartItem.quantity !== inStockQty) ||
      (matchedCartItem.quantity === maximumQuantity && matchedCartItem.outOfStockOption !== PRODUCT.DISABLE_PURCHASING)
    ) {
      setProductOutOfStock({
        productId: publishProductId ?? 0,
        message: productTranslations("maximumQuantityLimitExceed"),
      });
      setEnableAddToCartButton(false);
      return true;
    } else if (matchedCartItem.outOfStockOption === PRODUCT.DISABLE_PURCHASING && matchedCartItem.quantity === Number(inStockQty)) {
      setProductOutOfStock({
        productId: publishProductId ?? 0,
        message: productTranslations("outOfStock"),
      });
      setEnableAddToCartButton(false);

      return true;
    } else if (
      (updatedQuantity > maximumQuantity && matchedCartItem.outOfStockOption === PRODUCT.DISABLE_PURCHASING && maximumQuantity <= Number(inStockQty)) ||
      (updatedQuantity > maximumQuantity && matchedCartItem.outOfStockOption !== PRODUCT.DISABLE_PURCHASING) ||
      (matchedCartItem.outOfStockOption === PRODUCT.DISABLE_PURCHASING && updatedQuantity > Number(inStockQty))
    ) {
      setProductOutOfStock({
        productId: publishProductId ?? 0,
        message: productTranslations("validationMessage", {
          remainingQty: maximumQuantity < Number(inStockQty) ? maximumQuantity - matchedCartItem.quantity : Number(inStockQty) - matchedCartItem.quantity,
        }),
      });
      setEnableAddToCartButton(false);
      return true;
    } else {
      return false;
    }
  };

  const validateGroupChildSimpleProductWithMaxQtyAndInStockQty = (
    { publishProductId, quantity, inStockQty }: { publishProductId: number; quantity: number; inStockQty: number },
    matchedCartItem: ICartItem | null
  ) => {
    if (!matchedCartItem) {
      return { addToCart: false, message: "", productId: publishProductId ?? 0 };
    }
    const maximumQuantity = Number(matchedCartItem.maximumQuantity);
    const updatedQuantity = matchedCartItem.quantity + quantity;

    if (
      (matchedCartItem.quantity === maximumQuantity && matchedCartItem.outOfStockOption === PRODUCT.DISABLE_PURCHASING && matchedCartItem.quantity !== inStockQty) ||
      (matchedCartItem.quantity === maximumQuantity && matchedCartItem.outOfStockOption !== PRODUCT.DISABLE_PURCHASING)
    ) {
      return { addToCart: true, message: productTranslations("maximumQuantityLimitExceed"), productId: publishProductId ?? 0 };
    } else if (matchedCartItem.outOfStockOption === PRODUCT.DISABLE_PURCHASING && matchedCartItem.quantity === Number(inStockQty)) {
      return { addToCart: true, message: productTranslations("outOfStock"), productId: publishProductId ?? 0 };
    } else if (
      (updatedQuantity > maximumQuantity && matchedCartItem.outOfStockOption === PRODUCT.DISABLE_PURCHASING && maximumQuantity <= Number(inStockQty)) ||
      (updatedQuantity > maximumQuantity && matchedCartItem.outOfStockOption !== PRODUCT.DISABLE_PURCHASING) ||
      (matchedCartItem.outOfStockOption === PRODUCT.DISABLE_PURCHASING && updatedQuantity > Number(inStockQty))
    ) {
      return {
        addToCart: true,
        message: productTranslations("validationMessage", {
          remainingQty:
            maximumQuantity < Number(inStockQty) || matchedCartItem.outOfStockOption !== PRODUCT.DISABLE_PURCHASING
              ? maximumQuantity - matchedCartItem.quantity
              : Number(inStockQty) - matchedCartItem.quantity,
        }),
        productId: publishProductId ?? 0,
      };
    } else {
      return { addToCart: false, message: "", productId: publishProductId ?? 0 };
    }
  };

  function getLowestQuantity(childBundleItems: IPublishBundleProductsDetails[]): { inStockQty: number; outOfStockOption: string } | null {
    if (!Array.isArray(childBundleItems) || childBundleItems.length === 0) return null;
    const bundledProductMinQty = childBundleItems.reduce((min: IPublishBundleProductsDetails, current: IPublishBundleProductsDetails) => {
      return Number(current.inStockQty) < Number(min.inStockQty) ? current : min;
    });

    return {
      inStockQty: parseInt(`${Number(bundledProductMinQty.inStockQty) / bundledProductMinQty.bundleProductQuantity}`) || 0,
      outOfStockOption: bundledProductMinQty.outOfStockOption as string,
    };
  }

  const validateBundledProductWithMaxQtyAndInStockQty = (productInformation: IProductDetails, matchedCartItem: ICartItem) => {
    if (!matchedCartItem) {
      return false;
    }
    const filterProductList = productInformation.publishBundleProducts?.filter((item) => {
      const code = item.outOfStockOption;
      return code?.toLowerCase() === INVENTORY.DISABLE_PURCHASING.toLowerCase();
    });

    const maximumQuantity = Number(matchedCartItem.maximumQuantity);
    const publishProductId = matchedCartItem.productId;
    const bundleParentProduct = getLowestQuantity(filterProductList || []);
    const bundleInStockQty = bundleParentProduct?.inStockQty || maximumQuantity || 0;

    const updatedQuantity = matchedCartItem.quantity + qty;

    if (
      (matchedCartItem.quantity === maximumQuantity && bundleParentProduct?.outOfStockOption === PRODUCT.DISABLE_PURCHASING && matchedCartItem.quantity !== bundleInStockQty) ||
      (matchedCartItem.quantity === maximumQuantity && bundleParentProduct?.outOfStockOption !== PRODUCT.DISABLE_PURCHASING)
    ) {
      setProductOutOfStock({
        productId: publishProductId ?? 0,
        message: productTranslations("maximumQuantityLimitExceed"),
      });
      setEnableAddToCartButton(false);
      return true;
    } else if (bundleParentProduct?.outOfStockOption === PRODUCT.DISABLE_PURCHASING && matchedCartItem.quantity === Number(bundleInStockQty)) {
      setProductOutOfStock({
        productId: publishProductId ?? 0,
        message: productTranslations("outOfStock"),
      });
      setEnableAddToCartButton(false);

      return true;
    } else if (
      (updatedQuantity > maximumQuantity && bundleParentProduct?.outOfStockOption === PRODUCT.DISABLE_PURCHASING && maximumQuantity <= Number(bundleInStockQty)) ||
      (updatedQuantity > maximumQuantity && bundleParentProduct?.outOfStockOption !== PRODUCT.DISABLE_PURCHASING) ||
      (bundleParentProduct?.outOfStockOption === PRODUCT.DISABLE_PURCHASING && updatedQuantity > Number(bundleInStockQty))
    ) {
      setProductOutOfStock({
        productId: publishProductId ?? 0,
        message: productTranslations("validationMessage", {
          remainingQty: maximumQuantity < bundleInStockQty ? maximumQuantity - matchedCartItem.quantity : bundleInStockQty - matchedCartItem.quantity,
        }),
      });
      setEnableAddToCartButton(false);
      return true;
    } else {
      return false;
    }
  };

  const validateGroupProductWithMaxQtyAndInStockQty = (cartData: ICartItem[] | null) => {
    const filterChildProduct = groupProductData.filter((item) => item.quantity > 0);
    const validateAllChild = filterChildProduct.map((childItems) => {
      let matchedCartItem: ICartItem | null = null;
      cartData?.forEach((cartItem) => {
        if (cartItem.sku === childItems.sku) {
          if (matchedCartItem) {
            matchedCartItem.quantity += cartItem.quantity;
          } else {
            matchedCartItem = cartItem;
          }
        }
      });
      return {
        sku: childItems.sku,
        ...validateGroupChildSimpleProductWithMaxQtyAndInStockQty(
          { publishProductId: childItems.productId, quantity: childItems.quantity, inStockQty: childItems.inStockQty },
          matchedCartItem
        ),
      };
    });
    setIsGroupProduct(validateAllChild);

    return validateAllChild.some((childProduct) => childProduct.addToCart);
  };

  const checkProductStockData = (cartData: ICart | null, productDetails: IProductDetails) => {
    let matchedCartItem: ICartItem | null = null;
    cartData?.cartItems?.forEach((cartItem) => {
      if (cartItem.sku === productDetails.sku || (productDetails.isConfigurable && cartItem.sku === productDetails.configurableproductSku)) {
        if (matchedCartItem) {
          matchedCartItem.quantity += cartItem.quantity;
        } else {
          matchedCartItem = cartItem;
        }
      }
    });

    if (productType === PRODUCT_TYPE.SIMPLE_PRODUCT && matchedCartItem) {
      return validateSimpleProductWithMaxQtyAndInStockQty(
        { publishProductId: Number(productDetails.publishProductId), quantity: Number(productDetails.quantity) },
        matchedCartItem as ICartItem
      );
    } else if (productType === PRODUCT_TYPE.BUNDLE_PRODUCT && matchedCartItem) {
      return validateBundledProductWithMaxQtyAndInStockQty(productDetails, matchedCartItem as ICartItem);
    } else if (productType === PRODUCT_TYPE.GROUPED_PRODUCT || (productType === PRODUCT_TYPE.CONFIGURABLE_PRODUCT && productDetails.isDisplayVariantsOnGrid)) {
      const validateChild = validateGroupProductWithMaxQtyAndInStockQty(cartData?.cartItems as ICartItem[]);
      if (validateChild) {
        error(commonTranslations("failedToAddAProduct"));
      }
      return validateChild;
    }

    return false;
  };

  const getAddToCartInstockQuantityDisable = async () => {
    setIsLoading(true);
    const cartData: ICart | null = await getCPCart();
    if (Number(cartData?.cartItems?.length) > 0) {
      const checkProductStock = cartData && productDetails ? checkProductStockData(cartData, productDetails) : false;
      setIsLoading(false);
      return checkProductStock;
    } else {
      setIsLoading(false);
      return false;
    }
  };

  const setAddToCartProduct = async (product: IProductDetails) => {
    setIsGroupProduct([]);
    const isOutOfStock = await getAddToCartInstockQuantityDisable();
    if (!isOutOfStock) {
      setAddToCartModel(product);
    }
  };

  async function setAddToCartModel(product: IProductDetails) {
    const requiredAddOns = product && product?.addOns?.filter((x: IProductAddOn) => x.isRequired);
    if (product.addOns === null || (product.addOns && product.addOns.length === 0) || (requiredAddOns && requiredAddOns?.length === 0)) {
      if (selectedAddons) {
        const addOnSKUs = selectedAddons.flatMap(
          (item: IProductAddOn) =>
            item.addOnValues &&
            item.addOnValues.map((value: IProductAddOnValues) => ({
              groupName: item.groupName,
              sku: value.sku,
            }))
        );
        product.addOnProductSKUs = addOnSKUs as ISelectedAddOn[];
      }
      addToCart(product);
    } else {
      if (selectedAddons && selectedAddons.length > 0) {
        const selectedGroupNames = selectedAddons.map((value: IProductAddOn) => value.groupName);
        const areAllRequiredAddOnsSelected = requiredAddOns?.every((addOn: IProductAddOn) => selectedGroupNames.includes(addOn.groupName));
        areAllRequiredAddOnsSelected && setEnableAddToCartButton(areAllRequiredAddOnsSelected);
        if (areAllRequiredAddOnsSelected) {
          if (selectedAddons) {
            const addOnSKUs = selectedAddons.flatMap(
              (item: IProductAddOn) =>
                item.addOnValues &&
                item.addOnValues.map((value: IProductAddOnValues) => ({
                  groupName: item.groupName,
                  sku: value.sku,
                }))
            );
            product.addOnProductSKUs = addOnSKUs as ISelectedAddOn[];
          }
          addToCart(product);
        } else {
          setAddOnError(PRODUCT.ADD_ON_ERROR);
        }
      } else {
        setAddOnError(PRODUCT.ADD_ON_ERROR);
      }
    }
  }

  async function addToCart(product: IProductDetails) {
    if (qty) {
      groupProductData = groupProductData.filter((item) => item.quantity > 0) || [];
      const inputQuantity = Number(qty);
      const minQty = getAttributeValue(productDetails.attributes as [], PRODUCT.MINIMUM_QUANTITY, "attributeValues");
      const maxQty = getAttributeValue(productDetails.attributes as [], PRODUCT.MAXIMUM_QUANTITY, "attributeValues");
      if (inputQuantity) {
        setValidationMessage("");
        setQty(inputQuantity);
        if (isCallForPricingPromotion!==true)
        setEnableAddToCartButton(true);
        if (inputQuantity === 0 || inputQuantity < Number(minQty) || inputQuantity > Number(maxQty)) {
          setValidationMessage(productTranslations("selectedQuantityMessage", { minQty, maxQty }));
          setEnableAddToCartButton(false);
        } else if (
          product.productType !== PRODUCT_TYPE.BUNDLE_PRODUCT &&
          !product.isDisplayVariantsOnGrid &&
          inputQuantity > Number(product?.quantity || 0) &&
          (productDetails?.disablePurchasing === true || outOfStockOption === PRODUCT.DISABLE_PURCHASING)
        ) {
          setValidationMessage(` ${productTranslations("quantityExceedMessage")} (${product?.quantity || 0}).`);
          setEnableAddToCartButton(false);
        } else {
          setIsLoading(true);

          const productData = { ...product, quantity: qty, addOnProductSKUs: product?.addOnProductSKUs };
          if (Object.keys(personalizeCodesAndValues)?.length > 0) {
            productData.personalizeList = [];
            Object.keys(personalizeCodesAndValues).forEach((key: string) => {
              return productData.personalizeList?.push({ code: key, value: personalizeCodesAndValues[key] });
            });
          }
          const groupProductList: IChildProductData[] = [];
          if (((productData.groupProductList && productData.groupProductList.length > 0) || productData.isDisplayVariantsOnGrid) && groupProductData.length > 0) {
            groupProductData.forEach((item) => {
              groupProductList.push({
                ...item,
                addOnProductSKUs: product?.addOnProductSKUs || [],
                personalizeList: productData.personalizeList || [],
              });
            });
          } else {
            if ((productData?.groupProductList && productData.groupProductList.length > 0) || productData.isDisplayVariantsOnGrid) {
              error(commonTranslations("enterProductQuantity"));
              setIsLoading(false);
              return;
            }
          }
          const addToCartResponse = await submitAddToCart({
            ...productData,
            groupProductData: productData.groupProductList && productData.groupProductList.length > 0 ? groupProductList : [],
            configChildProductData: productData.isDisplayVariantsOnGrid ? groupProductList : [],
          });
          if (addToCartResponse?.addToCartStatus) {
            closeModal();
            updateCartCount(addToCartResponse.cartCount);
            setAddToCartTriggerNotification(true);
            const addToCartNotification: IAddToCartNotification = {
              sku:
                (productData.isConfigurableProduct || productData.productType === PRODUCT_TYPE.GROUPED_PRODUCT
                  ? productData.isDisplayVariantsOnGrid || productData.productType === PRODUCT_TYPE.GROUPED_PRODUCT
                    ? groupProductList.map((item) => item.sku).join(",")
                    : productData.configurableproductSku
                  : productData.sku) ?? "",
              quantity: productData.isDisplayVariantsOnGrid || productData.productType === PRODUCT_TYPE.GROUPED_PRODUCT ? 0 : productData.quantity,
              imageLargePath: productData.imageLargePath || productData.imageSmallPath,
            };
            setAddToCartNotificationData(addToCartNotification);
            setTimeout(() => {
              setAddToCartTriggerNotification(false);
              setAddToCartNotificationData(null);
            }, 4000);
            setSelectedAddons([]);
            setAddOnError("");
          } else {
            error(commonTranslations("failedToAddAProduct"));
          }
          setIsLoading(false);
        }
      }
    } else {
      setValidationMessage(productTranslations("requiredNumericValue"));
    }
  }

  const inputQuantity = typeof qty == "number" ? qty : "";

  const getSelectValues = (attributeList: IAttributeDetails[]) => {
    if (attributeList.length > 0) {
      const matchingAttribute = attributeList.find((x: IAttributeDetails) => x.attributeCode?.toLowerCase() === PRODUCT.OUT_OF_STOCK_OPTIONS.toLowerCase());
      const code = matchingAttribute?.selectValues?.[0]?.code || "";
      return code;
    } else {
      return "";
    }
  };

  const checkValidationForAddToCart = () => {
    if (productType === PRODUCT_TYPE.BUNDLE_PRODUCT) {
      const filterProductList =
        publishBundleProducts && publishBundleProducts.length > 0
          ? publishBundleProducts.filter((item: IPublishBundleProductsDetails) => {
              const code = getSelectValues(item.attributes || []);
              return code.toLowerCase() !== INVENTORY.DONT_TRACK_INVENTORY.toLowerCase();
            })
          : [];

      const isOutOfStock = filterProductList.some((item: IPublishBundleProductsDetails) => {
        const code = getSelectValues(item.attributes || []);
        return item.quantity === 0 && PRODUCT.DISABLE_PURCHASING.toLowerCase() === code.toLowerCase();
      });
      if (isOutOfStock || isCallForPricingPromotion) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const isAddToCartButton =
    !enableAddToCartButton ||
    checkValidationForAddToCart() ||
    isObsolete ||
    isProductOutOfStock ||
    isCallForPricing ||
    !isPersonalizedFormValid ||
    isCallForPricingPromotion ||
    productDetails.retailPrice === null;

  const isInputBox = isObsolete || isProductOutOfStock || isCallForPricing || isInput || isCallForPricingPromotion;

  return {
    isLoading,
    validationMessage,
    enableAddToCartButton,
    isPersonalizedFormValid,
    addOnError,
    personalizeCodesAndValues,
    handleInputChange,
    setPersonalizeCodesAndValues,
    setAddToCartProduct,
    isAddToCartButton: JSON.parse(String(isAddToCartButton)),
    inputQuantity,
    qty,
    productData,
    isInputBox: JSON.parse(String(isInputBox === undefined ? COMMON.TRUE_VALUE : isInputBox)),
    setIsPersonalizedFormValid,
    isAddonShow,
  };
};
