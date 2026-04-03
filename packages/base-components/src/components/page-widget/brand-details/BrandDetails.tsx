import { BRAND } from "@znode/constants/brand";
import { BrandProductList } from "./brand-product-list/BrandProductList";
import { ClientBreadCrumbs } from "../../common/breadcrumb";
import Heading from "../../common/heading/Heading";
import { IBrand } from "@znode/types/brand";
import { formatTestSelector } from "@znode/utils/common";
import { useTranslations } from "next-intl";

export function BrandDetails({ brandData, ...rest }: { brandData: IBrand; showWishlist?: boolean }) {
  const t = useTranslations("Common");

  const breadCrumbsData = {
    title: t("shopByBrand"),
    routingLabel: "Home",
    routingPath: "/",
    nestedRouting: true,
    nestedRoutingPath: "/brand/list",
    nestedRoutingTitle: brandData?.brandName,
    nestedRoutingLabel: "",
  };
  return (
    <>
      <ClientBreadCrumbs customPath={breadCrumbsData} />
      <Heading name={brandData?.brandName} customClass="border-none uppercase" level="h1" dataTestSelector={formatTestSelector("hdg", `${brandData?.brandName}`)} />
      <BrandProductList
        widgetKey="130"
        widgetCode="BrandProductGridWithFacet"
        typeOfMapping="Brand"
        displayName="ProductList"
        cmsMappingId={brandData?.brandId}
        properties={{
          [BRAND.BRAND]: brandData?.brandName,
        }}
        brandCode={brandData.brandCode}
        {...rest}
      />
    </>
  );
}
