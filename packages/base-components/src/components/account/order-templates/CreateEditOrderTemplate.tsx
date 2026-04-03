/* eslint-disable max-lines-per-function */
"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { IAddToTemplateRequestModel, IBulkQuantity, ICreateOrderTemplate, ITemplateCartItems, IUpdateBulkItemQuantityResponse } from "@znode/types/account";
import {
  addMultipleProductsToOrderTemplate,
  bulkQuantityUpdate,
  createOrderTemplate,
  getOrderTemplateItems,
  isOrderTemplateItemsModified,
  isOrderTemplateNameAlreadyExist,
  updateOrderTemplate,
  updateTemplateItemQuantity,
} from "../../../http-request/account/order-template";
import { bindSkuDetails, useTranslationMessages } from "@znode/utils/component";
import { copyOrderDetails, removeAllItems, removeSingleLineItem } from "../../../http-request";

import Button from "../../common/button/Button";
import { CLASSTYPE } from "@znode/constants/checkout";
import { DynamicFormTemplate } from "../../common/dynamic-form-template";
import Heading from "../../common/heading/Heading";
import Input from "../../common/input/Input";
import LoaderComponent from "../../common/loader-component/LoaderComponent";
import { ORDER_ORIGIN } from "@znode/constants/cart";
import OrderTemplateItem from "./OrderTemplateItem";
import { ValidationMessage } from "../../common/validation-message";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { useCartDetails, useProduct, useToast } from "../../../stores";
import { getSavedUserSessionCallForClient } from "@znode/utils/common";

