"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { IPageStructure } from "@znode/types/visual-editor";

const CHAT_URL = process.env.NEXT_PUBLIC_PAGE_BUILDER_CHAT_URL || "http://localhost:4200";

/** postMessage type: page-builder → chat iframe */
const MSG_BUILDER_SYNC_PAGE = "PAGE_BUILDER_SYNC_PAGE";
/** postMessage type: chat iframe → page-builder */
const MSG_CHAT_PAGE_UPDATE = "CHAT_PAGE_UPDATE";

function resolveChatOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

export interface AiChatIframeProps {
  /** Current page structure from the visual editor — kept in sync with the AI chat. */
  page?: IPageStructure;
  /** Called when the AI chat produces an updated page structure. */
  onPageUpdate?: (page: IPageStructure) => void;
}

export function AiChatIframe({ page, onPageUpdate }: AiChatIframeProps) {
  const [open, setOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatOrigin = resolveChatOrigin(CHAT_URL);

  /** Send the current page structure into the chat iframe. */
  const sendPageToChat = useCallback(
    (pageData: IPageStructure) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: MSG_BUILDER_SYNC_PAGE, page: pageData },
        chatOrigin
      );
    },
    [chatOrigin]
  );

  /**
   * When the panel opens or the page changes while open, push the latest page
   * into the iframe. The 500 ms debounce covers rapid Puck edits and gives the
   * iframe time to initialise on first open.
   */
  useEffect(() => {
    if (!open || !page) return;
    const id = setTimeout(() => sendPageToChat(page), 500);
    return () => clearTimeout(id);
  }, [open, page, sendPageToChat]);

  /** Receive page updates produced by the AI chat and surface them to the editor. */
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== chatOrigin) return;
      if (event.data?.type !== MSG_CHAT_PAGE_UPDATE) return;
      const updatedPage = event.data?.page as IPageStructure | undefined;
      if (updatedPage && typeof updatedPage === "object") {
        onPageUpdate?.(updatedPage);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [chatOrigin, onPageUpdate]);

  return (
    <>
      {/* FAB button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          ...fabStyle,
          transform: open ? "scale(0)" : "scale(1)",
        }}
        aria-label="Open Page Builder AI Chat"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && <div style={backdropStyle} onClick={() => setOpen(false)} />}

      {/* Popup */}
      <div
        style={{
          ...popupStyle,
          transform: open ? "scale(1)" : "scale(0.9)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Close button */}
        <button type="button" onClick={() => setOpen(false)} style={closeBtnStyle} aria-label="Close chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {open && (
          <iframe
            ref={iframeRef}
            src={`${CHAT_URL}/`}
            title="Page Builder AI Chat"
            style={iframeStyle}
            allow="clipboard-read; clipboard-write"
          />
        )}
      </div>
    </>
  );
}

const fabStyle: CSSProperties = {
  position: "fixed",
  bottom: 28,
  right: 28,
  width: 56,
  height: 56,
  borderRadius: "50%",
  border: "none",
  background: "linear-gradient(135deg, #10b981, #059669)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 20px rgba(16,185,129,0.45)",
  zIndex: 10000,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const backdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  zIndex: 10001,
};

const closeBtnStyle: CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "none",
  background: "#f1f5f9",
  color: "#374151",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  zIndex: 1,
  transition: "background 0.15s",
};

const popupStyle: CSSProperties = {
  position: "fixed",
  bottom: 96,
  right: 28,
  width: 420,
  height: "min(640px, calc(100vh - 120px))",
  maxWidth: "calc(100vw - 40px)",
  borderRadius: 16,
  background: "#fff",
  boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
  zIndex: 10002,
  transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease",
  transformOrigin: "bottom right",
  overflow: "hidden",
};

const iframeStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  border: "none",
};
