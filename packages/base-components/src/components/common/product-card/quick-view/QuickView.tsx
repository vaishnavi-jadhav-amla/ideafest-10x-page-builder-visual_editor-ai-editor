import { LoadingSpinner, ZIcons } from "../../icons";

import { getQuickDetails } from "../../../../http-request";
import { useModal } from "../../../../stores/modal";
import { useProduct } from "../../../../stores/product";
import { useState } from "react";

function QuickView({ productId, showIcon }: { productId: number; showIcon: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const { setQuickViewData } = useProduct();
  const { openModal } = useModal();
  const getQuickViewInformation = async () => {
    setIsLoading(true);
    window && window.history.replaceState(null, "", window.location.pathname);
    const productInfo = await getQuickDetails(productId, null);
    setQuickViewData(productInfo);
    openModal("QuickView");
    setIsLoading(false);
  };

  return (
    <div className="cursor-pointer quick-view" onClick={getQuickViewInformation} data-test-selector={`divQuickView${productId}`}>
      {isLoading ? (
        <div className="flex justify-center" data-test-selector="divLoadingSpinner">
          <LoadingSpinner color="#7f7d7d" width="25px" height="25px" />
        </div>
      ) : (
        <div className={`${showIcon ? "block" : "lg:hidden"}`}>
          <ZIcons name="eye" width={23} height={23} stroke="#7f7d7d" data-test-selector={`svgEyeIcon${productId}`} />
        </div>
      )}
    </div>
  );
}

export default QuickView;
