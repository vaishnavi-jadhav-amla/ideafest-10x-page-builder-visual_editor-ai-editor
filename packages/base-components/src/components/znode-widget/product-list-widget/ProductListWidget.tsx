import { IProductList, IProductListCard } from "@znode/types/product";

import { CardSlider } from "../../common/card-slider";
import { IWidget } from "@znode/types/widget";
import { ProductCard } from "../../common/product-card";
import { getProductWidgetList } from "@znode/agents/product";

export async function ProductListWidget(props: Readonly<IWidget>) {
  const productList: IProductList | null = await getProductWidgetList({ ...props });

  const renderProductCard = (products: IProductListCard[]) => products.map((product, i) => <ProductCard product={product} id={i} globalAttributes={{
    displayAllWarehousesStock: "",
    loginToSeePricingAndInventory: "",
  }} />);

  if (!productList?.productList?.length) {
    return null;
  }

  return (
    <>
      <div className="pb-3 text-center border-b separator" data-test-selector="divFeaturedProductsHeading">
        {/* TO DO: Replace with content block after implementation  */}
        Featured Products
      </div>
      <div>
        <CardSlider>{renderProductCard(productList.productList)}</CardSlider>
      </div>
    </>
  );
}
