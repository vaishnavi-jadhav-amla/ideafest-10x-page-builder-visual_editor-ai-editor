"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export interface AiChatBotProps {
  open: boolean;
  onClose: () => void;
}

export function AiChatBot({ open, onClose }: Readonly<AiChatBotProps>) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: "Hi! I'm your AI assistant. How can I help you build your page?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, useCommandsOnly: false }),
        cache: "no-store",
      });
      const data = await res.json();
      const reply = data.assistantContent || data.error || "No response received.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err instanceof Error ? err.message : String(err)}` }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <>
      {open && <button type="button" onClick={onClose} style={backdropStyle} aria-label="Close chat overlay" />}

      <div
        style={{
          ...panelStyle,
          transform: open ? "translateY(0)" : "translateY(100%)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div style={panelHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={headerDotStyle} />
            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>AI Assistant</span>
          </div>
          <button type="button" onClick={onClose} style={closeButtonStyle} aria-label="Close chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={messagesContainerStyle}>
          {messages.map((msg, i) => (
            <div key={`${msg.role}-${i}-${msg.content.slice(0, 20)}`} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ ...bubbleBase, ...(msg.role === "user" ? userBubbleStyle : assistantBubbleStyle) }}>{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ ...bubbleBase, ...assistantBubbleStyle, color: "#94a3b8" }}>Thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={inputBarStyle}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            disabled={loading}
            style={textareaStyle}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              ...sendButtonStyle,
              opacity: loading || !input.trim() ? 0.5 : 1,
              cursor: loading || !input.trim() ? "default" : "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Styles ───────────────────────────────────────────── */

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
  bottom: 0,
  right: 0,
  width: 420,
  maxWidth: "100vw",
  height: "60vh",
  maxHeight: 600,
  background: "#fff",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 0,
  boxShadow: "0 -4px 40px rgba(0,0,0,0.18)",
  zIndex: 1002,
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
  overflow: "hidden",
};

const panelHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 18px",
  borderBottom: "1px solid #e5e7eb",
  background: "#f8fafc",
};

const headerDotStyle: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: "#22c55e",
  flexShrink: 0,
};

const closeButtonStyle: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#64748b",
  padding: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
};

const messagesContainerStyle: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const bubbleBase: CSSProperties = {
  maxWidth: "82%",
  padding: "10px 14px",
  borderRadius: 12,
  fontSize: "0.88rem",
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const userBubbleStyle: CSSProperties = {
  background: "#3b82f6",
  color: "#fff",
  borderBottomRightRadius: 4,
};

const assistantBubbleStyle: CSSProperties = {
  background: "#f1f5f9",
  color: "#1e293b",
  borderBottomLeftRadius: 4,
};

const inputBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: 8,
  padding: "12px 16px",
  borderTop: "1px solid #e5e7eb",
  background: "#fff",
};

const textareaStyle: CSSProperties = {
  flex: 1,
  resize: "none",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: "0.88rem",
  fontFamily: "inherit",
  outline: "none",
  color: "#1e293b",
  background: "#f9fafb",
  maxHeight: 120,
};

const sendButtonStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  border: "none",
  background: "#3b82f6",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
