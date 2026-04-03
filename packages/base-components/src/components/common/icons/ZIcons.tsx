"use client";

import { LucideProps } from "lucide-react";
import dynamic from "next/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { useMemo } from "react";

interface ILucidIconProps extends LucideProps {
  name: keyof typeof dynamicIconImports;
}

export function ZIcons({ name, ...props }: Readonly<ILucidIconProps>) {
  const LucideIcon = useMemo(() => {
    return dynamic(dynamicIconImports[name]);
  }, [name]);

  return <LucideIcon width="20px" height="20px" {...props} />;
}
