import { HomePagePromo } from "@znode/base-components/znode-widget/home-page-promo";
import { IHomePagePromoConfigRenderProps } from "./HomePagePromoConfig";

export function HomePagePromoRender(props: Readonly<IHomePagePromoConfigRenderProps>) {
  const { response } = props;

  if (!response?.data) return null;

  const data = response.data || {};

  return <HomePagePromo ctaLink={data.ctaLink} ctaText={data.ctaText} largeImageUrl={data.largeImageUrl} smallImageUrl={data.smallImageUrl} title={data.homePageTitle} />;
}
