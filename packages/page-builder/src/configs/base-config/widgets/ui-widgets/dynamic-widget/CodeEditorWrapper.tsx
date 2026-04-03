"use client";

import { IPopupButtonRef, PopupButton } from "../../../../../component/popup-button/PopupButton";
import { WIDGET_CONFIGURATION_MESSAGES } from "../../../../../constants/constants";
import { useEffect, useRef, useState } from "react";

interface ICodeEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditorWrapper = ({ value, onChange }: ICodeEditorWrapperProps) => {
  const [editorText, setEditorText] = useState(value);
  const popupButtonRef = useRef<IPopupButtonRef>(null);

  const hasUnsavedChanges = editorText !== value;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const eventData = event.data;
      if (!eventData || eventData?.actionType !== "open_popup") return;

      const text = eventData?.data?.text || "";
      popupButtonRef.current?.openPopup();
      handleOpenPopup("window", text);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleOpenPopup = (type?: "window" | "change", text?: string) => {
    const newText = type === "window" ? text || "" : value;
    setEditorText(newText);
  };

  const handleApplyChanges = () => {
    onChange(editorText);
  };

  const handleBackAction = () => {
    if (hasUnsavedChanges && popupButtonRef.current?.openConfirmPopup) {
      popupButtonRef.current?.openConfirmPopup();
    } else {
      popupButtonRef.current?.closePopup();
    }
  };

  const handleConfirmDiscard = () => {
    setEditorText(value);
    if (popupButtonRef.current?.closeConfirmPopup) {
      popupButtonRef.current?.closeConfirmPopup();
    }
    popupButtonRef.current?.closePopup();
  };

  const handleCancelDiscard = () => {
    if (popupButtonRef.current?.closeConfirmPopup) {
      popupButtonRef.current?.closeConfirmPopup();
    }
  };

  return (
    <>
      <PopupButton
        ref={popupButtonRef}
        buttonTitle="Open Dynamic Widget"
        popupHeaderTitle="Enter your HTML, CSS, or JavaScript."
        onOpen={handleOpenPopup}
        onBack={handleBackAction}
        onSave={handleApplyChanges}
        hasBackButtonHandle
        popupConfirmHeaderTitle={"Are you sure you want to leave this page?"}
        onConfirmOk={handleConfirmDiscard}
        onConfirmCancel={handleCancelDiscard}
        confirmMessage={WIDGET_CONFIGURATION_MESSAGES.UNSAVED_CHANGES_WARNING}
        popupContainerStyle={{
          width: "100vw",
          minWidth: "100vw",
          height: "auto",
        }}
      >
        <div className="w-full h-[70vh] box-border">
          <textarea
            value={editorText}
            onChange={(e) => setEditorText(e.target.value)}
            className="w-full h-full text-sm p-4 rounded border border-gray-400 resize-none box-border"
          />
        </div>
      </PopupButton>
    </>
  );
};