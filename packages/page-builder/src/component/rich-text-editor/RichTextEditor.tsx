"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import "./rich-text-editor.css";
import LinkTooltip from "./LinkTooltip";
import type ReactQuillType from "react-quill";
import createCustomLink from "./CustomLink";

export type RichTextEditorHandle = {
  getContent: () => string;
};

interface IRichTextEditorProps {
  editorText: string;
  onEditorTextChange: (_value: string) => void;
  onEditorBlur?: (_value: string) => void;
}

interface RangeStatic {
  index: number;
  length: number;
}

const RichTextEditor = dynamic(
  async () => {
    const ReactQuill = (await import("react-quill")).default;
    const Quill = ReactQuill.Quill;
    const Inline = Quill.import("blots/inline");

    const CustomLink = createCustomLink(Inline);
    Quill.register("formats/link", CustomLink, true);

    return function RichTextEditorComponent(props: Readonly<IRichTextEditorProps>) {
      const { editorText, onEditorTextChange, onEditorBlur } = props;

      const quillRef = useRef<ReactQuillType | null>(null);
      const tooltipRef = useRef<HTMLDivElement | null>(null);
      const [url, setUrl] = useState("");
      const [target, setTarget] = useState("");
      const [savedRange, setSavedRange] = useState<RangeStatic | null>(null);
      const [showTooltip, setShowTooltip] = useState(false);

      useEffect(() => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const toolbar = quill.getModule("toolbar") as {
          addHandler: (name: string, callback: (...args: any[]) => void) => void;
        };
        toolbar.addHandler("link", () => {
          const range = quill.getSelection();
          if (!range || range.length === 0) return;

          const format = quill.getFormat(range);
          const linkFormat = format.link as { href?: string; target?: string };
          setSavedRange(range);
          setUrl(linkFormat?.href ?? "");
          setTarget(linkFormat?.target ?? "");
          setShowTooltip(true);
        });

        const handleClickOutside = (e: MouseEvent) => {
          if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node) && !(e.target as HTMLElement).closest(".ql-link")) {
            setShowTooltip(false);
          }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
      }, []);

      const applyLink = () => {
        const quill = quillRef.current?.getEditor();
        if (!quill || !savedRange) return;

        quill.formatText(savedRange.index, savedRange.length, "link", {
          href: url,
          target,
        });
        setShowTooltip(false);
      };

      const removeLink = () => {
        const quill = quillRef.current?.getEditor();
        if (!quill || !savedRange) return;

        quill.formatText(savedRange.index, savedRange.length, "link", false);
        setShowTooltip(false);
      };

      return (
        <div className="relative revert-base">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={editorText}
            onChange={onEditorTextChange}
            className="h-[220px]"
            onBlur={onEditorBlur}
            style={{ height: "220px", display:"flex", flexDirection:"column" }}
            modules={{
              toolbar: [
                [{ font: [] }],
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                [{ align: [false, "center", "right", "justify"] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link"],
                [{ color: [] }, { background: [] }],
                ["clean"],
              ],
            }}
            placeholder="Write something..."
          />

          {showTooltip && (
            <div ref={tooltipRef}>
              <LinkTooltip url={url} target={target} onUrlChange={setUrl} onTargetChange={setTarget} onApply={applyLink} onRemove={removeLink} />
            </div>
          )}
        </div>
      );
    };
  },
  { ssr: false }
);

export default RichTextEditor;
