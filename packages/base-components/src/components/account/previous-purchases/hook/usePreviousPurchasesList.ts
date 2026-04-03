import { IAddToCartItems, IAddToCartRequestBody, IPurchaseItem, IUsePreviousPurchasesReturn } from "@znode/types/account";
import { addToCartPreviousPurchases, getCartCount, getCartNumber, getPreviousPurchasesData } from "../../../../http-request";
import { debounce, forEach } from "lodash";
import { useEffect, useMemo, useState } from "react";

import { IAddToCartNotification } from "@znode/types/cart";
import { IPageList } from "@znode/types/portal";
import { PRODUCT_TYPE } from "@znode/constants/product";
import { SETTINGS } from "@znode/constants/settings";
import { errorStack } from "@znode/logger/server";
import { logClient } from "@znode/logger";
import { useCartDetails } from "../../../../stores/cart";
import { useProduct } from "../../../../stores/product";
import { useToast } from "../../../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../../../stores/user-store";

export function usePreviousPurchases(): IUsePreviousPurchasesReturn {
  const { error, success } = useToast();
  const { user } = useUser();
  const { refreshCartItems } = useCartDetails();
  const { updateCartCount } = useProduct();
  const limitSelection = SETTINGS.LIMIT_FOR_SELECTION;
  const previousPurchasesTranslations = useTranslationMessages("PreviousPurchases");
  const behaviorMsgTranslations = useTranslationMessages("BehaviorMsg");
  const { setAddToCartNotificationData, setAddToCartTriggerNotification } = useProduct();
  const [items, setItems] = useState<IPurchaseItem[]>([]);
  const [productDetails, setProductDetails] = useState<Record<string, IPurchaseItem>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageList, setPageList] = useState<IPageList[]>([]);
  const [search, setSearch] = useState("");
  const [filterDays, setFilterDays] = useState("");
  const [pageSize, setPageSize] = useState<number>(SETTINGS.DEFAULT_TABLE_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [sortValue, setSortValue] = useState({});
  const [column, setColumn] = useState<string>("");
  const [dateDetails, setDateDetails] = useState<{ dateFormat?: string; timeFormat?: string; displayTimeZone?: string; priceRoundOff?: number }>({
    dateFormat: "",
    timeFormat: "",
    displayTimeZone: "",
  });
  const [isAddToCartLoading, setIsAddToCartLoading] = useState<string | null>(null);
  const [invalidInventory, setInvalidInventory] = useState<Record<string, { sku: string; isInValid: boolean }>>({});
  const [qtyMap, setQtyMap] = useState<Record<string, string | number>>({});
  const [validationMessages, setValidationMessages] = useState<Record<string, string>>({});
  const [stockMessage, setStockMessage] = useState<Record<string, { message: string; isInValid: boolean }>>({});

  const getPreviousPurchasesLineItems = async () => {
    setLoading(true);
    try {
      const previousPurchasesList = await getPreviousPurchasesData({
        pageSize,
        pageIndex,
        sortValue,
        search,
        filterDays: filterDays,
      });
      setPageList(previousPurchasesList.data.pageList);
      setItems(previousPurchasesList.data.orders);
      setDateDetails({
        dateFormat: previousPurchasesList.data.dateFormat,
        timeFormat: previousPurchasesList.data.timeFormat,
        displayTimeZone: previousPurchasesList.data.displayTimeZone,
        priceRoundOff: previousPurchasesList.data.priceRoundOff,
      });
      forEach(previousPurchasesList.data.orders, (item) => {
        setProductDetails((prev) => {
          return { ...prev, [item.productId]: item };
        });
      });
      setTotalResults(previousPurchasesList.data.totalResults);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      logClient.error("Error in method - previousPurchases", errorStack(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPreviousPurchasesLineItems();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, search, sortValue, filterDays]);

  const toggleSelect = (id: string) => {
    setSelected((prevSelected) => (prevSelected.includes(id) ? prevSelected.filter((itemId) => itemId !== id) : [...prevSelected, id]));
  };

  const selectSingleProduct = (id: string, sku: string) => {
    if (selected.length < limitSelection) {
      setSelected((prevSelected) => (prevSelected.includes(id) ? prevSelected.filter((itemId) => itemId !== id) : [...prevSelected, id]));
      setInvalidInventory((prev) => {
        return { ...prev, [id]: { sku: String(sku), isInValid: prev[id]?.isInValid || false } };
      });
    } else {
      error(previousPurchasesTranslations("limitReached"));
    }
  };

  const selectAll = () => {
    const allIds = items
      .map((item) => item.productId)
      .filter((id) => (stockMessage[id]?.isInValid || false) === false && (validationMessages[id]?.length || 0) === 0 && productDetails[id].unitPricePurchased !== null);

    const isAllSelected = allIds.every((id) => selected.includes(id));

    if (isAllSelected) {
      clearSelection();
    } else {
      if (selected.length >= limitSelection) {
        error(previousPurchasesTranslations("limitReached"));
        return;
      }

      const limitedIds = allIds.slice(0, limitSelection);
      setSelected(() => limitedIds);
    }
  };

  const clearSelection = () => setSelected(() => []);

  const debouncedSearch = useMemo(
    () =>
      debounce((text: string) => {
        setSearch(text);
      }, 500),
    [setSearch]
  );
  const handleSearch = (text: string) => {
    debouncedSearch(text);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const onColumnSort = (headerKey: string, column: string, order: string) => {
    setSortValue({ [headerKey]: order });
    setColumn(column);
  };

  const onPageSizeChange = async (pageSize: number) => {
    setPageIndex(1);
    setLoading(true);
    setPageSize(pageSize);
  };

  const onPageIndexChange = async (pageIndex: number) => {
    setPageIndex(pageIndex);
    setLoading(true);
  };

  const handleFilterDayChange = (text: string) => {
    const splitTheDate = text.split(" and ");
    if (splitTheDate.length === 2) {
      setFilterDays(`'${splitTheDate[0]}' and '${splitTheDate[1]}'`);
    } else {
      setFilterDays("All Items");
    }
  };

  const handleQtyChange = async (productId: string, value: string, maxQty: number, minQty: number) => {
    const trimmed = value.trim();
    const parsedQty = parseInt(trimmed);

    if (isNaN(parsedQty)) {
      setValidationMessages((prev) => ({
        ...prev,
        [productId]: previousPurchasesTranslations("qtyMustBeNumber"),
      }));
      setQtyMap((prev) => ({
        ...prev,
        [productId]: "",
      }));
      return;
    } else if (parsedQty < 0) {
      setValidationMessages((prev) => ({
        ...prev,
        [productId]: previousPurchasesTranslations("qtyMustBeNumber"),
      }));
      setQtyMap((prev) => ({
        ...prev,
        [productId]: parsedQty,
      }));
      return;
    } else if (parsedQty < minQty) {
      setValidationMessages((prev) => ({
        ...prev,
        [productId]: `${previousPurchasesTranslations("quantityInBetweenMessage")} ${minQty} ${previousPurchasesTranslations("to")} ${maxQty}.`,
      }));
      setQtyMap((prev) => ({
        ...prev,
        [productId]: parsedQty,
      }));
      return;
    } else if (parsedQty > maxQty) {
      setValidationMessages((prev) => ({
        ...prev,
        [productId]: `${previousPurchasesTranslations("quantityInBetweenMessage")} ${minQty} ${previousPurchasesTranslations("to")} ${maxQty}.`,
      }));
      setQtyMap((prev) => ({
        ...prev,
        [productId]: parsedQty,
      }));
      return;
    }

    setValidationMessages((prev) => {
      const newValidation = { ...prev };
      delete newValidation[productId];
      return newValidation;
    });

    setQtyMap((prev) => ({
      ...prev,
      [productId]: parsedQty,
    }));
  };

  const handleAddToCart = async () => {
    if (selected.length === 0) {
      error(previousPurchasesTranslations("selectOneItem"));
    } else {
      await handleAddToCartProducts(selected);
    }
  };
  const handleSingleAddToCart = async (productId: string) => {
    if (productId) {
      setIsAddToCartLoading(productId);
      await handleAddToCartProducts([productId], true);
    } else {
      setIsAddToCartLoading(null);
      error("Failed to add product to cart.");
    }
  };

  function prepareAddToCartRequest(product: IPurchaseItem): IAddToCartItems {
    const type = product.productType?.toLowerCase();
    let skuDetails: IAddToCartItems = {
      lineItemId: product.parentProductId,
      groupCode: "",
      quantity:
        product.isChildProduct && (type === PRODUCT_TYPE.GROUPED_PRODUCT_LABEL || type === PRODUCT_TYPE.CONFIGURABLE_PRODUCT_LABEL)
          ? 0
          : Number(qtyMap[product.parentProductId]) || null,
    };

    if (product.isChildProduct) {
      skuDetails = {
        lineItemId: product.productId,
        groupCode: "",
        quantity: Number(qtyMap[product.productId]) || null,
      };
    }
    // Final add to cart request structure
    return skuDetails;
  }

  const handledMoveAllProductToCart = async () => {
    if (items.length > 0) {
      const allIds: string[] = items.map((item) => String(item.productId));
      handleAddToCartProducts(allIds);
    }
  };

  //  handled multiple Add to cart products
  const handleAddToCartProducts = async (productList: string[], isSingleAddToCart = false) => {
    const selectedItems: IAddToCartItems[] = [];
    const singleProductId = isSingleAddToCart ? productList[0] : "";
    productList.forEach((productId) => {
      const product = productDetails[productId];
      if (product) {
        selectedItems.push(prepareAddToCartRequest(product));
      }
      if (qtyMap[productId] === undefined || qtyMap[productId] === null || qtyMap[productId] === "") {
        setValidationMessages((prev) => ({
          ...prev,
          [productId]: previousPurchasesTranslations("qtyMustBeNumber"),
        }));
      }
    });

    if (selectedItems.length > 0) {
      const payloadCart: IAddToCartRequestBody = {
        lineItemDetails: selectedItems,
        catalogCode: user?.catalogCode || "",
        customerId: Number(user?.userId),
        origin: "",
      };

      const addToCartResponse = await addToCartPreviousPurchases(payloadCart);
      if (addToCartResponse.validation && Object.keys(addToCartResponse.validation).length > 0) {
        for (const [key, value] of Object.entries(addToCartResponse.validation)) {
          if (!value.isSuccess && value.message && value.message.length > 0) {
            setValidationMessages((prev) => ({
              ...prev,
              [key]: behaviorMsgTranslations("behaviorErrorMsg"),
            }));
            setQtyMap((prev) => ({ ...prev, [key]: "" }));
          } else {
            setQtyMap((prev) => ({ ...prev, [key]: "" }));
          }
          setSelected((prev) => prev.filter((item) => item !== key));
        }
      }
      const isAllProductQtyEmpty = selectedItems.every((item) => item.quantity === null || item.quantity === undefined);
      if (isSingleAddToCart) {
        const addToCartNotification: IAddToCartNotification = {
          sku: productDetails[singleProductId].sku,
          quantity: Number(qtyMap[singleProductId]),
          imageLargePath: productDetails[singleProductId]?.productImageUrl,
        };
        if (!addToCartResponse.isSuccess) {
          !isSingleAddToCart && !isAllProductQtyEmpty && error(previousPurchasesTranslations("unableToMoveCart"));
        } else {
          setAddToCartNotificationData(addToCartNotification);
          setTimeout(() => {
            setAddToCartTriggerNotification(false);
            setAddToCartNotificationData(null);
          }, 4000);
        }
      } else {
        !addToCartResponse.isSuccess
          ? !isAllProductQtyEmpty && error(previousPurchasesTranslations("unableToMoveCart"))
          : success(previousPurchasesTranslations("successMoveToCart"));
      }
    }
    refreshCartItems();
    setIsAddToCartLoading(null);
    const cartNumber = await getCartNumber();
    if (cartNumber) {
      const count = await getCartCount(cartNumber, "PreviousPurchases");
      updateCartCount(count);
    }
  };

  return {
    pageList,
    items,
    loading,
    column,
    selected,
    totalResults,
    onColumnSort,
    onPageSizeChange,
    onPageIndexChange,
    selectAll,
    clearSelection,
    handleSearch,
    toggleSelect,
    handleFilterDayChange,
    handleQtyChange,
    handleAddToCart,
    selectSingleProduct,
    qtyMap,
    validationMessages,
    setQtyMap,
    setValidationMessages,
    handleSingleAddToCart,
    setInvalidInventory,
    invalidInventory,
    handledMoveAllProductToCart,
    stockMessage,
    setStockMessage,
    dateDetails,
    productDetails,
    setItems,
    isAddToCartLoading,
  };
}
