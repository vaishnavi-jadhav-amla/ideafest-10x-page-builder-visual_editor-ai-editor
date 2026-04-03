import { BrandCard } from "./brand-card/BrandCard";
import { BrandFilter } from "./brand-filter/BrandFilter";
import { BreadCrumbs } from "../../common/breadcrumb";
import { HeadingBar } from "../../common/heading-bar/HeadingBar";
import { NoRecordFound } from "../../common/no-record-found/NoRecordFound";
import { useTranslations } from "next-intl";
import { DynamicPagination } from "../../common/pagination";
import { BRAND_PAGINATION } from "@znode/constants/pagination";
interface IBrandsProps {
  brandList: Array<{ id: number; name: string; code: string; img: string; seoUrl: string; seoTitle: string }>;
  totalResults: number;
  pageSize: number;
}

const defaultPageSize = BRAND_PAGINATION.find((data) => data.isDefault)?.pageValue || 10;
export function Brands(props: Readonly<IBrandsProps>) {
  const commonTranslations = useTranslations("Common");
  return (
    <div className="mb-2" data-test-selector="divBrandListContainer">
      <BreadCrumbs breadCrumbsTitle={commonTranslations("brand")} enablePageContextBreadcrumb={true} />
      <HeadingBar name={commonTranslations("shopByBrand")} />
      <div className="mb-3">
        <BrandFilter pageSize={props.pageSize || defaultPageSize} />
      </div>
      {props.brandList.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6">
            {props.brandList.map((brand) => (
              <BrandCard key={brand.id} name={brand.name} code={brand.code} img={brand.img} brandId={brand.id} seoUrl={brand.seoUrl} seoTitle={brand.seoTitle} />
            ))}
          </div>
          <DynamicPagination totalProducts={props.totalResults} pageList={BRAND_PAGINATION} pageSize={props.pageSize || defaultPageSize} />
        </>
      ) : (
        <NoRecordFound text={commonTranslations("noRecordsFound")} />
      )}
    </div>
  );
}

Brands.BrandFilter = BrandFilter;
Brands.BrandCard = BrandCard;
