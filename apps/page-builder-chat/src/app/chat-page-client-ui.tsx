"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const INITIAL_PAGE = {
  key: "category/{}",
  data: {
    content: [] as unknown[],
    root: { props: {} } as Record<string, unknown>,
  },
};

const DEFAULT_SAMPLE_NDJSON = [
  JSON.stringify({
    kind: "merge_root_props",
    target: "main",
    props: { title: "Default sample page" },
  }),
  JSON.stringify({
    kind: "append_component",
    target: "main",
    componentType: "Heading",
    props: {
      align: "left",
      text: "Section heading",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      padding: { top: "0", right: "0", bottom: "0", left: "0" },
      border: { width: "0", color: "black", style: "solid" as const, borderRadius: 0 },
      size: "xl",
      background: "transparent",
      textColor: "black",
      level: "2",
    },
    id: "heading-default-sample",
  }),
  JSON.stringify({
    kind: "append_component",
    target: "main",
    componentType: "Text",
    props: {
      align: "left",
      text: "Paragraph text — matches base Text widget defaults.",
      padding: { top: "0", right: "0", bottom: "0", left: "0" },
      size: "m",
      color: "default",
      weight: "normal",
    },
    id: "text-default-sample",
  }),
  JSON.stringify({
    kind: "append_component",
    target: "main",
    componentType: "VerticalSpacing",
    props: { size: "32px" },
    id: "vsp-default-sample",
  }),
  JSON.stringify({
    kind: "append_component",
    target: "main",
    componentType: "ButtonGroup",
    props: {
      align: "left",
      buttons: [
        { label: "Primary", href: "#", variant: "primary" as const, target: "_self" as const },
        { label: "Secondary", href: "#", variant: "secondary" as const, target: "_self" as const },
      ],
    },
    id: "bg-default-sample",
  }),
  JSON.stringify({
    kind: "append_component",
    target: "main",
    componentType: "Container",
    props: {
      align: "center",
      layout: "standard",
      flexProperties: {
        flexDirection: "column",
        rowAlignment: { justifyContent: "flex-start", alignItems: "flex-start" },
        columnAlignment: { alignItems: "flex-start", justifyContent: "flex-start" },
        flexWrap: "nowrap",
        gap: 16,
      },
      rigidView: "no",
      maxWidth: 1200,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      padding: { top: "24", right: "24", bottom: "24", left: "24" },
      border: { width: "0", color: "black", borderClass: "solid" as const, borderRadius: 0 },
      height: "auto",
      image: {
        src: "",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      },
    },
    id: "container-default-sample",
  }),
].join("\n");

const PUBLISH_PREVIEW_DEFAULTS = {
  pageCode: "Home",
  portalCode: "MaxwellsHardware",
  profileCode: ["AllProfiles"],
} as const;

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

type BannerSliderChoice = { masterWidgetKey: string; cmsSliderId: number; label: string };

type ProductCarouselPickerPayload = {
  widgetsKey: string;
  masterWidgetKey: string;
  displayName: string;
  products: { sku: string; name: string }[];
  pageIndex: number;
  pageSize: number;
  hasMore: boolean;
  updateComponentId?: string;
};

type ProductCarouselUiState = ProductCarouselPickerPayload & { selectedSkus: string[] };

function mergeProductCarouselPicker(prev: ProductCarouselUiState | null, incoming: ProductCarouselPickerPayload): ProductCarouselUiState {
  const updateId = incoming.updateComponentId ?? prev?.updateComponentId;
  if (prev && prev.widgetsKey === incoming.widgetsKey && incoming.pageIndex > 1) {
    const seen = new Set(prev.products.map((x) => x.sku));
    const add = incoming.products.filter((x) => !seen.has(x.sku));
    return {
      ...incoming,
      products: [...prev.products, ...add],
      selectedSkus: prev.selectedSkus,
      ...(updateId ? { updateComponentId: updateId } : {}),
    };
  }
  return { ...incoming, selectedSkus: [], ...(updateId ? { updateComponentId: updateId } : {}) };
}

type ChatApiJson = {
  error?: string;
  assistantContent?: string | null;
  page?: typeof INITIAL_PAGE;
  errors?: { commandIndex: number; message: string }[];
  applied?: number;
  toolArgumentsParsed?: { commands: unknown[] }[];
  bannerSliderChoices?: BannerSliderChoice[];
  bannerSliderUpdateComponentId?: string;
  productCarouselPicker?: ProductCarouselPickerPayload;
};

