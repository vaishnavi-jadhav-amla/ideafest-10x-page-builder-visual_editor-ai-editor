interface NoRecordFoundProps {
  text: string;
  size?: "small" | "default" | "large" | "x-large";
  align?: "center" | "left" | "right";
  customClass?: string;
}

export function NoRecordFound({ text = "", size = "default", align = "center", customClass = "" }: Readonly<NoRecordFoundProps>) {
  const sizeClass = (() => {
    switch (size) {
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      case "x-large":
        return "text-xl";
      case "default":
      default:
        return "text-base";
    }
  })();

  const alignmentClass = (() => {
    switch (align) {
      case "left":
        return "text-left";
      case "right":
        return "text-right";
      case "center":
      default:
        return "text-center";
    }
  })();

  return (
    <div className={`py-4 px-2 ${sizeClass} ${alignmentClass} ${customClass}`}>
      <p data-test-selector="paraNoRecordsFound">{text}</p>
    </div>
  );
}
