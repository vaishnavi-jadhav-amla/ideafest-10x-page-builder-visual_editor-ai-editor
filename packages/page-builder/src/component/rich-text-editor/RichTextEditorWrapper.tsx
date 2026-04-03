"use client";
import { useEffect, useRef, useState } from "react";
import { IPopupButtonRef, PopupButton } from "../popup-button/PopupButton";
import RichTextEditor from "./RichTextEditor";

interface IRichTextEditorWrapperProps {
  value: string;
  onChange: (_value: string) => void;
}

export function RichTextEditorWrapper(props: Readonly<IRichTextEditorWrapperProps>) {
  const { value, onChange } = props;
  const [editorText, setEditorText] = useState(value);
  const popupButtonRef = useRef<IPopupButtonRef>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const eventData = event.data;
      if (!eventData || eventData?.actionType !== "open_popup") return;

      const text = eventData?.data?.text || "";
      popupButtonRef.current?.togglePopup();
      handlePopupOpen("window", text);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function handleApply() {
    onChange(editorText);
  }

  function handleBack() {
    setEditorText("");
  }

  function handlePopupOpen(type?: "window" | "change", text?: string) {
    let newValue = value;
    if (type && type === "window") {
      newValue = text || "";
    }

    setEditorText(newValue);
  }

  return (
    <PopupButton ref={popupButtonRef} buttonTitle="Open Rich Text Widget" popupHeaderTitle="RICH TEXT WIDGET" onOpen={handlePopupOpen} onBack={handleBack} onSave={handleApply}>
      <RichTextEditor editorText={editorText} onEditorTextChange={setEditorText} />
    </PopupButton>
  );
}
