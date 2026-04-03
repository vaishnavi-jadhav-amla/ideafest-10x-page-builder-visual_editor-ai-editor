import { AdSpace } from "@znode/base-components/znode-widget/ad-space";
import { TAdSpaceRenderProps } from "./AdSpaceConfig";
import { generateRandomNumber } from "packages/page-builder/src/utils/common";

const randomId = generateRandomNumber();
export function AdSpaceRender(props: Readonly<TAdSpaceRenderProps>) {
  const { response } = props;
  if (!response?.data) return null;
  const widgetUniqueKey = `${randomId}-${props.id}`;
  const adSpaces = response?.data || [];

  return <AdSpace adSpaces={adSpaces} key={widgetUniqueKey} customKey={widgetUniqueKey} />;
}
