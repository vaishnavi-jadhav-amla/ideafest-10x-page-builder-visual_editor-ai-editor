"use client";
import React, { useRef, useState } from "react";
import { UpdateSkuList } from "./UpdateSkuList";
import { DownloadTemplate } from "./DownloadTemplate";
import { useToast } from "../../stores/toast";
import {
  IDynamicFormDefault,
  IInvalidSkuWithQuantity,
  ILoader,
  IOrderDetails,
  IQuickOrder,
  IQuickOrderProduct,
  IQuickOrderProps,
  IQuickUploadDetails,
  ISelectedProduct,
} from "@znode/types/quick-order";
import { addProductsToQuickOrderUsingExcel } from "../../http-request";
import dynamic from "next/dynamic";
import LoaderComponent from "../common/loader-component/LoaderComponent";
import { useTranslationMessages } from "@znode/utils/component";

const DynamicUploadFile = dynamic(() => import("./UploadFile"), {
  loading: () => <LoaderComponent isLoading={true} width="24px" height="24px" />,
  ssr: false,
});

export function QuickOrderUsingExcel(props: IQuickOrderProps) {
  const { setSkuIdList, skuIdList, skuIdListForm } = props;
  const skuListRef = useRef<HTMLTextAreaElement>(null);
  const { error, success } = useToast();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<ILoader>({ uploadingFile: false, validatingFile: false });
  const quickOrderTranslations = useTranslationMessages("QuickOrder");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const showErrorMessage = (validatedSkuId: IQuickOrder, parsedData: Array<IOrderDetails>, invalidEntriesCount?: string[] | undefined) => {
    const invalidCount = invalidEntriesCount ? invalidEntriesCount.length : Number(validatedSkuId?.invalidSKUCount) || 0;
    const validCount = validatedSkuId?.validSKUCount || 0;
    if (parsedData && parsedData.length > 50) {
      error(quickOrderTranslations("errorSkuAboveFifty"));
    } else if (validCount > 0 && invalidCount > 0) {
      success(
        `${validCount} ${validCount === 1 ? quickOrderTranslations("productAddedMessageOne") : quickOrderTranslations("productAddedMessage")} ${invalidCount} ${
          invalidCount == 1 ? quickOrderTranslations("productInvalidMessageOne") : quickOrderTranslations("productInvalidMessage")
        }`
      );
    } else if (validCount > 0 && invalidCount == 0) {
      success(`${validCount} ${validCount === 1 ? quickOrderTranslations("productAddedMessageOne") : quickOrderTranslations("productAddedMessage")}`);
    } else if (validCount == 0 && invalidCount > 0) {
      error(`${invalidCount} ${invalidCount === 1 ? quickOrderTranslations("productInvalidMessageOne") : quickOrderTranslations("productInvalidMessage")}`);
    } else if (validCount == 0 && invalidCount == 0) {
      error(`${quickOrderTranslations("noRecordsFound")}`);
    } else {
      error(`${quickOrderTranslations("somethingWentWrong")}`);
    }
  };

  const checkSkuAreValid = async (parsedData: Array<IOrderDetails>, invalidData?: Array<IQuickUploadDetails>) => {
    if (skuListRef && skuListRef.current) {
      skuListRef.current.value = "";
    }
    let invalidDataClientSideIdentified: string | ConcatArray<string> = [],
      filteredArrayOfInvalidSku: string[] | ConcatArray<string> = [];

    if (invalidData && invalidData.length > 0) {
      invalidDataClientSideIdentified = invalidData.map((obj) => obj.invalidEntry) as string[];
    }
    let outputStringOfInvalidSku = invalidDataClientSideIdentified?.join("\n") || "";

    const validatedSkuId: IQuickOrder = await addProductsToQuickOrderUsingExcel({ parsedData: parsedData });
    if ((validatedSkuId?.invalidSKUCount as number) > 0 && validatedSkuId?.invalidSKUs && validatedSkuId?.invalidSKUs.length > 0) {
      filteredArrayOfInvalidSku =
        validatedSkuId.invalidSKUsWithQuantity?.map((val: IInvalidSkuWithQuantity) => {
          return `${val.sku}, ${val.quantity}`;
        }) || [];
      outputStringOfInvalidSku = outputStringOfInvalidSku.concat(outputStringOfInvalidSku.length > 0 ? "\n" : "", filteredArrayOfInvalidSku?.join("\n") || "");
    }
    if (validatedSkuId) validatedSkuId.invalidSKUCount = Number(validatedSkuId?.invalidSKUCount || 0) + (invalidData?.length || 0);
    if (skuListRef && skuListRef.current) {
      skuListRef.current.value = outputStringOfInvalidSku;
    }
    if (validatedSkuId?.validSKUCount > 0) {
      const uploadedSkuList: IDynamicFormDefault[] = skuIdListForm.length > 0 ? skuIdListForm.filter((skuList) => skuList.sku !== "") : [...skuIdList];
      // Merging uploaded duplicate SKUs
      const skuListMap = new Map<string, IDynamicFormDefault>();
      uploadedSkuList.forEach((product) => {
        if (skuListMap.has(product.sku)) {
          const mapProduct: IDynamicFormDefault = skuListMap.get(product.sku) as IDynamicFormDefault;
          mapProduct.quantity = Number(mapProduct.quantity) + Number(product.quantity);
          skuListMap.set(product.sku, mapProduct);
        } else {
          skuListMap.set(product.sku, product);
        }
      });

      // Combining uploaded SKUs List to Selected SKUs
      validatedSkuId.productDetail.map((val: IQuickOrderProduct) => {
        if (skuListMap.has(val.sku)) {
          const mapProduct: IDynamicFormDefault = skuListMap.get(val.sku) as IDynamicFormDefault;
          mapProduct.quantity = Number(mapProduct.quantity) + Number(val.inputQuantity);
          skuListMap.set(val.sku, mapProduct);
        } else {
          const product = {
            sku: val?.sku,
            quantity: Number(val?.inputQuantity || 0),
            rules: {
              max: val?.maxQuantity || 0,
              min: val?.minQuantity || 0,
              productError: {
                type: "",
                validationMessage: "",
              },
              duplicateWarning: "",
            },
            formValue: val as ISelectedProduct,
          };
          skuListMap.set(val.sku, product);
        }
      });

      const filteredSkuList: IDynamicFormDefault[] = Array.from(skuListMap.values());
      setSkuIdList(filteredSkuList);
    } else {
      const uploadedSkuList = skuIdList?.map((rowData: IDynamicFormDefault) => {
        return {
          sku: rowData?.sku,
          quantity: Number(rowData?.quantity),
          rule: {
            max: rowData?.rules?.max,
            min: rowData?.rules?.min,
            productError: {
              type: rowData?.rules?.productError?.type,
              validationMessage: rowData?.rules?.productError?.validationMessage,
            },
            duplicateWarning: rowData?.rules?.duplicateWarning,
          },
          formValue: rowData,
        };
      });
      setSkuIdList(uploadedSkuList as []);
    }
    showErrorMessage(validatedSkuId, parsedData);
  };

  const processData = (input: string) => {
    const lines = input.split("\n");
    const processedData: Array<IOrderDetails> = [];
    const invalidEntries: Array<IOrderDetails> = [];

    lines.forEach((line: string) => {
      const entries: Array<string> = [];
      line.split(/\s*[,|\s]\s*/).forEach((item) => {
        const entry = item.trim();
        if (entry.length > 0) entries.push(entry);
      });
      if (entries.length === 0) return;
      else if (entries.length === 1) {
        entries.push("1");
      }
      if (entries.length === 2) {
        const quantity = Number(entries[1]);
        quantity && !isNaN(quantity) ? processedData.push({ sku: entries[0] || "", quantity: quantity }) : invalidEntries.push({ invalidEntry: line });
      } else {
        invalidEntries.push({ invalidEntry: line });
      }
    });
    return { processedData, invalidEntries };
  };

  const submitData = async () => {
    setLoading({ ...loading, ["validatingFile"]: true });
    if (skuListRef && skuListRef.current) {
      const skuList = skuListRef.current["value"] || "";
      if (skuList == "") {
        error(quickOrderTranslations("productNotPresent"));
        setLoading({ ...loading, ["validatingFile"]: false });
        return;
      }
      if (selectedFileRef && selectedFileRef.current && selectedFileRef.current !== null) {
        selectedFileRef.current.value = "";
      }
      const processedSkuIdList = processData(skuList);
      await checkSkuAreValid(processedSkuIdList?.processedData, processedSkuIdList?.invalidEntries);
      setLoading({ ...loading, ["validatingFile"]: false });
    }
  };

  return (
    <div className="flex flex-col gap-3 px-3" data-test-selector="divSpreadSheetContainer">
      <p className="text-base font-semibold text-zinc-700" data-test-selector="paraSpreadSheetHeading">
        {quickOrderTranslations("uploadSpreadsheet")}
      </p>
      <DynamicUploadFile
        inputFileRef={inputFileRef}
        loading={loading}
        selectedFileRef={selectedFileRef}
        errorMessage={errorMessage}
        placeholder={quickOrderTranslations("hintUploadFileFormat")}
        data-test-selector="linkFileUpload"
        setLoading={setLoading}
        setErrorMessage={setErrorMessage}
        checkSkuAreValid={checkSkuAreValid}
      />
      <DownloadTemplate />
      <UpdateSkuList loading={loading.validatingFile} submitData={submitData} ref={skuListRef} />
    </div>
  );
}
