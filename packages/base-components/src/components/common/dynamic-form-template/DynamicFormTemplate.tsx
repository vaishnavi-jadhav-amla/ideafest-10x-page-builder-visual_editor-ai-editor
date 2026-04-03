"use client";

import { Controller, FieldError, useFieldArray, useForm } from "react-hook-form";
import { IDynamicForm, IDynamicFormDefault, ISelectedProduct } from "@znode/types/quick-order";
import React, { useEffect, useRef, useState } from "react";
import { checkForExistingCartId, generatePayloadMultipleProduct, setCartCookie } from "@znode/utils/component";

import Button from "../button/Button";
import { Heading } from "../heading";
import { IProductDetails } from "@znode/types/product-details";
import { PRODUCT_TYPE } from "@znode/constants/product";
import { SearchableInput } from "../searchable-input";
import { ValidationMessage } from "../validation-message";
import { ZIcons } from "../icons";
import { addToCart as addToCartHelper, getCartNumber } from "../../../http-request";
import { formatTestSelector } from "@znode/utils/common";
import { useCartDetails, useProduct } from "../../../stores";
import { useRouter } from "next/navigation";
import { useToast } from "../../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";
import { debounce } from "lodash";
import { ICart, ICartItem } from "@znode/types/cart";
import { getCartItems } from "../../../http-request/cart/get-cart-items";

