import { ZIcons } from "../../../common/icons/ZIcons";
import { useRef, useState } from "react";

interface IHelpLabelProps {
  labelTitle: string;
  helpDescription?: string;
  hasRequired?: boolean;

  labelDataSelector?: string;
}
export function HelpLabel(props: IHelpLabelProps) {
  const { labelTitle, helpDescription = undefined, hasRequired = undefined, labelDataSelector } = props;
  const [hovered, setHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex items-center gap-1 pb-2">
      <label className="font-semibold" data-test-selector={labelDataSelector}>
        {labelTitle}
      </label>
      {hasRequired && <strong className="text-errorColor"> *</strong>}
      {helpDescription && (
        <div ref={iconRef} className="relative group cursor-pointer w-fit" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <ZIcons name="circle-help" height="15px" width="15px" />
          <CustomTooltip placement="right" message={helpDescription} visible={hovered} />
        </div>
      )}
    </div>
  );
}

interface CustomTooltipProps {
  message: string;
  placement?: "left" | "top" | "right" | "bottom";
  visible: boolean;
}

export function CustomTooltip({ message, placement = "left", visible }: CustomTooltipProps) {
  if (!visible) return null;

  const baseClasses = "absolute bg-black text-white text-xs px-2 py-1 rounded z-10 w-60 whitespace-normal break-words shadow-md";
  const arrowBase = "absolute w-2 h-2 bg-black rotate-45";

  let positionClasses = "";
  let arrowPosition = "";

  switch (placement) {
    case "left":
      positionClasses = "right-full top-1/2 -translate-y-1/2 mr-2";
      arrowPosition = "left-full top-1/2 -translate-y-1/2 -ml-1";
      break;
    case "right":
      positionClasses = "left-full top-1/2 -translate-y-1/2 ml-2";
      arrowPosition = "right-full top-1/2 -translate-y-1/2 -mr-1";
      break;
    case "top":
      positionClasses = "bottom-full left-1/2 -translate-x-1/2 mb-2";
      arrowPosition = "top-full left-1/2 -translate-x-1/2 -mt-1";
      break;
    case "bottom":
      positionClasses = "top-full left-1/2 -translate-x-1/2 mt-2";
      arrowPosition = "bottom-full left-1/2 -translate-x-1/2 -mb-1";
      break;
  }

  return (
    <div className={`${baseClasses} ${positionClasses}`}>
      <div className={`${arrowBase} ${arrowPosition}`} />
      {message}
    </div>
  );
}
