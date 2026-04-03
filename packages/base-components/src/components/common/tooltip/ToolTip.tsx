"use client";

import React, { useEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

type placementProps = "top" | "bottom" | "left" | "right";
interface IToolTip {
  message: string;
  children: React.ReactNode;
  cssClasses?: string;
  isShow?: boolean;
  isVisible?: boolean;
  placement?: placementProps;
  isFromModal?: boolean;
  messageContainerClass?: string;
}

export const Tooltip: React.FC<IToolTip> = ({ message, children, cssClasses, isVisible = true, placement = "bottom", isFromModal = false, messageContainerClass="" }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className={cssClasses} ref={ref} onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)} onClick={() => setTimeout(() =>setVisible(false), 10)}>
      <div className="relative flex flex-col items-center justify-center w-full capitalize group max-w-max">
        {children}
        {isVisible && visible && message?.trim() !== "" && (
          <CustomTooltip messageContainerClass={messageContainerClass} targetRef={ref} visible={visible} message={message} placement={placement} isFromModal={isFromModal} />
        )}
      </div>
    </div>
  );
};

interface IRenderToolTipProps {
  message: string;
  visible: boolean;
  targetRef: React.RefObject<HTMLElement>;
  placement: placementProps;
  isFromModal: boolean;
  messageContainerClass: string;
}
function CustomTooltip({ targetRef, visible, message, placement, isFromModal, messageContainerClass }: IRenderToolTipProps) {
  if (!targetRef.current) return null;

  const rect = targetRef.current.getBoundingClientRect();
  const style: React.CSSProperties = {
    position: "absolute",
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + rect.width / 2}px`,
    zIndex: isFromModal ? 60 : 40,
  };

  const arrowStyle: React.CSSProperties = {
    position: "absolute",
  };

  // Adjust tooltip position and arrow based on placement
  switch (placement) {
    case "top":
      style.top = `${rect.top + window.scrollY - 8}px`;
      style.left = `${rect.left + rect.width / 2}px`;
      style.transform = "translate(-50%, -100%)";
      arrowStyle.bottom = "-4px";
      arrowStyle.left = "50%";
      arrowStyle.transform = "translateX(-50%) rotate(45deg)";
      break;
    case "right":
      style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
      style.left = `${rect.right + window.scrollX + 8}px`;
      style.transform = "translate(0, -50%)";
      arrowStyle.left = "-6px";
      arrowStyle.top = "50%";
      arrowStyle.transform = "translateY(-50%) rotate(45deg)";
      break;
    case "bottom":
      style.top = `${rect.bottom + window.scrollY + 8}px`;
      style.left = `${rect.left + rect.width / 2}px`;
      style.transform = "translate(-50%, 0)";
      arrowStyle.top = "-4px";
      arrowStyle.left = "50%";
      arrowStyle.transform = "translateX(-50%) rotate(45deg)";
      break;
    case "left":
      style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
      style.left = `${rect.left + window.scrollX - 3}px`;
      style.transform = "translate(-100%, -50%)";
      arrowStyle.right = "-6px";
      arrowStyle.top = "50%";
      arrowStyle.transform = "translateY(-50%) rotate(45deg)";
      break;
    default:
      break;
  }

  return createPortal(
    <div
      style={style}
      className={` transform rounded-lg px-3 py-1 text-xs 
      font-medium transition-all duration-500 ease-out -translate-x-1/2 left-1/2 ${visible ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
    >
      <div className={"flex max-w-xs flex-col shadow-lg relative items-center"}>
        <div className="w-3 h-3 bg-gray-800" style={arrowStyle} />
        <div className={`p-2 text-xs text-center text-white bg-gray-800 rounded ${messageContainerClass}`}>{message}</div>
      </div>
    </div>,
    document.body
  );
}
