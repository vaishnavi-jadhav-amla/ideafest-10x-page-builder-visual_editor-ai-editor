import * as XLSX from "xlsx";

import { ILoader, IOrderDetails, IQuickUploadDetails } from "@znode/types/quick-order";
/* eslint-disable @typescript-eslint/no-unused-expressions, @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, FC, FocusEventHandler } from "react";

import Button from "../common/button/Button";
import { Input } from "../common/input";
import { ValidationMessage } from "../common/validation-message";
import { useToast } from "../../stores";
import { useTranslations } from "next-intl";

interface UploadFileProps {
  inputRef?: React.RefObject<HTMLInputElement>;
  inputFileRef?: React.RefObject<HTMLInputElement>;
  selectedFileRef?: React.RefObject<HTMLInputElement>;
  id?: string;
  placeholder?: string;
  errorMessage?: string;
  readOnly?: boolean;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  loading: ILoader;
  setLoading: React.Dispatch<React.SetStateAction<ILoader>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  checkSkuAreValid: (_arg1: Array<IOrderDetails>, _arg2?: Array<IQuickUploadDetails>) => void;
}

const UploadFile: FC<UploadFileProps> = ({ id, inputFileRef, selectedFileRef, errorMessage, placeholder, loading, setLoading, setErrorMessage, checkSkuAreValid }) => {
  const quickOrderTranslations = useTranslations("QuickOrder");
  const { error } = useToast();
  const parseUploadedFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    return new Promise((resolve) => {
      const file = event && event.target.files ? event.target.files[0] : null;
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            if (e.target && e.target.result) {
              const data = new Uint8Array(e.target.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: "array" });
              const sheetName = workbook.SheetNames[0] || "";
              const sheet = workbook.Sheets[sheetName];
              const jsonResult = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
              const parsedFileData: { quantity: number; sku: string }[] = jsonResult
                ? jsonResult.slice(1).map((item: any) => ({
                    sku: String(item[Object.keys(item)[0]]).trim(),
                    quantity: Number(item[Object.keys(item)[1]]),
                  }))
                : [];
              resolve(parsedFileData);
            }
          } catch (err) {
            error(quickOrderTranslations("somethingWentWrong"));
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
  };
  const handleUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    setLoading({ ...loading, ["uploadingFile"]: true });
    const uploadedFile = event.target.files?.[0];
    const allowedFormats = ["csv", "xlsx"];
    const fileFormat = uploadedFile?.name ? uploadedFile?.name.split(".")[uploadedFile.name.split(".").length - 1] : null;
    if (typeof fileFormat === "string" && !allowedFormats.includes(fileFormat)) {
      const errorMessage = `${quickOrderTranslations("errorUploadFile")} ${allowedFormats.toString()}`;
      setErrorMessage(errorMessage);
      setLoading({ ...loading, ["uploadingFile"]: false });
      return;
    }
    errorMessage !== "" && setErrorMessage("");
    if (selectedFileRef && selectedFileRef.current) {
      selectedFileRef.current.value = uploadedFile?.name || "";
    }
    try {
      const parsedData: any = await parseUploadedFile(event);
      const parsedDataFilter = parsedData && parsedData.filter((skuItem: { sku: string; quantity: number }) => skuItem.sku !== undefined && !Number.isNaN(skuItem.quantity));
      await checkSkuAreValid(parsedDataFilter);
      setLoading({ ...loading, ["uploadingFile"]: false });
    } catch (e) {
      setLoading({ ...loading, ["uploadingFile"]: false });
    } finally {
      if (selectedFileRef && selectedFileRef.current) {
        selectedFileRef.current.value = "";
      }
    }
  };

  const handleBtnClick = () => {
    if (inputFileRef && inputFileRef?.current !== null) {
      inputFileRef.current.value = "";
      inputFileRef.current.click();
    }
  };

  return (
    <>
      <input
        className="border border-inputColor hover:border-black active:border-black
               px-2 py-1 w-half hidden h-10"
        placeholder={quickOrderTranslations("hintUploadFileFormat")}
        id={id}
        ref={inputFileRef}
        onChange={handleUploadFile}
        type={"file"}
      />
      <div className="flex gap-1">
        <Input
          className="px-2 py-1 w-full h-auto"
          placeholder={placeholder}
          id={id}
          inputRef={selectedFileRef}
          type={"text"}
          ariaLabel="file upload"
          dataTestSelector="txtFileUpload"
          readOnly
        />
        <Button
          className="cursor-pointer px-4 py-2"
          htmlType="submit"
          type="primary"
          value={quickOrderTranslations("browse")}
          dataTestSelector="btnBrowseFile"
          loading={loading.uploadingFile}
          showLoadingText={true}
          onClick={handleBtnClick}
          loaderColor="currentColor"
          loaderWidth="20px"
          loaderHeight="20px"
          ariaLabel="browse upload button"
          loaderText={quickOrderTranslations("uploading")}
        >
          {quickOrderTranslations("browse")}
        </Button>
      </div>
      {errorMessage && <ValidationMessage message={errorMessage || ""} dataTestSelector="fileUploadError" customClass="text-errorColor" />}
    </>
  );
};

export default UploadFile;
