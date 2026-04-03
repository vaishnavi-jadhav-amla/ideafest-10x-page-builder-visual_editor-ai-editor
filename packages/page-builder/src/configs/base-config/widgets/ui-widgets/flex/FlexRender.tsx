import { DropZone } from "@measured/puck";
import { defaultFlexProperties, IFlexRenderProps } from "./FlexConfig";
import "./flex-style.css";

export function FlexRender({
  layout = "standard",
  align,
  margin,
  padding,
  border,
  image,
  height,
  maxWidth,
  puck,
  flexProperties = defaultFlexProperties,
  rigidView = "no",
}: IFlexRenderProps) {
  const isEditing = puck.isEditing;

  const alignmentClasses: Record<string, string> = {
    left: "ml-0 mr-auto",
    center: "mx-auto",
    right: "ml-auto mr-0",
  };

  const getAlignmentClass = () => {
    return `${alignmentClasses[align]}`;
  };

  const getWidthStyle = (): React.CSSProperties => {
    const left = margin.left;
    const right = margin.right;
    let baseWidth = "100%";

    if (left && right) {
      baseWidth = `calc(100% - ${left}px - ${right}px)`;
    } else if (left) {
      baseWidth = `calc(100% - ${left}px)`;
    } else if (right) {
      baseWidth = `calc(100% - ${right}px)`;
    }

    const style: React.CSSProperties = { width: baseWidth };

    if (layout !== "standard") {
      style.maxWidth = `${maxWidth}px`;
    }

    return style;
  };

  const filterDefaults = (value: string | number, defaultValue: string | number) => {
    return value !== defaultValue ? `${value}px` : undefined;
  };

  const getAdjustedMargin = () => ({
    marginTop: filterDefaults(margin.top, "0"),
    marginRight: filterDefaults(margin.right, "0"),
    marginLeft: filterDefaults(margin.left, "0"),
    marginBottom: filterDefaults(margin.bottom, "0"),
  });

  const getAdjustedPadding = () => ({
    paddingTop: filterDefaults(padding.top, "0"),
    paddingRight: filterDefaults(padding.right, "0"),
    paddingBottom: filterDefaults(padding.bottom, "0"),
    paddingLeft: filterDefaults(padding.left, "0"),
  });

  const getAdjustedBorder = () => ({
    borderWidth: filterDefaults(border.width, "0"),
    borderStyle: border.borderClass !== "solid" ? border.borderClass : undefined,
    borderColor: border.color !== "black" ? border.color : undefined,
    borderRadius: border.borderRadius !== 0 ? `${border.borderRadius}px` : undefined,
  });

  const getComputedHeight = () => {
    if (typeof height === "number" && height > 0) {
      return `${height}px`;
    }
    return height === "auto" || (typeof height === "number" && height === 0) ? "" : undefined;
  };

  const getBackgroundStyles = () => {
    if (image.src) {
      return {
        backgroundImage: `url(${image.src})`,
        backgroundSize: image.backgroundSize ? image.backgroundSize : undefined,
        backgroundPosition: image.backgroundPosition !== "center" ? image.backgroundPosition : undefined,
        backgroundRepeat: image.backgroundRepeat !== "repeat" ? image.backgroundRepeat : undefined,
        backgroundClip: "padding-box",
      };
    }
    return {};
  };

  // Prepare final style
  const getStyle = () => ({
    ...getAdjustedMargin(),
    ...getAdjustedPadding(),
    ...getAdjustedBorder(),

    ...getWidthStyle(),
    ...getBackgroundStyles(),
  });

  const flexDirection = flexProperties?.flexDirection;
  const rowAlignment = flexProperties?.rowAlignment;
  const columnAlignment = flexProperties?.columnAlignment;

  const justifyContent = flexDirection === "row" ? rowAlignment?.justifyContent : columnAlignment?.justifyContent;
  const alignItems = flexDirection === "row" ? rowAlignment?.alignItems : columnAlignment?.alignItems;

  let flexStyles: React.CSSProperties = {
    display: "flex",
    width: "100%",
    flexDirection: flexDirection || "column",
    justifyContent: justifyContent,
    alignItems: alignItems,
    height: getComputedHeight(),
    gap: flexProperties.gap,
    flexWrap: flexProperties.flexWrap,
  };
  const dropzoneStyle = isEditing ? flexStyles : {};
  const containerStyle = isEditing ? {} : flexStyles;
  const containerClass = isEditing ? "" : "flex-component";
  const responsiveClass = rigidView === "yes" ? "" : "responsiveness";

  return (
    <div className={`${getAlignmentClass()}  flex-render`} style={getStyle()}>
      <div style={containerStyle} className={`${containerClass} ${responsiveClass}`}>
        <DropZone zone="Container" style={dropzoneStyle} />
      </div>
    </div>
  );
}
