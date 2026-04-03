import AddToCartNotification from "@znode/base-components/components/add-to-cart-notification/AddToCartNotification";
import { BreadCrumbs } from "@znode/base-components/common/breadcrumb";
import CategoryGrid from "@znode/base-components/components/category-grid/CategoryGrid";
import { Heading } from "@znode/base-components/common/heading";
import { IFacets } from "@znode/types/facet";
import { IProductList } from "@znode/types/product";
import { Modal } from "@znode/base-components/common/modal";
import { ProductList } from "../../../product/product-list";
import QuickViewDetails from "@znode/base-components/common/product-card/quick-view/QuickViewDetails";

interface IProductListPageProps {
  productsData: IProductList;
  facetData: IFacets[];
  breadCrumbsTitle?: string;
  displayCategory?: boolean;
}

export function ProductListPage(props: Readonly<IProductListPageProps>) {
  const { productsData, facetData, breadCrumbsTitle, displayCategory = true } = props;

  const znodeCategoryIds: Array<number> = productsData.categoryId ? [Number(productsData.categoryId)] : [];
  return (
    <>
      <BreadCrumbs znodeCategoryIds={znodeCategoryIds} name={productsData?.categoryName || ""} breadCrumbsTitle={breadCrumbsTitle} />
      <Heading name={productsData?.categoryTitle} customClass="uppercase" dataTestSelector="hdgCategory" level="h1" />
      {productsData && productsData.shortDescription ? <div className="mb-5" dangerouslySetInnerHTML={{ __html: productsData.shortDescription }}></div> : null}
      {displayCategory && (productsData?.subCategories && productsData?.subCategories.length > 0) && <CategoryGrid category={productsData?.subCategories} />}
      <div className="grid grid-cols-1 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-4">
        <div className={facetData && facetData?.length > 0 ? "col-span-4" : "col-span-5"}>
          <ProductList productData={productsData} {...props} />
        </div>
      </div>

      <Modal size="5xl" modalId="QuickView" maxHeight="lg" customClass="overflow-y-auto no-print">
        <QuickViewDetails />
      </Modal>
      <AddToCartNotification />
    </>
  );
}