const CreateEditOrderTemplate = ({ classNumber }: { classNumber: string | undefined }) => {
  const { refreshCartItems } = useCartDetails();
  const {
    product: { cartCount },
  } = useProduct();
  const [templateName, setTemplateName] = useState("");
  const [isAddToCartEnabled, setIsAddToCartEnabled] = useState<boolean>(true);
  const [templateNameError, setTemplateNameError] = useState("");
  const router = useRouter();
  const [templateLineItems, setTemplateLineItems] = useState<ITemplateCartItems[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAddToCartLoading, setIsAddToCartLoading] = useState<boolean>(false);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [loadingItemIds, setLoadingItemIds] = useState<Set<string>>(new Set());
  const [loadingRemoveItem, setLoadingRemoveItem] = useState<Set<string>>(new Set());

  const orderTemplateTranslation = useTranslationMessages("OrderTemplates");
  const behaviorTranslation = useTranslationMessages("BehaviorMsg");
  const dynamicFormTranslation = useTranslationMessages("DynamicFormTemplate");
  const commonTranslation = useTranslationMessages("Common");
  const { success, error } = useToast();

  useEffect(() => {
    if (classNumber) {
      getTemplateDetails(classNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classNumber]);

  //Get Product Data from the DynamicFormTemplate on click of Add To Template Button
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFormValues = (formValues: any) => {
    formValues && formValues.length > 0 && updateTemplate(formValues, templateLineItems);
  };

  const getTemplateDetails = async (classNumber: string, existingTemplateLineItem?: ITemplateCartItems[]) => {
    existingTemplateLineItem = existingTemplateLineItem ? existingTemplateLineItem : [];
    const templateData = await getOrderTemplateItems(classNumber);

    if (templateData) {
      templateData.className && setTemplateName(templateData.className);
      if (templateData.itemList) {
        updateTemplate(templateData.itemList, existingTemplateLineItem);
      } else {
        setTemplateLineItems(existingTemplateLineItem);
        validateAddToCartButton(existingTemplateLineItem);
      }
    } else {
      router.push("/404");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateTemplate = async (orderList: any, existingTemplateLineItem: ITemplateCartItems[]) => {
    setListLoading(true);
    const concatLineItems = [...orderList, ...(Array.isArray(existingTemplateLineItem) ? existingTemplateLineItem : [])];
    if (concatLineItems.length) {
      const filteredLineItems =
        concatLineItems &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        concatLineItems.map((lineItem: any) => ({
          quantity: Number(lineItem.quantity) || 1,
          productSKU: lineItem?.sku || "",
          publishProductId: lineItem?.formValue?.publishProductId || lineItem?.publishProductId || 0,
          itemId: lineItem.itemId,
          isExistingItem: lineItem.isExistingItem || false,
          hasValidationErrors: lineItem.hasValidationErrors || false,
          imagePath: lineItem.imagePath || false,
          totalPrice: lineItem.totalPrice || 0,
          itemPrice: lineItem.itemPrice || 0,
          unitPrice: lineItem.unitPrice || 0,
          productName: lineItem.productName || 0,
        }));
      const lineItems = await addMultipleProductsToOrderTemplate(filteredLineItems);
      if (lineItems.length) {
        lineItems.forEach((item: ITemplateCartItems) => {
          if (item?.quantity) {
            const isObsolete = checkIsObsoleteAndIsInActive(item, lineItems);
            if (!isObsolete) {
              const isValidMaxMaxQty = checkMinMaxQuantity(item, lineItems, item.quantity);
              if (isValidMaxMaxQty) {
                checkOutOfStock(item, lineItems, item.quantity);
              }
            }
          }
        });
      }
      setTemplateLineItems(lineItems);
      validateAddToCartButton(lineItems);
    } else {
      setTemplateLineItems([]);
    }
    setListLoading(false);
  };

  const handleTemplateNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (classNumber === undefined || classNumber === "") {
      const inputTemplateName = e.target.value;

      if (inputTemplateName.length > 100) {
        setTemplateNameError(orderTemplateTranslation("errorSavedCartName"));
      } else {
        if (inputTemplateName === "") {
          setTemplateNameError(orderTemplateTranslation("validTemplateName"));
          setTemplateName("");
        } else {
          setTemplateName(inputTemplateName);
          setTemplateNameError("");
        }
      }
    }
  };

  const handleSaveOrderTemplate = async () => {
    try {
      if (templateLineItems.length && templateNameError === "") {
        setLoading(true);
        const formattedTemplateName = templateName.trim();

        if (formattedTemplateName) {
          const isTemplateNameValid = classNumber === undefined ? await validateCreateEditTemplateName() : true;

          if (isTemplateNameValid) {
            if (!hasQuantityValidationMessage(templateLineItems)) {
              const userSession = await getSavedUserSessionCallForClient();
              const requestModel: ICreateOrderTemplate = {
                OrderOrigin: ORDER_ORIGIN.WEBSTORE_ORDER_ORIGIN,
                SkuDetails: bindSkuDetails(templateLineItems),
                UserId: userSession?.userId || 0,
                OrderTemplateNumber: "",
              };

              if (!classNumber) {
                requestModel.OrderTemplateName = formattedTemplateName;
              } else {
                requestModel.OrderTemplateNumber = classNumber;
              }

              const saveTemplateResponse = await saveOrderTemplate(requestModel, classNumber);
              const { status, isTemplateModified } = saveTemplateResponse;

              if (status && isTemplateModified) {
                success(orderTemplateTranslation("successTemplateSaved"));
                router.push("/account/order-templates/list");
              } else if (status === true && isTemplateModified === false) {
                success(orderTemplateTranslation("successTemplateSaved"));
                router.push("/account/order-templates/list");
              } else {
                error(orderTemplateTranslation("errorTemplateSaved"));
              }
              setLoading(false);
            } else {
              setLoading(false);
              error(orderTemplateTranslation("errorTemplateSaved"));
            }
          } else {
            setTemplateNameError(orderTemplateTranslation("templateNameAlreadyExist"));
            setLoading(false);
          }
        } else {
          setTemplateNameError(orderTemplateTranslation("validTemplateName"));
          setLoading(false);
        }
      }
    } catch (er) {
      error(orderTemplateTranslation("errorTemplateSaved"));
    } finally {
      setLoading(false);
    }
  };

  const saveOrderTemplate = async (requestModel: ICreateOrderTemplate, classNumber?: string) => {
    if (classNumber) {
      return await updateOrderTemplate(requestModel);
    } else {
      return await createOrderTemplate(requestModel);
    }
  };

  const validateCreateEditTemplateName = async () => {
    if (templateName && templateNameError === "") {
      const isTemplateNameExist = await isOrderTemplateNameAlreadyExist(templateName);
      return isTemplateNameExist ? false : true;
    }
    return false;
  };

  const checkOutOfStock = (templateItem: ITemplateCartItems, templateLineItems: ITemplateCartItems[], inputQuantity: number) => {
    let isOutOfStock = false;
    if (
      !(inputQuantity <= Number(templateItem?.defaultInventoryCount || 0)) &&
      (templateItem.isDisablePurchasing || templateItem.allowBackOrder) &&
      !templateItem.isDontTrackInventory
    ) {
      templateItem.quantityValidationMessage = `${orderTemplateTranslation("exceedingQty")}(${templateItem?.defaultInventoryCount || 0})`;
      isOutOfStock = true;
    }
    if (isOutOfStock) {
      updateTemplateLineItems(templateItem, templateLineItems);
    }
    return isOutOfStock;
  };

  const checkIsObsoleteAndIsInActive = (templateItem: ITemplateCartItems, templateLineItems: ITemplateCartItems[]) => {
    let isObsolete = false;
    if (templateItem?.isObsolete) {
      templateItem.quantityValidationMessage = `${orderTemplateTranslation("errorObsoleteValue")}`;
      isObsolete = true;
    } else if (templateItem.hasValidationErrors || templateItem?.isActive === false) {
      templateItem.quantityValidationMessage = `${behaviorTranslation("behaviorErrorMsg")}`;
      isObsolete = true;
    }
    if (isObsolete) {
      updateTemplateLineItems(templateItem, templateLineItems);
    }
    return isObsolete;
  };

  const checkMinMaxQuantity = (templateItem: ITemplateCartItems, templateLineItems: ITemplateCartItems[], inputQuantity: number) => {
    let isValid = true;
    if (templateItem?.minQuantity && templateItem?.maxQuantity && !(inputQuantity >= templateItem.minQuantity && inputQuantity <= templateItem.maxQuantity)) {
      templateItem.quantityValidationMessage = `${orderTemplateTranslation("warningSelectedQuantity")} ${templateItem.minQuantity} to ${templateItem.maxQuantity}`;
      isValid = false;
      updateTemplateLineItems(templateItem, templateLineItems);
    }
    return isValid;
  };

  const updateTemplateLineItems = (item: ITemplateCartItems, templateLineItems: ITemplateCartItems[]) => {
    if (item.itemId && templateLineItems.length) {
      const updatedTemplateItems = templateLineItems.map((lineItem) => (lineItem.itemId === item.itemId ? item : lineItem));
      setTemplateLineItems(updatedTemplateItems);
      validateAddToCartButton(updatedTemplateItems);
    }
  };

  const removeTemplateItem = async (itemId: string) => {
    setLoadingRemoveItem((prevSet) => new Set(prevSet.add(itemId)));
    const templateItem = templateLineItems.find((item) => item.itemId === itemId);
    if (classNumber && templateItem?.itemId && templateItem?.isExistingItem === true) {
      const status = await removeSingleLineItem({ cartType: CLASSTYPE.ORDER_TEMPLATE, cartNumber: classNumber, itemId: itemId });
      if (status) {
        success(orderTemplateTranslation("recordDeletedSuccessfully"));
        getTemplateDetails(classNumber, getNewlyAddedTemplateLineItem(templateLineItems));
      } else {
        error(orderTemplateTranslation("deleteFailMessage"));
      }
    } else if ((templateItem?.itemId && (classNumber === "" || classNumber === undefined)) || (classNumber && templateItem?.isExistingItem === false)) {
      removeNewlyAddedTemplateLineItem(itemId);
    }
    setLoadingRemoveItem((prevSet) => {
      const newSet = new Set(prevSet);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const getNewlyAddedTemplateLineItem = (templateLineItems: ITemplateCartItems[]) => {
    return templateLineItems.filter((item) => item.isExistingItem === false);
  };

  const removeNewlyAddedTemplateLineItem = (itemId: string) => {
    const updatedTemplateItems = removeItemByExternalId(templateLineItems, itemId);
    setTemplateLineItems(updatedTemplateItems);
    validateAddToCartButton(updatedTemplateItems);
    success(orderTemplateTranslation("recordDeletedSuccessfully"));
  };

  const removeItemByExternalId = (templateLineItems: ITemplateCartItems[], externalId: string) => {
    return templateLineItems.filter((item) => item.itemId !== externalId);
  };

  const handleClearAllItems = async () => {
    if (classNumber === undefined) {
      //Add Mode
      setTemplateLineItems([]);
      success(orderTemplateTranslation("recordDeletedSuccessfully"));
    } else if (classNumber) {
      //Edit Mode
      const status = await removeAllItems({ cartType: CLASSTYPE.ORDER_TEMPLATE, cartNumber: classNumber });
      if (status) {
        success(orderTemplateTranslation("recordDeletedSuccessfully"));
        setTemplateLineItems([]);
      } else {
        error(orderTemplateTranslation("deleteFailMessage"));
      }
    }
  };

  const handleAddToCart = async () => {
    setIsAddToCartLoading(true);
    if (classNumber === undefined) {
      error(orderTemplateTranslation("errorSaveOrderTemplate"));
      setIsAddToCartLoading(false);
    } else if (classNumber) {
      //Edit Mode
      const isTemplateModified = await isTemplateItemsModified();
      if (isTemplateModified) {
        error(orderTemplateTranslation("errorSaveOrderTemplate"));
        setIsAddToCartLoading(false);
      } else {
        const response = await copyOrderDetails({ orderType: CLASSTYPE.ORDER_TEMPLATE, orderNumber: classNumber });
        if (response.isSuccess) {
          !cartCount && refreshCartItems();
          router.push("/cart");
        } else {
          error(orderTemplateTranslation("errorFailedAddToCart"));
        }
        setIsAddToCartLoading(false);
      }
    }
  };

  const isTemplateItemsModified = async () => {
    if (classNumber) {
      const isTemplateModified = await isOrderTemplateItemsModified(templateLineItems, classNumber);
      return isTemplateModified;
    }
    return false;
  };

  const validateAddToCartButton = (templateLineItems: ITemplateCartItems[]) => {
    const status = hasQuantityValidationMessage(templateLineItems);
    setIsAddToCartEnabled(status);
  };

  const hasQuantityValidationMessage = (templateLineItems: ITemplateCartItems[]) => {
    return templateLineItems?.some((item) => item?.quantityValidationMessage && item.quantityValidationMessage.trim() !== "");
  };

  const updateTemplateQuantity = debounce(async (inputQuantity: string, itemId: string) => {
    const templateItem = templateLineItems.find((item) => item.itemId === itemId);

    if (!templateItem) return;

    if (!inputQuantity || isNaN(Number(inputQuantity))) {
      templateItem.quantityValidationMessage = orderTemplateTranslation("requiredNumericValue");
      return updateTemplateLineItems(templateItem, templateLineItems);
    }

    const quantity = Number(inputQuantity);
    const isObsolete = checkIsObsoleteAndIsInActive(templateItem, templateLineItems);
    if (isObsolete) return;

    const isValidMaxMaxQty = checkMinMaxQuantity(templateItem, templateLineItems, quantity);
    if (!isValidMaxMaxQty) return;

    const isOutOfStock = checkOutOfStock(templateItem, templateLineItems, quantity);
    if (isOutOfStock) return;

    // Clear the previous debounce timer if any
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setLoadingItemIds((prevSet) => new Set(prevSet.add(templateItem.itemId)));

    if (!classNumber || (classNumber && templateItem.isExistingItem === false)) {
      validateTemplateItemQuantity(templateItem, quantity);
      return;
    }

    const requestModel = [
      {
        Quantity: quantity,
        Sku: templateItem.sku,
        ItemId: itemId,
      },
    ];
    const bulkQuantityModel: IBulkQuantity = {
      classType: CLASSTYPE.ORDER_TEMPLATE,
      classNumber: classNumber,
      updateClassItemQuantity: requestModel,
    };
    const bulkQuantityUpdateResponse = await bulkQuantityUpdate(bulkQuantityModel);

    setLoadingItemIds((prevSet) => {
      const newSet = new Set(prevSet);
      newSet.delete(templateItem.itemId);
      return newSet;
    });
    updateLineItems(templateLineItems, templateItem, bulkQuantityUpdateResponse, quantity);
  }, 600);

  const updateLineItems = async (
    templateLineItems: ITemplateCartItems[],
    templateItem: ITemplateCartItems,
    bulkItemQuantityResponse: IUpdateBulkItemQuantityResponse,
    quantity: number
  ) => {
    if (bulkItemQuantityResponse?.isSuccess && (bulkItemQuantityResponse.validationDetails || [])?.length === 0) {
      validateTemplateItemQuantity(templateItem, quantity);
    } else {
      const updatedItem: ITemplateCartItems = templateItem;
      updatedItem.quantityValidationMessage = `${behaviorTranslation("behaviorErrorMsg")}`;
      updatedItem.hasValidationErrors = true;
      updateTemplateLineItems(updatedItem, templateLineItems);
    }
  };

  const validateTemplateItemQuantity = async (templateItem: ITemplateCartItems, quantity: number) => {
    const addToTemplateRequestModel: IAddToTemplateRequestModel = {
      publishProductId: templateItem.publishProductId || 0,
      quantity: quantity,
      productSKU: templateItem.sku,
      itemId: templateItem.itemId,
      isExistingItem: templateItem.isExistingItem,
      hasValidationErrors: templateItem.hasValidationErrors,
    };
    const updatedItem: ITemplateCartItems = await updateTemplateItemQuantity(addToTemplateRequestModel);
    updatedItem.quantityValidationMessage = "";
    updateTemplateLineItems(updatedItem, templateLineItems);
    setLoadingItemIds((prevSet) => {
      const newSet = new Set(prevSet);
      newSet.delete(templateItem.itemId);
      return newSet;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between separator-xs mt-0">
        <Heading
          name={`${classNumber ? orderTemplateTranslation("editTemplateHeading") : orderTemplateTranslation("createTemplateHeading")}`}
          level="h2"
          customClass="uppercase"
          dataTestSelector={classNumber ? "hdgEditTemplate" : "hdgCreateTemplate"}
        />
        <Button type="primary" size="small" onClick={() => router.push("/account/order-templates/list")} ariaLabel="back button" dataTestSelector="btnBack">
          {orderTemplateTranslation("back")}
        </Button>
      </div>
      <div className="lg:grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <div className="flex flex-col gap-4 shadow-md">
            <div className="px-4 py-7 separator-xs my-0">
              <Input
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  handleTemplateNameChange(e);
                }}
                defaultValue={templateName}
                className={`input w-full sm:w-1/2 md:w-2/5 ${classNumber ? "cursor-not-allowed" : ""}`}
                placeholder=""
                type="text"
                id="template-name"
                ariaLabel="Order template"
                disabled={!!classNumber}
                isLabelShow={true}
                label={orderTemplateTranslation("templateName")}
                isRequired={true}
                labelCustomClass="font-semibold"
                dataTestSelector={`txtTemplateName${classNumber}`}
                labelDataTestSelector="lblTemplateName"
              />
              {templateNameError !== "" && <ValidationMessage message={templateNameError} dataTestSelector="templateNameError" customClass="text-errorColor text-sm" />}
            </div>
            {listLoading && (
              <div className="py-8">
                <LoaderComponent isLoading={listLoading} height="40px" width="40px" />
              </div>
            )}
            {!listLoading && templateLineItems && templateLineItems.length > 0 ? (
              <div>
                {templateLineItems.map((val, index) => (
                  <OrderTemplateItem
                    key={index}
                    index={index}
                    templateItem={val}
                    handleQuantityChange={updateTemplateQuantity}
                    removeItem={removeTemplateItem}
                    loadingItemIds={loadingItemIds}
                    loadingRemoveItem={loadingRemoveItem}
                  />
                ))}
                <div className="min-[1150px]:flex p-4 mt-5 justify-between items-center">
                  <Button
                    type="secondary"
                    size="small"
                    onClick={() => {
                      handleClearAllItems();
                    }}
                    className="w-full sm:w-auto"
                    dataTestSelector="btnClearAll"
                    ariaLabel="Clear all items"
                  >
                    {dynamicFormTranslation("clearAllItems")}
                  </Button>
                  <div className="sm:flex justify-end min-[1150px]:justify-between items-center gap-2 mt-2 min-[1150px]:mt-0">
                    {classNumber ? (
                      <Button
                        onClick={() => {
                          handleAddToCart();
                        }}
                        className="w-full sm:w-auto"
                        dataTestSelector={`btnAddToCart${classNumber}`}
                        disabled={isAddToCartEnabled}
                        value={commonTranslation("addToCart")}
                        loading={isAddToCartLoading}
                        loaderColor="currentColor"
                        showLoadingText={true}
                        loaderWidth="20px"
                        loaderHeight="20px"
                        ariaLabel="add to cart button"
                        type="primary"
                        size="small"
                      >
                        {commonTranslation("addToCart")}
                      </Button>
                    ) : null}
                    <Button
                      onClick={() => {
                        handleSaveOrderTemplate();
                      }}
                      className="w-full sm:w-auto mt-2 sm:mt-0"
                      type="primary"
                      size="small"
                      dataTestSelector="btnSaveOrderTemplate"
                      value={orderTemplateTranslation("saveOrderTemplate")}
                      disabled={isAddToCartEnabled}
                      loading={loading}
                      loaderColor="currentColor"
                      showLoadingText={true}
                      loaderWidth="20px"
                      loaderHeight="20px"
                      ariaLabel="save order template button"
                    >
                      {orderTemplateTranslation("saveOrderTemplate")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="col-span-2 p-2 mt-2 lg:mt-0">
          <div>
            <DynamicFormTemplate
              defaultData={[]}
              getProductData={getFormValues}
              buttonText={orderTemplateTranslation("buttonAddToTemplate")}
              action={"AddTemplate"}
              showClearAllButton={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateEditOrderTemplate;
