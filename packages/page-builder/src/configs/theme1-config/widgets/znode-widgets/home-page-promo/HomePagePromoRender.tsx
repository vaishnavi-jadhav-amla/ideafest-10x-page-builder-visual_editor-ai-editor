import { HomePagePromo } from "@znode/theme1-components/znode-widgets/home-page-promo";
import { IHomePagePromoConfigRenderProps } from "./HomePagePromoConfig";

export function HomePagePromoRender(props: Readonly<IHomePagePromoConfigRenderProps>) {
  const { response: _response } = props;

  return <HomePagePromo />;
}
