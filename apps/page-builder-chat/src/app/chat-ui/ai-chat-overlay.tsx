"use client";

import { useRef, useEffect } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import {
  useChatEngine,
  type PageState,
  type BannerSliderChoice,
  type ProductCarouselUiState,
} from "./use-chat-engine";

export interface AiChatBotProps {
  open: boolean;
  onClose: () => void;
  page: PageState;
  onPageChange: (page: PageState) => void;
}

export function AiChatBot({ open, onClose, page, onPageChange }: Readonly<AiChatBotProps>) {
  const {
    messages,
    chatInput,
    setChatInput,
    loading,
    lastError,
    bannerSliderChoices,
    productCarousel,
    publishLoading,
    sendChat,
    pickBannerSlider,
    toggleProductCarouselSku,
    loadMoreProductCarousel,
    confirmProductCarousel,
  } = useChatEngine({
    page,
    onPageChange,
    welcomeMessage:
      "Hi! I'm your AI assistant. How can I help you build your page?\n\nTry: add banner slider, add products, set title ..., add text ..., or help.",
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendChat();
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
        {/* Header */}
        <div style={panelHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...headerDotStyle, background: publishLoading ? "#f59e0b" : "#22c55e" }} />
            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>AI Assistant</span>
            {publishLoading && <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Publishing...</span>}
          </div>
          <button type="button" onClick={onClose} style={closeButtonStyle} aria-label="Close chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
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

        {/* Error */}
        {lastError && (
          <div style={errorBarStyle}>
            {lastError}
          </div>
        )}

        {/* Banner slider choices */}
        {bannerSliderChoices && bannerSliderChoices.length > 0 && (
          <BannerSliderSection choices={bannerSliderChoices} loading={loading} onPick={(c) => void pickBannerSlider(c)} />
        )}

        {/* Product carousel picker */}
        {productCarousel && (
          <ProductCarouselSection
            carousel={productCarousel}
            loading={loading}
            onToggleSku={toggleProductCarouselSku}
            onLoadMore={() => void loadMoreProductCarousel()}
            onConfirm={() => void confirmProductCarousel()}
          />
        )}

        {/* Input */}
        <div style={inputBarStyle}>
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            disabled={loading}
            style={textareaStyle}
          />
          <button
            type="button"
            onClick={() => void sendChat()}
            disabled={loading || !chatInput.trim()}
            style={{
              ...sendButtonStyle,
              opacity: loading || !chatInput.trim() ? 0.5 : 1,
              cursor: loading || !chatInput.trim() ? "default" : "pointer",
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

/* ── Sub-components ──────────────────────────────────── */

function BannerSliderSection({
  choices,
  loading,
  onPick,
}: Readonly<{
  choices: BannerSliderChoice[];
  loading: boolean;
  onPick: (c: BannerSliderChoice) => void;
}>) {
  return (
    <div style={pickerSectionStyle}>
      <div style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 8, color: "#334155" }}>
        Banner slider &mdash; choose one
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {choices.map((c, i) => (
          <button
            key={`${i}-${c.masterWidgetKey}-${c.cmsSliderId}`}
            type="button"
            disabled={loading}
            onClick={() => onPick(c)}
            style={{
              ...chipStyle,
              borderColor: "#3b82f6",
              color: "#3b82f6",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductCarouselSection({
  carousel,
  loading,
  onToggleSku,
  onLoadMore,
  onConfirm,
}: Readonly<{
  carousel: ProductCarouselUiState;
  loading: boolean;
  onToggleSku: (sku: string) => void;
  onLoadMore: () => void;
  onConfirm: () => void;
}>) {
  return (
    <div style={{ ...pickerSectionStyle, maxHeight: 220, overflowY: "auto" }}>
      <div style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 8, color: "#334155" }}>
        Products carousel &mdash; select products
      </div>
      {carousel.products.length === 0 ? (
        <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>No unassociated products for this widget key.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {carousel.products.map((p) => (
            <label
              key={p.sku}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                cursor: loading ? "default" : "pointer",
                fontSize: "0.82rem",
              }}
            >
              <input
                type="checkbox"
                disabled={loading}
                checked={carousel.selectedSkus.includes(p.sku)}
                onChange={() => onToggleSku(p.sku)}
                style={{ marginTop: 2 }}
              />
              <span>
                {p.name}
                <span style={{ display: "block", fontSize: "0.7rem", color: "#94a3b8" }}>{p.sku}</span>
              </span>
            </label>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        <button
          type="button"
          disabled={loading || !carousel.hasMore}
          onClick={onLoadMore}
          style={{
            ...chipStyle,
            borderColor: "#3b82f6",
            cursor: loading || !carousel.hasMore ? "default" : "pointer",
            opacity: loading || !carousel.hasMore ? 0.5 : 1,
          }}
        >
          Show more
        </button>
        <button
          type="button"
          disabled={loading || carousel.selectedSkus.length === 0}
          onClick={onConfirm}
          style={{
            ...chipStyle,
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            cursor: loading || carousel.selectedSkus.length === 0 ? "default" : "pointer",
            opacity: loading || carousel.selectedSkus.length === 0 ? 0.5 : 1,
          }}
        >
          Add carousel ({carousel.selectedSkus.length})
        </button>
      </div>
    </div>
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
  height: "70vh",
  maxHeight: 700,
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

const errorBarStyle: CSSProperties = {
  padding: "8px 16px",
  color: "#f87171",
  fontSize: "0.8rem",
  borderTop: "1px solid #fecaca",
  background: "#fef2f2",
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

const pickerSectionStyle: CSSProperties = {
  padding: "10px 16px",
  borderTop: "1px solid #e5e7eb",
  background: "#f8fafc",
};

const chipStyle: CSSProperties = {
  padding: "5px 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#fff",
  fontSize: "0.78rem",
  cursor: "pointer",
};
