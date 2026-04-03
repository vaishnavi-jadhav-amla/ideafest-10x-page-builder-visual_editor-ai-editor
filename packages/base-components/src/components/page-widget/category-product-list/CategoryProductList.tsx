import { BreadCrumbs } from "../../common/breadcrumb";
import CategoryGrid from "../../category-grid/CategoryGrid";
import { CompareProductList } from "../../product";
import { FacetList } from "../../product/facet";
import { Heading } from "../../common/heading";
import { IFacets } from "@znode/types/facet";
import { IProductList } from "@znode/types/product";
import { ProductList } from "../../product/product-list";

interface ICategoryProductListProps {
  productsData: IProductList;
  facetData: IFacets[];
  breadCrumbsTitle?: { breadCrumb: string; breadCrumbPDP: string };
  displayCategory?: boolean;
  isEnableCompare?: boolean;
  showWishlist?: boolean;
}

export function CategoryProductList(props: Readonly<ICategoryProductListProps>) {
  const { productsData, facetData, breadCrumbsTitle, displayCategory = true, isEnableCompare } = props;
  const znodeCategoryIds: Array<number> = productsData.categoryId ? [Number(productsData.categoryId)] : [];
  return (
    <>
      <BreadCrumbs znodeCategoryIds={znodeCategoryIds} name={productsData?.categoryName || ""} breadCrumbsTitle={breadCrumbsTitle?.breadCrumb} />
      <Heading name={productsData?.categoryTitle} customClass="uppercase" dataTestSelector="hdgCategory" level="h1" />
      {productsData && productsData.shortDescription && (
        <pre className="my-2 text-justify text-textColor font-sans text-base text-wrap whitespace-normal" dangerouslySetInnerHTML={{ __html: productsData.shortDescription || "" }}></pre>
      )}
      {displayCategory && productsData?.subCategories && productsData?.subCategories.length > 0 && <CategoryGrid category={productsData?.subCategories} />}
      <div className="grid grid-cols-1 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-4">
        {facetData.length > 0 && (
          <div className="col-span-4 mb-3 lg:col-span-1 lg:mb-0">
            <FacetList facetData={facetData} pageSize={productsData.pageSize} facetTerm={{ categoryCode: productsData.categoryCode }} />
            {isEnableCompare && <CompareProductList />}
          </div>
        )}
        <div className={facetData && facetData?.length > 0 ? "col-span-4" : "col-span-5"}>
          <ProductList
            productData={productsData}
            isEnableCompare={isEnableCompare}
            {...props}
            breadCrumbsDetails={{ breadCrumbsTitle: breadCrumbsTitle?.breadCrumbPDP as string, isCategoryFlow: true }}
          />
          {productsData?.longDescription && (
            <pre className="my-2 text-justify text-textColor font-sans text-base text-wrap whitespace-normal" dangerouslySetInnerHTML={{ __html: productsData.longDescription || "" }}></pre>
          )}
        </div>
      </div>
    </>
  );
}
