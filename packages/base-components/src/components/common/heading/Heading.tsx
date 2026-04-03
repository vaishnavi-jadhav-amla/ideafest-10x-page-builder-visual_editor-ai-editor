import { ReactNode } from "react";
import { Separator } from "../separator";

interface IHeadingProps {
  name?: ReactNode;
  customClass?: string;
  dataTestSelector?: string;
  showSeparator?: boolean;
  separatorClass?: string;
  separatorSize?: "xs" | "sm" | "md" | "lg";
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children?: ReactNode;
}

export function Heading({
  name = "",
  children,
  customClass = "",
  dataTestSelector,
  showSeparator = false,
  separatorClass = "mt-0",
  separatorSize = "xs",
  level = "h2",
}: Readonly<IHeadingProps>) {
  // Convert the level (e.g., "h1") to its numeric equivalent (e.g., 1)
  const levelNumber = parseInt(level.slice(1), 10);
  const HeadingTag = level as keyof JSX.IntrinsicElements;
  return (
    <>
      <HeadingTag className={`w-full text-textColor ${customClass} heading-${levelNumber}`} data-test-selector={dataTestSelector}>
        {children || name}
      </HeadingTag>
      {showSeparator && <Separator customClass={`${separatorClass}`} size={separatorSize} />}
    </>
  );
}

export default Heading;
