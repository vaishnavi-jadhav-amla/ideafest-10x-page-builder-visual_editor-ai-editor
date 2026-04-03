import { IImageConfigRenderProps } from "./ImageConfig";
import { ImageWidget } from "@znode/base-components/znode-widget/image-widget";

export function ImageRender(props: Readonly<IImageConfigRenderProps>) {
  const { alt, height, width, image, url, layout, borderRadius, loading, hoverEffect, shadow, padding, target, id, alignment } = props || {};

  return (
    <ImageWidget
      key={id}
      srcImg={image}
      alt={alt}
      width={width}
      height={height}
      layout={layout}
      url={url}
      borderRadius={borderRadius}
      loading={loading}
      hoverEffect={hoverEffect}
      shadow={shadow}
      padding={padding}
      target={target}
      alignment={alignment}
    />
  );
}
