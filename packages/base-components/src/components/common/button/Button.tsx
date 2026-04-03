import LoaderComponent from "../loader-component/LoaderComponent";
import React from "react";

interface ButtonProps {
  as?: React.ElementType;
  active?: boolean;
  block?: boolean;
  className?: string;
  children?: React.ReactNode;
  classPrefix?: string;
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  htmlType?: "button" | "submit" | "reset";
  type?: "primary" | "secondary" | "link" | "text";
  size?: "small" | "large" | "x-large";
  value?: string;
  dataTestSelector: string;
  showLoadingText?: boolean;
  loaderColor?: string;
  loaderHeight?: string;
  loaderWidth?: string;
  ariaLabel?: string;
  onClick?: (_event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  loaderText?: string;
  ripple?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  as: Element = "button",
  active,
  block,
  className,
  children,
  color,
  disabled,
  loading,
  startIcon,
  endIcon,
  htmlType = "button",
  type: typeProp = "default",
  size = "default",
  value,
  dataTestSelector,
  showLoadingText,
  loaderColor,
  loaderHeight,
  loaderWidth,
  ariaLabel,
  onClick,
  title,
  loaderText,
}) => {
  const getSizeClasses = (size: string): string => {
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
  };
  const getClasses = () => {
    const colorClasses = color ? `text-white bg-${color}-600 hover:bg-${color}-700` : "";
    const activeClasses = active ? "active:bg-opacity-50" : "";
    const blockClasses = block ? "w-full" : "";
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : loading ? "cursor-wait" : "";
    const sizeClasses = getSizeClasses(size);

    return `btn btn-${typeProp} ${sizeClasses} ${colorClasses} ${activeClasses} ${blockClasses} ${disabledClasses} ${className ?? ""}`;
  };

  return (
    <Element
      title={title}
      type={htmlType}
      className={getClasses()}
      disabled={disabled || loading}
      onClick={onClick}
      value={value}
      data-test-selector={dataTestSelector}
      aria-label={ariaLabel ? ariaLabel : children ? `${children} button` : "Icon"}
    >
      {startIcon && <span className={children ? "mr-2" : ""}>{startIcon}</span>}
      {loading ? (
        <LoaderComponent loaderText={loaderText} isLoading={loading} isLoadingTextShow={showLoadingText} color={loaderColor} height={loaderHeight} width={loaderWidth} />
      ) : (
        children
      )}
      {endIcon && <span className={children ? "ml-2" : ""}>{endIcon}</span>}
    </Element>
  );
};

export default Button;
