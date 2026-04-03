import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";


interface IDomPortalProps {
    children: React.ReactNode;
  
}
export function DomPortal(props: IDomPortalProps) {
    const ref = useRef<Element | null>();
    const [mounted, setMounted] = useState(false);
  
    useEffect(() => {
      ref.current = document.querySelector("#modal");
      setMounted(true);
    }, []);
  
    return mounted && ref.current ? createPortal(props.children, ref.current) : null;
}