function pageFromApiPayload(raw: unknown): typeof INITIAL_PAGE | null {
  if (raw === null || raw === undefined || typeof raw !== "object") return null;
  try {
    return JSON.parse(JSON.stringify(raw)) as typeof INITIAL_PAGE;
  } catch {
    return null;
  }
}

function commandsToNdjson(commands: unknown[] | undefined): string | null {
  if (!commands?.length) return null;
  return commands.map((c) => JSON.stringify(c)).join("\n");
}

function formatChatAssistantReply(
  assistantContent: string | null | undefined,
  applied: number | undefined,
  errors: { commandIndex: number; message: string }[] | undefined
): string {
  const extra = errors && errors.length > 0 ? `\n\nCommand issues:\n${errors.map((e) => `- #${e.commandIndex}: ${e.message}`).join("\n")}` : "";
  const main = (assistantContent ?? "").trim();
  const appliedCount = applied ?? 0;
  const changesLine = appliedCount > 0 ? "\n\nChanges applied" : "";
  if (main) return main + changesLine + extra;
  if (appliedCount > 0) return "Changes applied" + extra;
  return "(no text)" + extra;
}

export interface ChatPageClientProps {
  chatPanelEnabled: boolean;
  plainTextEnabled: boolean;
  openAiReady: boolean;
  ollamaConfigured: boolean;
  onClose?: () => void;
}

/* ── SVG Logo component ─────────────────────────────── */

function ZnodeLogo({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: "#f0fdf4",
        border: "1.5px solid #bbf7d0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: size * 0.38, fontWeight: 800, color: "#16a34a", letterSpacing: -0.5 }}>zn0d</span>
    </div>
  );
}

