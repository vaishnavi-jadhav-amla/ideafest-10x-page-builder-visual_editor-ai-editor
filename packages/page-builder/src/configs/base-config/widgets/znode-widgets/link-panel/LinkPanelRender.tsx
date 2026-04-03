import { ILinkPanelRenderProps } from "./LinkPanelConfig";
import { LinkPanel } from "@znode/base-components/znode-widget/link-panel";

export function LinkPanelWrapper(props: Readonly<ILinkPanelRenderProps>) {
  const { response, contentOrientation, customClass } = props || {};

  if (!props.response?.data) return null;

  const { data = [] } = response || {};

  return <LinkPanel contentOrientation={contentOrientation} customClass={customClass} isFont={true} allLinks={data} customImageClass="" />;
}
