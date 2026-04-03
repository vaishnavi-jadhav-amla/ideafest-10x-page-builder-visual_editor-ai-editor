"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { AiChatBot } from "./ai-chat-overlay";
import type { PageState } from "./use-chat-engine";

export interface AiChatButtonProps {
  page: PageState;
  onPageChange: (page: PageState) => void;
}

export function AiChatButton({ page, onPageChange }: Readonly<AiChatButtonProps>) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        style={{
          ...fabStyle,
          transform: chatOpen ? "scale(0)" : "scale(1)",
        }}
        aria-label="Open AI Assistant"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <AiChatBot open={chatOpen} onClose={() => setChatOpen(false)} page={page} onPageChange={onPageChange} />
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
  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 20px rgba(59,130,246,0.45)",
  zIndex: 1000,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};
