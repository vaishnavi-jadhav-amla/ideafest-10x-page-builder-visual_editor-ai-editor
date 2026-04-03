import { IVideoConfigRenderProps } from "./VideoConfig";
import { Video } from "@znode/base-components/znode-widget/video";

export function VideoRender(props: Readonly<IVideoConfigRenderProps>) {
  const { controlEnable, autoPlay, video } = props;

  const muted = autoPlay || false;

  return <Video videoUrl={video} controlEnable={controlEnable} autoPlay={autoPlay} muted={muted} key={props.id} />;
}
