import { ITickerConfigRenderProps } from "./TickerConfig";
import { Ticker } from "@znode/base-components/znode-widget/ticker";

export function TickerWrapper(props: Readonly<ITickerConfigRenderProps>) {
  if (!props.response?.data) return null;

  const title = props.response?.data?.title || "";
  return <Ticker tickerText={title} key={props.id} />;
}
