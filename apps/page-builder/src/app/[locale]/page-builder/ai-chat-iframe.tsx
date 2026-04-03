"use client";

import { useState, type CSSProperties } from "react";

const CHAT_URL = process.env.NEXT_PUBLIC_PAGE_BUILDER_CHAT_URL || "http://localhost:4200";

export function AiChatIframe() {
  const [open, setOpen] = useState(false);

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

        {open && <iframe src={`${CHAT_URL}/`} title="Page Builder AI Chat" style={iframeStyle} allow="clipboard-read; clipboard-write" />}
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
