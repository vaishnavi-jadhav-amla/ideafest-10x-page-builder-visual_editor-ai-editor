"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { ChatPageClientUI } from "../chat-page-client-ui";
import type { ChatPageClientProps } from "../chat-page-client-ui";

export function ChatPageClientButton(props: Readonly<ChatPageClientProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          ...fabStyle,
          transform: open ? "scale(0)" : "scale(1)",
        }}
        aria-label="Open Page Builder Chat"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </button>

      {open && <button type="button" onClick={() => setOpen(false)} style={backdropStyle} aria-label="Close Page Builder Chat" />}

      <div
        style={{
          ...panelStyle,
          transform: open ? "scale(1)" : "scale(0.95)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <ChatPageClientUI {...props} onClose={() => setOpen(false)} />
      </div>
    </>
  );
}

/* ── Styles ───────────────────────────────────────────── */

const fabStyle: CSSProperties = {
  position: "fixed",
  bottom: 28,
  right: 96,
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
  zIndex: 1000,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const backdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.25)",
  zIndex: 1001,
  border: "none",
  padding: 0,
  cursor: "default",
};

const panelStyle: CSSProperties = {
  position: "fixed",
  bottom: 96,
  right: 28,
  height: "min(640px, calc(100vh - 120px))",
  zIndex: 1002,
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease",
  overflow: "hidden",
  transformOrigin: "bottom right",
};