// eslint-disable-next-line max-lines-per-function
export function DynamicFormTemplate(props: IDynamicForm) {
    const { refreshCartItems } = useCartDetails();
  const {
    defaultData,
    setDefaultData,
    getProductData,
    buttonText,
    action = "AddToCart",
    setSkuIdListForm,
    showAddNewField = true,
    defaultRowCount,
    buttonPosition = "top",
    showClearAllButton = true,
    showFieldClearButton = true,
    showHeading = false,
    showMultipleItemsButton = false,
    showFullWidthResult = false,
    onButtonSubmit,
  } = props;
  const { error } = useToast();
  const DefaultQuickOrderPadRows = "5";
  const dynamicFormTranslations = useTranslationMessages("DynamicFormTemplate");
  const defaultRowsCount = defaultRowCount || Number(DefaultQuickOrderPadRows);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submissionNotAllowed, setSubmissionNotAllowed] = useState(true);
  const [disableClearForm, setDisableClearForm] = useState(true);
  const { updateCartCount,  product: { cartCount }, } = useProduct();
  const loadingStateRef = useRef<{ isBlurred?: boolean; isLoading?: boolean }[]>([]);
  const [cartItems, setCartItems] = useState<ICartItem[]>();
  const handleReset = () => {
    reset({
      search: Array.from({ length: defaultRowsCount }, () => defaultRowData),
    });
    setDefaultData && setDefaultData([]);
    setSubmissionNotAllowed(true);
    setSkuIdListForm && setSkuIdListForm([]);
    setDisableClearForm(true);
    loadingStateRef.current = [];
  };

  const defaultRowData = {
    sku: "",
    quantity: 0,
    rules: {
      max: "",
      min: "",
      productError: {
        type: "",
        validationMessage: "",
      },
    },
    formValue: {} as ISelectedProduct,
  };

  const {
    setQuickOrderProductInfo,
    product: { quickOrderProductInfo },
  } = useProduct();

  const defaultValues: { [key: string]: IDynamicFormDefault[] } = {
    search: Array.from({ length: Math.max(defaultRowsCount) }, () => defaultRowData),
  };

  const handleAttributes = (value: string | number, index: number) => {
    validateQuantity(value, index);
  };

  const {
    control,
    handleSubmit,
    watch,
    register,
    setValue,
    formState: { errors },
    getValues,
    reset,
    clearErrors,
    setError,
  } = useForm({
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "search",
  });

  const getCPCart = async () => {
    const cartNumber = await getCartNumber();
    if (cartNumber) {
      const cartData: ICart = await getCartItems(cartNumber);
      setCartItems(cartData?.cartItems || []);
    } else {
      setCartItems([]);
    }
    setLoading(false);
  };

  const getCartItemQty = (sku: string): number | null => {
    if (!sku) return null;
    const cartItem = cartItems?.find((cartItem: ICartItem) => cartItem.sku === sku);
    return cartItem?.quantity || null;
  };

  useEffect(() => {
    const subscription = watch((value) => {
      const searchedValue = value && value.search ? value.search : [];
      let updateClearAllBtnStatus = true;
      for (let i = 0; i <= searchedValue.length; i++) {
        if (searchedValue[i]?.sku) {
          updateClearAllBtnStatus = false;
          break;
        }
      }
      setDisableClearForm(updateClearAllBtnStatus);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  useEffect(() => {
    setLoading(true);
    getCPCart();
  }, []);

  useEffect(() => {
    if (defaultData && defaultData.length > 0) {
      const newDefaultValues = Array.from({ length: Math.max(defaultData.length) }, (_, index) => {
        if (index < defaultData.length) {
          const item: IDynamicFormDefault = defaultData[index];
          const cartItemQty = getCartItemQty(item?.sku || "");
          return {
            sku: item?.sku || "",
            quantity: item?.quantity || 0,
            rules: {
              max: item?.rules?.max,
              min: item?.rules?.min,
              cartItemQty: cartItemQty,
              productError: {
                type: item?.rules?.productError?.type || "",
              },
              duplicateWarning: item?.rules?.duplicateWarning || "",
            },
            formValue: item?.formValue,
          };
        } else {
          return defaultRowData;
        }
      });

      reset({ search: newDefaultValues });
      handleValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultData, reset, defaultRowsCount]);

  useEffect(() => {
    if (quickOrderProductInfo.length > 0) {
      const quickOrderProductInfoClone = [...quickOrderProductInfo];
      for (let i = 1; i < Number(DefaultQuickOrderPadRows); i++) {
        quickOrderProductInfoClone.push(defaultRowData);
      }
      setDefaultData && setDefaultData(quickOrderProductInfoClone);
      setQuickOrderProductInfo([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickOrderProductInfo]);

  const handleValidation = () => {
    const formValues = getValues();
    handleDuplicate();
    formValues.search &&
      formValues.search.map((val, index) => {
        handleAttributes(`${val?.quantity || 0}`, index);
      });
    setErrorMessage();
  };

  const handleSelect = (value: ISelectedProduct | string | number, name: string, index: number, type: string) => {
    if (type == "sku") {
      const formValue = (value as ISelectedProduct)?.sku;
      setValue(`search.${name}`, formValue as never);
      const max = Number((value as ISelectedProduct).maxQuantity) || 0;
      const cartItemQty = getCartItemQty(formValue);
      const min = Number((value as ISelectedProduct).minQuantity) || 0;
      setValue(`search.${index}.quantity`, 1);
      setValue(`search.${index}.rules.max`, String(max));
      setValue(`search.${index}.rules.min`, String(min));
      setValue(`search.${index}.rules.cartItemQty`, cartItemQty);
      setValue(`search.${index}.formValue`, value as ISelectedProduct);
      handleAttributes(1, index);
    }
    if (type == "quantity") {
      const formValue = value as string;
      setValue(`search.${name}`, formValue as never);
      handleAttributes(formValue, index);
    }
    setErrorMessage();
  };

  const showErrors = (currentIndex: number) => {
    const errorType = ["sku", "quantity"];
    let errorMessage = "";
    errorType.some((errorValue) => {
      if (errors?.search && errors?.search[currentIndex]) {
        const value: keyof typeof errors = errorValue;
        if (errors?.search && errors?.search[currentIndex] && errors?.search[currentIndex][value as keyof typeof error]) {
          errorMessage = errors?.search && errors?.search[currentIndex] ? (errors?.search[currentIndex][value as keyof typeof error] as FieldError)?.message || "" : "";
          return true;
        }
      }
    });
    if (!errorMessage) {
      const formValues = getValues().search;
      const duplicateWarning = formValues[currentIndex].rules.duplicateWarning;
      const duplicateWarningMessage = duplicateWarning ? dynamicFormTranslations(duplicateWarning) : "";
      return duplicateWarningMessage;
    }
    return errorMessage;
  };

  const isDuplicateOnQuantityChange = (sku: string, currentIndex: number) => {
    const formData = getValues().search;
    return formData.some((item, index) => item?.formValue?.sku === sku && currentIndex !== index);
  };

  const addNewField = () => {
    append(defaultRowData);
  };

  const addToCart = async (formValues: IDynamicFormDefault[]) => {
    setLoading(true);
    const shoppingCartItemList = formValues
      .filter((val) => (val?.formValue ? Boolean(val?.formValue?.isActive) : false))
      .map((val) => ({
        productId: val?.formValue?.publishProductId,
        productName: val?.formValue?.name,
        sku: val?.formValue?.sku,
        quantity: val?.quantity || 1,
        productType: val?.formValue?.productType,
        parentProductId: val?.formValue?.parentProductId || 0,
      }));
    if (shoppingCartItemList && shoppingCartItemList.length == 0) {
      setLoading(false);
      return;
    } else {
      const cartId = checkForExistingCartId();
      //@ts-expect-error generatePayloadMultipleProduct uses singleAddToCart api
      const payloadCart = generatePayloadMultipleProduct(shoppingCartItemList as IProductDetails[], cartId);
      const addToCartResponse = await addToCartHelper(payloadCart);
      if (addToCartResponse?.addToCartStatus && addToCartResponse.cartId && addToCartResponse.cartNumber) {
        setCartCookie(addToCartResponse.cartId, addToCartResponse.cartNumber);
      }
      if (addToCartResponse?.addToCartStatus) {
        addToCartResponse?.cartCount && updateCartCount(addToCartResponse?.cartCount);
        if (typeof window !== "undefined" && window.location.pathname === "/cart") {
          window.location?.reload();
        } else {
          !cartCount && refreshCartItems();
          router.push("/cart");
        }
      } else {
        error(dynamicFormTranslations("somethingWentWrong"));
      }
      setLoading(false);
      onButtonSubmit && onButtonSubmit();
    }
  };

  const addToTemplate = (validFormValues: IDynamicFormDefault[]) => {
    getProductData && getProductData(validFormValues);
    reset();
  };

  const onAddMultiple = () => {
    onButtonSubmit && onButtonSubmit();
    const formData = getValues();
    const hasValue = Object.keys(formData.search[0].formValue || {}).length > 0;
    if (hasValue) {
      setQuickOrderProductInfo(formData.search);
    }
    router.push("/quick-order");
  };

  const decideApiCall = (action: string, value: IDynamicFormDefault[]) => {
    switch (action) {
      case "AddToCart":
        addToCart(value);
        break;
      case "AddTemplate":
        addToTemplate(value);
        break;
      default:
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const onSubmit = () => {
    const formValues = getValues().search;
    const validFormValues = formValues.filter((val) => {
      if (val?.sku !== "") {
        return val;
      }
    });
    validFormValues && decideApiCall(action, validFormValues as IDynamicFormDefault[]);
  };

  const validateQuantity = (value: number | string, index: number) => {
    const searchFormValue = getValues().search;
    const QuantityError = ["QuantityFieldMessage", "WarningSelectedQuantity", "ExceedingQty", "MaximumQuantityLimitExceed", ""];
    const currFormElement = searchFormValue[index];
    if (!QuantityError.includes(currFormElement?.rules?.productError?.type)) {
      return;
    }

    let totalQty = Number(value || 0);
    searchFormValue.forEach((formElement: IDynamicFormDefault, formElementIndex: number) => {
      if (currFormElement?.formValue?.sku && formElement?.formValue?.sku && currFormElement.formValue.sku == formElement.formValue.sku && index != formElementIndex) {
        totalQty += Number(formElement.quantity || 0);
        clearErrors(`search.${formElementIndex}.sku`);
        setValue(`search.${formElementIndex}.rules.productError.type`, "");
      }
    });

    if (Number(value) === 0 && currFormElement?.formValue.sku) {
      setValue(`search.${index}.rules.productError.type`, "QuantityFieldMessage");
    } else if (Number(value) < Number(currFormElement?.rules?.min) || Number(totalQty) > Number(currFormElement?.rules?.max)) {
      setValue(`search.${index}.rules.productError.type`, "WarningSelectedQuantity");
    } else if (Number(totalQty) > Number(currFormElement?.formValue?.quantity) && currFormElement?.formValue?.isDisablePurchasing) {
      setValue(`search.${index}.rules.productError.type`, "ExceedingQty");
    } else if (currFormElement?.rules?.cartItemQty && totalQty + Number(currFormElement?.rules?.cartItemQty) > Number(currFormElement?.rules?.max)) {
      setValue(`search.${index}.rules.productError.type`, "MaximumQuantityLimitExceed");
    } else {
      setValue(`search.${index}.rules.productError.type`, "");
    }
  };

  const validateSku = (value: ISelectedProduct, index: number) => {
    const productData = value;

    if (productData?.productType === PRODUCT_TYPE.GROUPED_PRODUCT || productData?.productType === PRODUCT_TYPE.CONFIGURABLE_PRODUCT) {
      setValue(`search.${index}.rules.productError.type`, "NotSupported");
    } else if (productData?.isObsolete) {
      setValue(`search.${index}.rules.productError.type`, "IsObsolete");
    } else if (productData?.isOutOfStock) {
      setValue(`search.${index}.rules.productError.type`, "OutOfStock");
    } else if (productData?.isAddOnRequired) {
      setValue(`search.${index}.rules.productError.type`, "IsAddOnPersonalizationRequired");
    } else if (productData?.isCallForPricing) {
      setValue(`search.${index}.rules.productError.type`, "IsCallForPricing");
      setValue(`search.${index}.rules.productError.validationMessage`, productData?.callForPricingMessage);
    } else if (productData?.hasPriceNotSet) {
      setValue(`search.${index}.rules.productError.type`, "PriceNotSet");
    } else if (isDuplicateOnQuantityChange(productData?.sku || "", index)) {
      setValue(`search.${index}.rules.duplicateWarning`, "errorDuplicateValue");
    } else {
      setValue(`search.${index}.rules.productError.type`, "");
    }
  };

  const setErrorMessage = (formValue?: { [key: string]: IDynamicFormDefault[] }) => {
    const searchedValue = formValue || getValues();
    const isFieldLoading = loadingStateRef.current?.some((ele) => ele.isLoading);
    const isFormInValid = searchedValue.search?.some((val) => val?.rules?.productError?.type !== "");
    const isFormEmpty = !searchedValue.search?.some((val) => val?.sku);
    const disableSubmission = isFieldLoading || isFormEmpty || isFormInValid ? true : false;
    setSubmissionNotAllowed(disableSubmission);
    searchedValue?.search &&
      searchedValue.search.length > 0 &&
      searchedValue.search.forEach((val: IDynamicFormDefault, index: number) => {
        if (val?.rules?.productError?.type == "") {
          clearErrors(`search.${index}.sku`);
        } else if (val?.rules?.productError?.type == "NotSupported") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: `${dynamicFormTranslations("productCanNotAdded")}`,
          });
        } else if (val?.rules?.productError?.type == "IsObsolete") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: dynamicFormTranslations("errorObsoleteValue"),
          });
        } else if (val?.rules?.productError?.type == "PriceNotSet") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: dynamicFormTranslations("errorPriceNotSet"),
          });
        } else if (val?.rules?.productError?.type == "IsAddOnPersonalizationRequired") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: `${dynamicFormTranslations("addOnPersonalizationRequired")}`,
          });
        } else if (val?.rules?.productError?.type == "OutOfStock") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: dynamicFormTranslations("productOutOfStock"),
          });
        } else if (val?.rules?.productError?.type == "InValidSku") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: dynamicFormTranslations("errorInValidSKU"),
          });
        } else if (val?.rules?.productError?.type == "DuplicateSku") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: dynamicFormTranslations("errorDuplicateValue"),
          });
        } else if (val?.rules?.productError?.type == "WarningSelectedQuantity") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: `${dynamicFormTranslations("warningSelectedQuantity")} ${val?.rules?.min} to ${val?.rules?.max}`,
          });
        } else if (val?.rules?.productError?.type == "ExceedingQty") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: `${dynamicFormTranslations("exceedingQty")} ${val?.formValue?.productType === "SimpleProduct" ? `(${val?.formValue?.quantity || 0})` : ""}`,
          });
        } else if (val?.rules?.productError?.type == "IsCallForPricing") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: val?.rules?.productError?.validationMessage,
          });
        } else if (val?.rules?.productError?.type == "QuantityFieldMessage") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: `${dynamicFormTranslations("quantityFieldMessage")}`,
          });
        } else if (val?.rules?.productError?.type == "MaximumQuantityLimitExceed") {
          setError(`search.${index}.sku`, {
            type: "manual",
            message: `${dynamicFormTranslations("maximumQuantityLimitExceed", {
              remainingQty: Number(val?.rules?.max) - (val?.rules?.cartItemQty as number),
            })}`,
          });
        }
      });
    const searchedFormValue = searchedValue && searchedValue.search ? searchedValue.search : [];
    setSkuIdListForm && setSkuIdListForm(searchedFormValue);
  };

  const handleOnSelect = (value: ISelectedProduct, index: number) => {
    if (loadingStateRef.current[index]) loadingStateRef.current[index] = { isLoading: false, isBlurred: true };
    validateSku(value, index);
    const formValue = getValues();
    if (value) {
      handleSelect(value, `${index}.sku`, index, "sku");
    } else if (formValue && (formValue.search[index]?.sku || "").length > 0) {
      setValue(`search.${index}.quantity`, 0);
      setError(`search.${index}.sku`, {
        type: "manual",
        message: dynamicFormTranslations("inActive"),
      });
    } else {
      setValue(`search.${index}.quantity`, 0);
    }
    handleValidation();
  };

  const handleOnQuantityChange = (value: string | number, index: number) => {
    const inputValue = Math.floor(value as number);
    handleSelect(Number(inputValue), `${index}.quantity`, index, "quantity");
  };

  const handleInvalidSKUOnBlur = (_value: string, index: number, selectionInProgress?: boolean) => {
    const formValue = getValues();
    if (!(formValue.search && formValue.search[index]?.sku)) {
      loadingStateRef.current[index] = { isLoading: false, isBlurred: true };
      clearErrors(`search.${index}.sku`);
      setValue(`search.${index}.rules.productError.type`, "");
    } else if (loadingStateRef.current[index]?.isLoading === true || selectionInProgress) {
      loadingStateRef.current[index].isBlurred = true;
      clearErrors(`search.${index}.sku`);
      setValue(`search.${index}.rules.productError.type`, "");
    } else {
      loadingStateRef.current[index] = { isLoading: false, isBlurred: true };
      if (formValue.search && formValue.search[index] && !formValue.search[index].formValue?.sku) {
        setValue(`search.${index}.rules.productError.type`, "InValidSku");
        setError(`search.${index}.sku`, {
          type: "manual",
          message: dynamicFormTranslations("errorInValidSKU"),
        });
      }
    }
    handleValidation();
  };

  const handleNoSearchResult = (isValid: boolean, index: number) => {
    const formValue = getValues().search;
    if (!isValid && formValue[index]?.sku) {
      setValue(`search.${index}.rules.productError.type`, "InValidSku");
      setError(`search.${index}.sku`, {
        type: "manual",
        message: dynamicFormTranslations("errorInValidSKU"),
      });
    } else {
      setValue(`search.${index}.rules.productError.type`, "");
    }
    handleValidation();
  };

  const handleDuplicate = () => {
    const formValues = getValues().search;
    const map = new Map();
    formValues.forEach((formElement: IDynamicFormDefault, formElementIndex: number) => {
      const sku = formElement?.formValue?.sku;
      if (sku && !map.has(sku) && !formElement.rules.productError.type) {
        map.set(sku, formElementIndex);
      }
    });
    formValues.forEach((formElement: IDynamicFormDefault, formElementIndex: number) => {
      const sku = formElement?.formValue?.sku;
      if (!sku) return;
      const mapIndex = map.get(sku);
      if (mapIndex !== undefined && formElementIndex == mapIndex) {
        setValue(`search.${formElementIndex}.rules.duplicateWarning`, "");
      } else if (mapIndex !== undefined && formElementIndex != mapIndex) {
        setValue(`search.${formElementIndex}.rules.duplicateWarning`, "errorDuplicateValue");
      }
    });
  };

  const handleSearch = (index: number) => {
    setValue(`search.${index}.sku`, "");
    setValue(`search.${index}.quantity`, 0);
    handleValidation();
  };

  const removeSkuItem = (index: number) => {
    remove(index);
    deleteLoadingStateRefIndex(index);
    handleValidation();
  };

  const deleteLoadingStateRefIndex = (index: number) => {
    const loadingStateRefClone = loadingStateRef.current;
    loadingStateRefClone.splice(index, 1);
    loadingStateRef.current = loadingStateRefClone;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedHandlerOnSkuChange = debounce(handleSearch, 300);

  const renderButtons = () => {
    return (
      <div className={"sm:flex justify-end mb-3"}>
        {showClearAllButton && (
          <Button
            className="xs:px-5 w-full sm:w-auto"
            type="primary"
            size="small"
            dataTestSelector="btnClearAllItems"
            ariaLabel="Clear all items"
            disabled={disableClearForm}
            onClick={() => handleReset()}
          >
            {dynamicFormTranslations("clearAllItems")}
          </Button>
        )}
        <Button
          htmlType="submit"
          type="primary"
          size="small"
          onClick={handleSubmit(onSubmit)}
          className={`xs:px-8 mt-2 w-full ${!showClearAllButton ? "sm:w-full" : "sm:w-auto sm:mt-0 sm:ml-3"}`}
          loading={loading}
          dataTestSelector={formatTestSelector("btn", buttonText || "DynamicAddToCart")}
          disabled={submissionNotAllowed}
          value={buttonText}
          showLoadingText={true}
          loaderColor="currentColor"
          loaderWidth="20px"
          loaderHeight="20px"
          ariaLabel={buttonText}
        >
          {buttonText}
        </Button>
      </div>
    );
  };
  return (
    <>
      {showHeading && (
        <Heading
          name={dynamicFormTranslations("quickOrder")}
          dataTestSelector="hdgQuickOrder"
          customClass="border-b border-separatorColor mb-4 mt-0 text-center pt-1 pb-1 uppercase"
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyPress}>
        {buttonPosition === "top" && <div>{renderButtons()}</div>}

        {fields.map((field, index) => (
          <div key={`${field.id}-${index}`}>
            <div className={"flex gap-2 my-2 items-start"}>
              <div className="w-full">
                <SearchableInput
                  dynamicKey={`${index}.sku-${field.id}`}
                  control={control}
                  watch={watch}
                  name={`${index}.sku`}
                  onChangeSKU={(value) => {
                    setValue(`search.${index}.formValue`, {} as ISelectedProduct);
                    setValue(`search.${index}.rules`, defaultRowData.rules);
                    if (value) loadingStateRef.current[index] = { isLoading: true, isBlurred: false };
                    else loadingStateRef.current[index] = { isLoading: false, isBlurred: true };
                  }}
                  onChangeSKUDebounced={(value: string) => {
                    if (value.length === 0) {
                      debouncedHandlerOnSkuChange(index);
                    }
                  }}
                  onSelect={(value) => handleOnSelect(value, index)}
                  onInputBlur={(value, selectionInProgress = false) => {
                    handleInvalidSKUOnBlur(value, index, selectionInProgress);
                  }}
                  isSearchProductEnabled="true"
                  showFullWidthResults={showFullWidthResult || false}
                  disableRedirection={true}
                  onSearchSuggestionFetched={(noResults: boolean) => {
                    if (loadingStateRef.current[index]) loadingStateRef.current[index].isLoading = false;
                    if (noResults) {
                      handleNoSearchResult(false, index);
                    } else if (loadingStateRef.current[index]?.isBlurred === true) {
                      handleNoSearchResult(false, index);
                    }
                  }}
                  hasRestrictConfigProduct={true}
                  id={index}
                />
                <ValidationMessage message={showErrors(index)} dataTestSelector={`error${index}`} />
              </div>
              <div>
                <Controller
                  name={`search.${index}.quantity`}
                  control={control}
                  render={(arg) => (
                    <>
                      <input
                        {...arg.field}
                        className={"input  text-sm w-20 px-3 h-10"}
                        placeholder={"Qty"}
                        value={arg.field.value}
                        type={"number"}
                        defaultValue={arg.field.value}
                        disabled={!getValues(`search.${index}.sku`)}
                        {...register(`search.${index}.quantity`)}
                        onChange={(e) => handleOnQuantityChange(Number(e.target.value), index)}
                        data-test-selector={`txtSkuQuantity${index}`}
                      />
                    </>
                  )}
                />
              </div>
              {showFieldClearButton && (
                <Button
                  className={`text-sm  ${index == 0 && "invisible"} rounded-btnBorderRadius w-12 md:w-28 pl-2.5 pb-2.5 pr-0 md:pr-2`}
                  type="primary"
                  disabled={index == 0 ? true : false}
                  onClick={() => {
                    removeSkuItem(index);
                  }}
                  dataTestSelector={`btnCancel${index}`}
                  ariaLabel="Delete SKU"
                  startIcon={<ZIcons name="x" className="pt-0.5 " data-test-selector={`svgCancel${index}`} />}
                >
                  <span className="hidden md:flex pr-2">{dynamicFormTranslations("delete")}</span>
                </Button>
              )}
            </div>
          </div>
        ))}

        {showAddNewField && (
          <div className={"flex justify-end "}>
            <Button
              htmlType="button"
              className="xs:px-11 mt-4 "
              type="primary"
              size="small"
              value={dynamicFormTranslations("addRows")}
              dataTestSelector={"dynamicAddFieldBtn"}
              disabled={fields.length > 49}
              onClick={() => {
                addNewField();
              }}
              ariaLabel="add row button"
            >
              {dynamicFormTranslations("addRows")}
            </Button>
          </div>
        )}

        {buttonPosition === "bottom" && <div>{renderButtons()}</div>}
      </form>
      {showMultipleItemsButton && (
        <div className="mb-2">
          <div className="border-b border-separatorColor"></div>
          <Button
            htmlType="button"
            onClick={onAddMultiple}
            className="uppercase tracking-wider text-sm px-5 py-2 mt-3 block text-center w-full"
            type="primary"
            dataTestSelector="btnMultipleItems"
          >
            {dynamicFormTranslations("addMultipleItems")}
          </Button>
        </div>
      )}
    </>
  );
}
