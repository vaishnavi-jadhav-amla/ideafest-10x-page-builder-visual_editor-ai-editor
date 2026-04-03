"use client";

import React, { useEffect, useState } from "react";
import { applyDiscount, getCartNumber, removeDiscount } from "../../../http-request";

import Button from "../../common/button/Button";
import CSRDiscountTaxExempt from "./CSRDiscountTaxExempt";
import { DISCOUNT_TYPE } from "@znode/constants/checkout";
import { Heading } from "../../common/heading/Heading";
import { IApplyDiscountRequest } from "@znode/types/cart";
import { Modal } from "../../common/modal/Modal";
import { stringToBooleanV2 } from "@znode/utils/common";
import { useCartDetails } from "../../../stores/cart";
import { useCheckout } from "../../../stores/checkout";
import { useModal } from "../../../stores/modal";
import { useTranslationMessages } from "@znode/utils/component";
import { useUser } from "../../../stores/user-store";

const CSRDiscount = ({ isFromQuote }: { isFromQuote: boolean }) => {
  const checkoutTranslations = useTranslationMessages("Checkout");
  const commonTranslations = useTranslationMessages("Common");

  const { closeModal, openModal, modalActiveId } = useModal();
  const { refreshCartSummary } = useCartDetails();
  const { user } = useUser();
  const { shippingOptionId, setOrderSummaryData, setIsTaxExempt, isTaxExempt, orderSummaryData } = useCheckout();
  const [isChecked, setIsChecked] = useState(false);
  const [discountMessage, setDiscountMessage] = useState("");
  const [isApplyLoading, setIsApplyLoading] = useState(false);

  const handleCheckboxChange = async (value: boolean) => {
    if (stringToBooleanV2(value)) {
      openModal("TaxEmpty");
      setIsChecked(value);
    } else {
      setIsTaxExempt(value);
      setIsChecked(value);
      refreshCartSummary();
    }
  };

  const handleApply = async (data: { discount: string }) => {
    setIsApplyLoading(true);
    setDiscountMessage("");
    if (Number(data.discount) > Number(orderSummaryData.subTotal)) {
      setDiscountMessage(checkoutTranslations("csrDiscountSubTotalError"));
      setIsApplyLoading(false);
      return;
    }
    const cartNumber = await getCartNumber();
    const applyDiscountRequest: IApplyDiscountRequest = {
      discountCode: "",
      discountType: DISCOUNT_TYPE.CSR_DISCOUNT,
      cartNumber: cartNumber,
      isCart: false,
      isShippingOptionSelected: shippingOptionId ? true : false,
      csrDiscount: Number(data.discount),
      isTaxEmpty: isTaxExempt,
    };
    const discountDetails = await applyDiscount(applyDiscountRequest);
    if (discountDetails && discountDetails.discountStatus?.isSuccess) {
      setOrderSummaryData(discountDetails.calculatedDetails);
      setDiscountMessage(discountDetails.calculatedDetails.discounts?.find((discount) => discount.discountType === DISCOUNT_TYPE.CSR_DISCOUNT)?.message ?? "");
    }
    setIsApplyLoading(false);
  };
  const handleRemoved = async () => {
    const cartNumber = await getCartNumber();
    const applyDiscountRequest: IApplyDiscountRequest = {
      discountCode: "",
      discountType: DISCOUNT_TYPE.CSR_DISCOUNT,
      cartNumber: cartNumber,
      isCart: false,
      isShippingOptionSelected: shippingOptionId ? true : false,
      csrDiscount: Number(orderSummaryData.csrDiscountAmount),
      isTaxEmpty: isTaxExempt,
    };

    const discountDetails = await removeDiscount(applyDiscountRequest);
    if (discountDetails && discountDetails.discountStatus?.isSuccess) {
      setOrderSummaryData(discountDetails.calculatedDetails);
      setDiscountMessage("");
    }
  };

  const onClose = () => {
    closeModal();
    setIsTaxExempt(false);
    setIsChecked(false);
  };

  const onConfirm = () => {
    setIsTaxExempt(isChecked);
    setIsChecked(isChecked);
    refreshCartSummary();
    closeModal();
  };

  useEffect(() => {
    if (user?.isTaxExempt) {
      setIsTaxExempt(user.isTaxExempt);
      setIsChecked(user.isTaxExempt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (modalActiveId === "" && !isTaxExempt && !user?.isTaxExempt) {
      setIsChecked(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalActiveId]);

  return (
    <div>
      <CSRDiscountTaxExempt
        isFromQuote={isFromQuote}
        applyLoading={isApplyLoading}
        checked={isChecked}
        onCheckboxChange={handleCheckboxChange}
        onApply={handleApply}
        handleRemoved={handleRemoved}
        message={discountMessage}
        setDiscountMessage={setDiscountMessage}
      />
      <Modal size="2xl" modalId="TaxEmpty" maxHeight="lg" customClass="no-print">
        <div className="max-w-[350px]" data-test-selector="divCSRDiscountPopup">
          <Heading name={checkoutTranslations("confirmationTitle")} level="h2" dataTestSelector="hdgCsrDiscount" customClass="mt-0" showSeparator />
          <p className="mb-6">{checkoutTranslations("confirmationMessage")}</p>
          <div className="flex justify-end gap-2">
            <Button
              onClick={onClose}
              type="primary"
              className="btn btn-primary uppercase tracking-wider text-sm"
              dataTestSelector="btnBack"
              showLoadingText={true}
              loaderColor="currentColor"
              loaderWidth="20px"
              loaderHeight="20px"
            >
              {commonTranslations("back")}
            </Button>
            <Button type="primary" data-test-selector="btnOK" className="btn btn-secondary uppercase tracking-wider text-sm px-3 w-16" dataTestSelector="btnOk" onClick={onConfirm}>
              {commonTranslations("ok")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CSRDiscount;
