"use client";

import Button from "../../../common/button/Button";
import { Heading } from "../../../common/heading";
import { PRODUCT } from "@znode/constants/product";
import { useModal } from "../../../../stores/modal";
import { useProduct } from "../../../../stores/product";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslationMessages } from "@znode/utils/component";

const ProductComparePopup = () => {
  const t = useTranslationMessages("Common");
  const productTranslation = useTranslationMessages("Product");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { closeModal } = useModal();
  const { updateCompareProductMessage, product } = useProduct();

  const viewComparison = () => {
    setLoading(true);
    router.push("/compare-product");
    updateCompareProductMessage(null);
    closeModal();
  };

  const renderButtons = () => {
    return (
      <div className="flex gap-2 justify-end pb-2 ">
        {Number(product.compareProductList?.length) <= PRODUCT.MAX_COMPARE_PRODUCT_LIMIT && product.compareProductMessage !== productTranslation("productLimitMessage") && (
          <Button
            type="primary"
            data-test-selector="btnAddMore"
            className="btn btn-secondary uppercase tracking-wider text-sm "
            dataTestSelector="btnAddMore"
            onClick={() => {
              updateCompareProductMessage(null);
              closeModal();
            }}
          >
            {t("addMore")}
          </Button>
        )}
        {Number(product.compareProductList?.length) === PRODUCT.MAX_COMPARE_PRODUCT_LIMIT && product.compareProductMessage === productTranslation("productLimitMessage") && (
          <Button
            type="primary"
            data-test-selector="btnOK"
            className="btn btn-secondary uppercase tracking-wider text-sm px-3 w-16"
            dataTestSelector="btnOk"
            onClick={() => {
              updateCompareProductMessage(null);
              closeModal();
            }}
          >
            {t("ok")}
          </Button>
        )}

        {product.compareProductList && product.compareProductList.length > 1 && (
          <Button
            type="primary"
            className="btn btn-primary uppercase tracking-wider text-sm"
            onClick={viewComparison}
            dataTestSelector="btnViewComparison"
            loading={loading}
            showLoadingText={true}
            loaderColor="currentColor"
            loaderWidth="20px"
            loaderHeight="20px"
          >
            {t("viewComparison")}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="sm:min-w-[450px]" data-test-selector="divProductComparePopup">
      <Heading name={t("compareProduct")} level="h2" dataTestSelector="hdgProductCompare" customClass="mt-0" showSeparator />
      {product.compareProductMessage && (
        <p className="pb-4" data-test-selector="paraProductCompare">
          {product.compareProductMessage}
        </p>
      )}
      {renderButtons()}
    </div>
  );
};
export default ProductComparePopup;
