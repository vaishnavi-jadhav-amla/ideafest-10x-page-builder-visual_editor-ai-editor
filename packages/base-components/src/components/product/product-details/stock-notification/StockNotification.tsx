"use client";

import React, { useState } from "react";

import Button from "../../../common/button/Button";
import { Heading } from "../../../common/heading";
import { IStockNotificationRequest } from "@znode/types/product";
import { REG_EX } from "@znode/constants/app";
import { ValidationMessage } from "../../../common/validation-message";
import { submitStockRequest } from "../../../../http-request";
import { useForm } from "react-hook-form";
import { useModal } from "../../../../stores/modal";
import { useToast } from "../../../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";

export const StockNotification = ({ sku, childProductSku }: { sku: string; childProductSku: string }) => {
  const commonTranslations = useTranslationMessages("Common");
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closeModal } = useModal();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IStockNotificationRequest>({
    mode: "onChange",
  });

  const onSubmit = async (formData: IStockNotificationRequest) => {
    try {
      setIsLoading(true);
      formData.productSKU = childProductSku ?? sku;
      formData.parentSKU = sku;
      const submitData = await submitStockRequest(formData);
      if (submitData?.isSuccess) {
        closeModal();
        success(commonTranslations("submitStockRequest"));
      } else {
        error(commonTranslations("somethingWentWrong"));
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Heading name="Stock Notice" customClass="uppercase text-xl mb-3" dataTestSelector="hdgStockNotice" />
      <div className="text-sm px-4 pb-4 pt-2">
        <div className="mb-4" data-test-selector="divNotEnoughInventoryText">
          <span className="font-medium">{commonTranslations("notEnoughInventory")}?</span> {commonTranslations("notEnoughInventoryText")}.
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="md:flex items-end justify-between w-4/5 pb-2">
            <div className="mt-3">
              <div className="required pb-2">
                <label className="font-semibold" data-test-selector="lblEmailAddress">
                  {commonTranslations("emailAddress")} <strong className="text-errorColor">*</strong>
                </label>
              </div>
              <input
                aria-label={commonTranslations("emailAddress")}
                className="border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black  px-2 py-1 xs:w-full md:w-80 h-10"
                {...register("emailId", {
                  required: commonTranslations("requiredEmailAddress"),
                  pattern: { value: REG_EX.Email, message: commonTranslations("emailPatternMessage") },
                })}
                data-test-selector="txtEmailId"
              />
            </div>
            <div className="md:ml-3 mt-3">
              <div className="required pb-2">
                <label className="font-semibold" data-test-selector="lblQuantity">
                  {commonTranslations("quantity")}
                  <strong className="text-errorColor">*</strong>
                </label>
              </div>
              <input
                aria-label={commonTranslations("quantity")}
                type="number"
                className="border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black 
                 px-2 py-1 md:w-full xs:w-20 h-10"
                data-test-selector="txtQuantity"
                {...register("quantity", { required: true })}
              />
            </div>
            <div className="md:ml-3 mt-3">
              <Button
                htmlType="submit"
                className="btn btn-primary xs:py-1.5 xs:px-1.5"
                type="primary"
                size="small"
                dataTestSelector="btnSubmit"
                loading={isLoading}
                showLoadingText={true}
                loaderColor="currentColor"
                loaderHeight="20px"
                loaderWidth="20px"
                ariaLabel={commonTranslations("submit")}
              >
                {commonTranslations("submit")}
              </Button>
            </div>
          </div>
          {errors?.emailId && <ValidationMessage message={errors?.emailId?.message} dataTestSelector="emailIdError" />}
          {!errors?.emailId && errors?.quantity && <ValidationMessage message={commonTranslations("enterValidQuantity")} dataTestSelector="quantityError" />}
        </form>
      </div>
    </>
  );
};
