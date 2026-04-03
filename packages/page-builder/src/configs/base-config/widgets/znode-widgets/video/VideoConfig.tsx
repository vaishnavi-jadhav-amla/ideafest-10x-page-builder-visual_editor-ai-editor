import { AssetsGallery } from "../../../../../component/assets-gallery/AssetsGallery";
import type { ComponentConfig } from "@measured/puck";
import type { IRenderProps } from "../../../../../types/page-builder";
import { MediaPopup } from "../../../../../component/media-popup";
import { VideoRender } from "./VideoRender";
import { Video } from "lucide-react";
import DataStateHandler from "packages/page-builder/src/component/data-handler/DataStateHandler";
import { MEDIA } from "@znode/constants/images";
import { WIDGET_CONFIGURATION_MESSAGES } from "packages/page-builder/src/constants/constants";

export interface IVideoConfig {
  controlEnable: boolean;
  autoPlay: boolean;
  video: string;
}

export type IVideoConfigRenderProps = IVideoConfig & IRenderProps;

export const VideoConfig: ComponentConfig<IVideoConfig> = {
  fields: {
    controlEnable: {
      type: "radio",
      options: [
        { label: "Enable", value: true },
        { label: "Disable", value: false },
      ],
      label: "Video Control",
    },
    autoPlay: {
      type: "radio",
      options: [
        { label: "Enable", value: true },
        { label: "Disable", value: false },
      ],
      label: "Auto Play",
    },
    video: {
      type: "custom",
      label: "Video",
      render: ({ onChange }) => <MediaPopup mediaType={MEDIA.VIDEO_EXTENSION} onChange={onChange} header="Select Video" Component={AssetsGallery} ButtonIcon={Video} />,
    },
  },
  label: "Video Widget",
  render: (props: IVideoConfigRenderProps) => {
    const { video, ...restProps } = props;
    return (
      <DataStateHandler response={video ?? {}} emptyMessage={WIDGET_CONFIGURATION_MESSAGES.VIDEO_CONFIGURATION_REQUIRED}>
        {video && <VideoRender video={video} {...restProps} />}
      </DataStateHandler>
    );
  },
};
