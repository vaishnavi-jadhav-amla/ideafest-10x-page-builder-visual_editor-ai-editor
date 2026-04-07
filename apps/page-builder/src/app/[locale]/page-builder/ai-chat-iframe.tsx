"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { IPageStructure } from "@znode/types/visual-editor";

const CHAT_URL = process.env.NEXT_PUBLIC_PAGE_BUILDER_CHAT_URL || "http://localhost:4200";

/** postMessage type: page-builder → chat iframe */
const MSG_BUILDER_SYNC_PAGE = "PAGE_BUILDER_SYNC_PAGE";
/** postMessage type: chat iframe → page-builder (final update) */
const MSG_CHAT_PAGE_UPDATE = "CHAT_PAGE_UPDATE";
/** postMessage type: chat iframe → page-builder (streaming partial update) */
const MSG_CHAT_PAGE_STREAMING_UPDATE = "CHAT_PAGE_STREAMING_UPDATE";

function resolveChatOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

/* ── Animated AI "building" indicator ────────────────── */

function AiBuildingIndicator() {
  return (
    <div style={buildingIndicatorStyle}>
      <div style={buildingIconContainerStyle}>
        {/* Pulsing rings around the icon */}
        <span style={{ ...pulseRingStyle, animationDelay: "0s" }} />
        <span style={{ ...pulseRingStyle, animationDelay: "0.6s" }} />
        {/* Sparkle/wand SVG */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "relative", zIndex: 1, animation: "aiBuildSpin 3s linear infinite" }}
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <span style={buildingLabelStyle}>AI Building…</span>
      {/* Keyframe animations */}
      <style>{`
        @keyframes aiBuildPulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes aiBuildSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const buildingIndicatorStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 18px 10px 12px",
  cursor: "default",
};

const buildingIconContainerStyle: CSSProperties = {
  position: "relative",
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const pulseRingStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  border: "2px solid rgba(16,185,129,0.5)",
  animation: "aiBuildPulse 1.6s ease-out infinite",
};

const buildingLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#fff",
  letterSpacing: "0.02em",
  whiteSpace: "nowrap",
};

/* ── Main component ─────────────────────────────────── */

export interface AiChatIframeProps {
  /** Current page structure from the visual editor — kept in sync with the AI chat. */
  page?: IPageStructure;
  /** Called when the AI chat produces an updated page structure (final). */
  onPageUpdate?: (page: IPageStructure) => void;
  /** Called during streaming — partial page updates as the LLM generates widgets. */
  onStreamingPageUpdate?: (page: IPageStructure) => void;
}

export function AiChatIframe({ page, onPageUpdate, onStreamingPageUpdate }: AiChatIframeProps) {
  /** Whether the chat popup is visible (open). */
  const [open, setOpen] = useState(false);
  /** Whether the iframe has ever been opened (controls first mount). */
  const [mounted, setMounted] = useState(false);
  /** When true the LLM is actively streaming — minimize to a compact indicator. */
  const [streaming, setStreaming] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatOrigin = resolveChatOrigin(CHAT_URL);

  // On first open, mount the iframe (kept alive forever after).
  const handleOpen = useCallback(() => {
    if (!mounted) setMounted(true);
    setOpen(true);
  }, [mounted]);

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

      // Final page update (after streaming completes or non-streaming flow)
      if (event.data?.type === MSG_CHAT_PAGE_UPDATE) {
        const updatedPage = event.data?.page as IPageStructure | undefined;
        if (updatedPage && typeof updatedPage === "object") {
          onPageUpdate?.(updatedPage);
        }
        // Streaming finished — restore normal chat panel
        setStreaming(false);
        return;
      }

      // Streaming partial page update (widgets appearing one by one)
      if (event.data?.type === MSG_CHAT_PAGE_STREAMING_UPDATE) {
        const partialPage = event.data?.page as IPageStructure | undefined;
        if (partialPage && typeof partialPage === "object") {
          // Enter streaming mode on first partial update
          setStreaming(true);
          onStreamingPageUpdate?.(partialPage);
        }
        return;
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [chatOrigin, onPageUpdate, onStreamingPageUpdate]);

  // When streaming starts, auto-minimize; when it ends, auto-restore.
  // The user can still click the minimized indicator to re-open the full chat.
  const showFullChat = open && !streaming;
  const showMinimized = streaming;

  return (
    <>
      {/* FAB button — hidden when chat is open or streaming is active */}
      <button
        type="button"
        onClick={handleOpen}
        style={{
          ...fabStyle,
          transform: open || streaming ? "scale(0)" : "scale(1)",
          pointerEvents: open || streaming ? "none" : "auto",
        }}
        aria-label="Open Page Builder AI Chat"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Backdrop — only when chat is fully open (not during streaming) */}
      {showFullChat && <div style={backdropStyle} onClick={() => setOpen(false)} />}

      {/* Minimized "AI Building" pill — shown during streaming */}
      {showMinimized && (
        <button
          type="button"
          onClick={handleOpen}
          style={minimizedPillStyle}
          aria-label="AI is building your page — click to open chat"
        >
          <AiBuildingIndicator />
        </button>
      )}

      {/* Full chat popup */}
      <div
        style={{
          ...popupStyle,
          transform: showFullChat ? "scale(1)" : "scale(0.9)",
          opacity: showFullChat ? 1 : 0,
          pointerEvents: showFullChat ? "auto" : "none",
        }}
      >
        {/* Close button */}
        <button type="button" onClick={() => setOpen(false)} style={closeBtnStyle} aria-label="Close chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/*
          Iframe is rendered once and kept alive to preserve chat context.
          When not visible, it's hidden via display:none instead of unmounting.
        */}
        {mounted && (
          <iframe
            ref={iframeRef}
            src={`${CHAT_URL}/`}
            title="Page Builder AI Chat"
            style={{
              ...iframeStyle,
              display: showFullChat ? "block" : "none",
            }}
            allow="clipboard-read; clipboard-write"
          />
        )}
      </div>
    </>
  );
}

/* ── Styles ──────────────────────────────────────────── */

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

/** Minimized pill that floats in the bottom-right during streaming. */
const minimizedPillStyle: CSSProperties = {
  position: "fixed",
  bottom: 28,
  right: 28,
  border: "none",
  borderRadius: 24,
  background: "linear-gradient(135deg, #10b981, #059669)",
  boxShadow: "0 4px 20px rgba(16,185,129,0.45)",
  zIndex: 10002,
  cursor: "pointer",
  transition: "transform 0.2s ease",
};

const iframeStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  border: "none",
};
