"use client";

import React, { ReactNode, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ZIcons } from "@znode/base-components/common/icons";

interface IPopupProps {
  headerTitle: string;
  children: ReactNode;
  closePopup: () => void;
  footerElement?: ReactNode;
  isOverlayActive?: boolean;
  containerStyle?: React.CSSProperties;
}

export function Popup(props: Readonly<IPopupProps>) {
  const { children, headerTitle, footerElement, isOverlayActive, containerStyle } = props;

  let footer = footerElement;

  return (
    <DomPortal>
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center rounded-sm z-[1000] top-[50px]">
        {!isOverlayActive && (
          <div className="w-full max-w-2xl min-h-[30vh] bg-white rounded-lg shadow-lg" style={containerStyle}>
            <div className="flex justify-between items-center px-4 border-b bg-modalHeaderBg">
              <h1 className="uppercase text-lg font-semibold text-white flex-1">{headerTitle}</h1>
              {footer}
            </div>

            <div className="p-4">
              <div>{children}</div>
            </div>
          </div>
        )}
      </div>
    </DomPortal>
  );
}

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
