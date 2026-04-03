interface ISeparatorProps {
  customClass?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function Separator({ customClass = "", size = "xs" }: Readonly<ISeparatorProps>) {
  return <div className={`separator-${size} ${customClass}`}></div>;
}

export default Separator;
