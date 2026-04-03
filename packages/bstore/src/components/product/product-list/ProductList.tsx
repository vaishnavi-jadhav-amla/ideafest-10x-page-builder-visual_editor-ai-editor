import { IProductList } from "@znode/types/product";
import { ProductViews } from "../product-view";
interface IProductListProps {
  productData: IProductList;
  isFromSearch?: boolean;
}
export function ProductList(props: Readonly<IProductListProps>) {
  const { productData, isFromSearch, ...rest } = props || {};
  return <ProductViews productData={productData} isFromSearch={isFromSearch} {...rest} />;
}