/* ── Typing indicator ────────────────────────────────── */

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.5,
            animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes typingBounce { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-6px);opacity:1} }`}</style>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */

export function ChatPageClientUI({ chatPanelEnabled, plainTextEnabled, openAiReady, ollamaConfigured, onClose }: ChatPageClientProps) {
  const [page, setPage] = useState(INITIAL_PAGE);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content:
        "Hi! I'm your **Znode Page Builder AI**. I'll help you build pages faster. I can add and configure:\n\n" +
        "\u2022 Banner Slider\n\u2022 Text Widget\n\u2022 Homepage Banner\n\n" +
        "What would you like to build today?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [, setCommandsInput] = useState(DEFAULT_SAMPLE_NDJSON);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [bannerSliderChoices, setBannerSliderChoices] = useState<BannerSliderChoice[] | null>(null);
  const [bannerSliderUpdateComponentId, setBannerSliderUpdateComponentId] = useState<string | null>(null);
  const [productCarousel, setProductCarousel] = useState<ProductCarouselUiState | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; name: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const pushAssistant = useCallback((content: string) => {
    setMessages((m) => [...m, { role: "assistant", content }]);
  }, []);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      setLastError("Unsupported image type. Use PNG, JPEG, GIF, or WebP.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setLastError("Image too large (max 20 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] ?? "";
      setSelectedImage({ base64, mimeType: file.type, name: file.name });
      setLastError(null);
    };
    reader.onerror = () => setLastError("Failed to read image file.");
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const sendImageForAnalysis = useCallback(async () => {
    if (!selectedImage || loading) return;
    setLastError(null);
    setBannerSliderChoices(null);
    setBannerSliderUpdateComponentId(null);
    setProductCarousel(null);
    const userMsg = chatInput.trim();
    setMessages((m) => [
      ...m,
      { role: "user", content: `[image] ${selectedImage.name}${userMsg ? `\n${userMsg}` : ""}` },
    ]);
    setChatInput("");
    setLoading(true);
    const imgPayload = selectedImage;
    setSelectedImage(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          imageBase64: imgPayload.base64,
          imageMimeType: imgPayload.mimeType,
          message: userMsg || undefined,
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      const nextPage = pageFromApiPayload(data.page);
      if (nextPage !== null) setPage(nextPage);
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) setCommandsInput(appliedNdjson);
      if (data.bannerSliderChoices?.length) {
        setBannerSliderChoices(data.bannerSliderChoices);
        setBannerSliderUpdateComponentId(data.bannerSliderUpdateComponentId ?? null);
      }
      if (data.productCarouselPicker) {
        setProductCarousel((prev) => mergeProductCarouselPicker(prev, data.productCarouselPicker!));
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [selectedImage, loading, chatInput, page, pushAssistant]);

  const publishToPreview = useCallback(async () => {
    setPublishLoading(true);
    setPublishStatus(null);
    try {
      const pageJson = JSON.stringify(page, null, 2);
      const res = await fetch("/api/publish-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageCode: PUBLISH_PREVIEW_DEFAULTS.pageCode,
          portalCode: PUBLISH_PREVIEW_DEFAULTS.portalCode,
          profileCode: [...PUBLISH_PREVIEW_DEFAULTS.profileCode],
          pageJson,
        }),
        cache: "no-store",
      });
      const text = await res.text();
      if (!res.ok) {
        setPublishStatus(`Failed (${res.status}): ${text.slice(0, 600)}`);
      } else {
        setPublishStatus(`Success (${res.status}). ${text.slice(0, 400)}`);
      }
    } catch (e) {
      setPublishStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setPublishLoading(false);
    }
  }, [page]);

  const pickBannerSlider = async (c: BannerSliderChoice) => {
    if (loading) return;
    const updateTargetId = bannerSliderUpdateComponentId;
    setBannerSliderChoices(null);
    setBannerSliderUpdateComponentId(null);
    setProductCarousel(null);
    setLastError(null);
    setMessages((m) => [...m, { role: "user", content: `[banner slider] ${c.label}` }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          selectBannerSliderKey: c.masterWidgetKey,
          selectBannerSliderLabel: c.label,
          selectBannerSliderCmsSliderId: c.cmsSliderId,
          ...(updateTargetId ? { updateBannerSliderComponentId: updateTargetId } : {}),
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      const nextPage = pageFromApiPayload(data.page);
      if (nextPage !== null) setPage(nextPage);
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) setCommandsInput(appliedNdjson);
      if (data.bannerSliderChoices?.length) {
        setBannerSliderChoices(data.bannerSliderChoices);
        setBannerSliderUpdateComponentId(data.bannerSliderUpdateComponentId ?? null);
      } else {
        setBannerSliderChoices(null);
        setBannerSliderUpdateComponentId(null);
      }
      if (data.productCarouselPicker) {
        setProductCarousel((prev) => mergeProductCarouselPicker(prev, data.productCarouselPicker!));
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductCarouselSku = useCallback((sku: string) => {
    setProductCarousel((prev) => {
      if (!prev) return prev;
      const on = prev.selectedSkus.includes(sku);
      return { ...prev, selectedSkus: on ? prev.selectedSkus.filter((s) => s !== sku) : [...prev.selectedSkus, sku] };
    });
  }, []);

  const loadMoreProductCarousel = useCallback(async () => {
    if (loading || !productCarousel?.hasMore) return;
    setLastError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          productCarouselLoadMore: { widgetsKey: productCarousel.widgetsKey, pageIndex: productCarousel.pageIndex + 1 },
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      if (data.productCarouselPicker) {
        setProductCarousel((prev) => mergeProductCarouselPicker(prev, data.productCarouselPicker!));
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [loading, page, productCarousel, pushAssistant]);

  const confirmProductCarousel = useCallback(async () => {
    if (loading || !productCarousel || productCarousel.selectedSkus.length === 0) return;
    const { widgetsKey, selectedSkus, updateComponentId } = productCarousel;
    const count = selectedSkus.length;
    setLastError(null);
    setProductCarousel(null);
    setMessages((m) => [...m, { role: "user", content: `[products carousel] ${count} product(s)` }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          productCarouselConfirm: { widgetsKey, skus: selectedSkus, ...(updateComponentId ? { updateComponentId } : {}) },
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      const nextPage = pageFromApiPayload(data.page);
      if (nextPage !== null) setPage(nextPage);
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) setCommandsInput(appliedNdjson);
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [loading, page, productCarousel, pushAssistant]);

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || loading) return;
    setLastError(null);
    setBannerSliderChoices(null);
    setBannerSliderUpdateComponentId(null);
    setProductCarousel(null);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setChatInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, message: text, useCommandsOnly: false }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      const nextPage = pageFromApiPayload(data.page);
      if (nextPage !== null) setPage(nextPage);
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) setCommandsInput(appliedNdjson);
      if (data.bannerSliderChoices?.length) {
        setBannerSliderChoices(data.bannerSliderChoices);
        setBannerSliderUpdateComponentId(data.bannerSliderUpdateComponentId ?? null);
      } else {
        setBannerSliderChoices(null);
        setBannerSliderUpdateComponentId(null);
      }
      if (data.productCarouselPicker) {
        setProductCarousel((prev) => mergeProductCarouselPicker(prev, data.productCarouselPicker!));
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div style={styles.chatContainer}>
      {/* ── Header ──────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <ZnodeLogo size={40} />
          <div>
            <div style={styles.headerTitle}>Page Builder AI</div>
            <div style={styles.headerSubtitle}>Znode Smart Assistant</div>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() => void publishToPreview()}
            disabled={publishLoading}
            style={{
              ...styles.headerBtn,
              opacity: publishLoading ? 0.6 : 1,
              cursor: publishLoading ? "wait" : "pointer",
            }}
            title="Publish to preview"
          >
            {publishLoading ? (
              <span style={{ fontSize: 14 }}>...</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            )}
          </button>
          {onClose && (
            <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close" title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

        {/* ── Status bar ─────────────────────────────── */}
        <div style={styles.statusBar}>
          <span style={styles.statusDot} />
          AI Active &mdash; Page Builder Ready
        </div>

        {publishStatus && (
          <div
            style={{
              padding: "8px 16px",
              fontSize: "0.78rem",
              background: publishStatus.startsWith("Success") ? "#f0fdf4" : "#fef2f2",
              color: publishStatus.startsWith("Success") ? "#166534" : "#991b1b",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {publishStatus}
          </div>
        )}

        {/* ── Messages area ──────────────────────────── */}
        <div style={styles.messagesArea}>
          {messages.map((msg, i) =>
            msg.role === "user" ? (
              <div key={i} style={styles.userRow}>
                <div style={styles.userBubble}>{msg.content}</div>
              </div>
            ) : (
              <div key={i} style={styles.assistantRow}>
                <ZnodeLogo size={32} />
                <div style={styles.assistantBubble}>
                  <div style={styles.assistantLabel}>ZNODE PAGE BUILDER AI</div>
                  <div style={styles.assistantText}>
                    {msg.content.split("\n").map((line, li) => (
                      <div key={li} style={{ marginTop: li > 0 && line.trim() === "" ? 8 : 0 }}>
                        {renderMarkdown(line)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}

          {loading && (
            <div style={styles.assistantRow}>
              <ZnodeLogo size={32} />
              <div style={styles.assistantBubble}>
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Error bar ──────────────────────────────── */}
        {lastError && (
          <div style={styles.errorBar}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {lastError}
          </div>
        )}

        {/* ── Banner slider chips ────────────────────── */}
        {bannerSliderChoices && bannerSliderChoices.length > 0 && (
          <div style={styles.pickerPanel}>
            <div style={styles.pickerTitle}>Choose a Banner Slider</div>
            <div style={styles.chipRow}>
              {bannerSliderChoices.map((c, i) => (
                <button
                  key={`${i}-${c.masterWidgetKey}-${c.cmsSliderId}`}
                  type="button"
                  disabled={loading}
                  onClick={() => void pickBannerSlider(c)}
                  style={styles.chip}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Product carousel picker ────────────────── */}
        {productCarousel !== null && (
          <div style={{ ...styles.pickerPanel, maxHeight: 260, overflowY: "auto" }}>
            <div style={styles.pickerTitle}>Select Products for Carousel</div>
            {productCarousel.products.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>No unassociated products for this widget key.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {productCarousel.products.map((p) => (
                  <label key={p.sku} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      disabled={loading}
                      checked={productCarousel.selectedSkus.includes(p.sku)}
                      onChange={() => toggleProductCarouselSku(p.sku)}
                      style={styles.checkbox}
                    />
                    <span>
                      {p.name}
                      <span style={{ display: "block", fontSize: "0.72rem", color: "var(--muted)" }}>{p.sku}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            <div style={{ ...styles.chipRow, marginTop: 12 }}>
              <button type="button" disabled={loading || !productCarousel.hasMore} onClick={() => void loadMoreProductCarousel()} style={styles.chip}>
                Show more
              </button>
              <button
                type="button"
                disabled={loading || productCarousel.selectedSkus.length === 0}
                onClick={() => void confirmProductCarousel()}
                style={{ ...styles.chip, background: "var(--accent)", color: "#fff", border: "none" }}
              >
                Add carousel
              </button>
            </div>
          </div>
        )}

        {/* ── Input area ─────────────────────────────── */}
        {chatPanelEnabled ? (
          <div style={styles.inputArea}>
            {selectedImage && (
              <div style={styles.imagePreview}>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Image: <strong>{selectedImage.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  style={styles.imagePreviewRemove}
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => void sendImageForAnalysis()}
                  disabled={loading}
                  style={{
                    ...styles.imagePreviewAnalyze,
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  {loading ? "Analyzing\u2026" : "Analyze image"}
                </button>
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />
            <div style={styles.inputRow}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={selectedImage ? "Describe what to build from this image\u2026" : "Type your message..."}
                style={styles.textInput}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (selectedImage) {
                      void sendImageForAnalysis();
                    } else {
                      void sendChat();
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={loading}
                title="Upload page screenshot for AI analysis"
                style={{
                  ...styles.imageBtn,
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? "default" : "pointer",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedImage) {
                    void sendImageForAnalysis();
                  } else {
                    void sendChat();
                  }
                }}
                disabled={loading || (!chatInput.trim() && !selectedImage)}
                style={{
                  ...styles.sendBtn,
                  opacity: loading || (!chatInput.trim() && !selectedImage) ? 0.5 : 1,
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <div style={styles.inputHint}>
              Try: <strong>add banner slider</strong>, <strong>add text</strong>, <strong>set title</strong>, or upload an image to auto-detect widgets
            </div>
          </div>
        ) : (
          <div style={styles.inputArea}>
            <div style={styles.disabledNotice}>
              Chat is currently off. Enable <strong>plain text</strong> mode, or configure <strong>Ollama</strong> / <strong>OpenAI</strong> to get started.
            </div>
          </div>
        )}
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles: Record<string, CSSProperties> = {
  chatContainer: {
    width: 420,
    maxWidth: "100%",
    height: "100%",
    maxHeight: "100%",
    borderRadius: 16,
    background: "var(--panel)",
    boxShadow: "var(--shadow)",
    border: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    background: "#fafbfc",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "var(--text)",
    lineHeight: 1.2,
  },
  headerSubtitle: {
    fontSize: "0.78rem",
    color: "var(--muted)",
    marginTop: 1,
  },
  headerActions: {
    display: "flex",
    gap: 6,
  },
  headerBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "#fff",
    color: "var(--muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "#fff",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
  },

  statusBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: "#f0fdf4",
    borderBottom: "2px solid #86efac",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#166534",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22c55e",
    flexShrink: 0,
  },

  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minHeight: 200,
  },

  userRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  userBubble: {
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: "14px 14px 4px 14px",
    background: "var(--user-bubble)",
    color: "var(--user-bubble-text)",
    fontSize: "0.88rem",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap" as const,
  },

  assistantRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  assistantBubble: {
    maxWidth: "85%",
    padding: "12px 14px",
    borderRadius: "14px 14px 14px 4px",
    background: "#f8fafc",
    border: "1px solid var(--border)",
    fontSize: "0.88rem",
    lineHeight: 1.6,
  },
  assistantLabel: {
    fontSize: "0.68rem",
    fontWeight: 700,
    color: "var(--accent)",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    marginBottom: 6,
  },
  assistantText: {
    color: "var(--text)",
    whiteSpace: "pre-wrap" as const,
  },

  errorBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: "#fef2f2",
    borderTop: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: "0.82rem",
  },

  pickerPanel: {
    padding: "12px 16px",
    borderTop: "1px solid var(--border)",
    background: "#fafbfc",
  },
  pickerTitle: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 10,
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 8,
  },
  chip: {
    padding: "7px 14px",
    borderRadius: 20,
    border: "1.5px solid var(--accent)",
    background: "#f0fdf4",
    color: "var(--accent-dark)",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  checkbox: {
    marginTop: 3,
    accentColor: "var(--accent)",
  },

  inputArea: {
    padding: "12px 16px 14px",
    borderTop: "1px solid var(--border)",
    background: "#fafbfc",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 24,
    border: "1.5px solid var(--border)",
    background: "#fff",
    color: "var(--text)",
    fontSize: "0.88rem",
    outline: "none",
    transition: "border-color 0.15s",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  imageBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1.5px solid var(--border)",
    background: "#fff",
    color: "var(--muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "border-color 0.15s, color 0.15s",
  },
  imagePreview: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    padding: "6px 12px",
    borderRadius: 10,
    border: "1.5px solid var(--accent)",
    background: "#f0fdf4",
    fontSize: "0.82rem",
  },
  imagePreviewRemove: {
    padding: "2px 8px",
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
    fontSize: "0.75rem",
    flexShrink: 0,
  },
  imagePreviewAnalyze: {
    padding: "4px 12px",
    borderRadius: 8,
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.8rem",
    flexShrink: 0,
  },
  inputHint: {
    fontSize: "0.72rem",
    color: "var(--muted)",
    marginTop: 8,
    paddingLeft: 4,
  },

  disabledNotice: {
    fontSize: "0.85rem",
    color: "var(--muted)",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px dashed var(--border)",
    background: "#fff",
    textAlign: "center" as const,
  },
};
