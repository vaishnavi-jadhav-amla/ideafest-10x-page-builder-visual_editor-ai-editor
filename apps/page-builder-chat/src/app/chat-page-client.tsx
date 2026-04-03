"use client";

import type { CSSProperties } from "react";
import { useCallback, useRef, useState } from "react";

/** Same shape as sampleEmptyPageStructure — kept local so the client bundle does not pull agents/server code. */
const INITIAL_PAGE = {
  key: "category/{}",
  data: {
    content: [] as unknown[],
    root: { props: {} } as Record<string, unknown>,
  },
};

/** Puck keys from base-components-config (Container = Flex). */
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

const SAMPLE_NDJSON = `{"kind":"set_page_key","key":"category/{}"}
{"kind":"merge_root_props","target":"main","props":{"title":"Category listing"}}
{"kind":"append_component","target":"main","componentType":"ProductListPage","props":{"config":{"id":"category"}},"id":"ProductListPage-demo-001"}`;

const SAMPLE_JSON_ARRAY = `[
  {"kind":"set_page_key","key":"product/{}"},
  {"kind":"merge_root_props","target":"main","props":{"title":"Product details"}},
  {"kind":"append_component","target":"main","componentType":"ProductDetailsPage","props":{"config":{"id":"product"}},"id":"ProductDetailsPage-demo-001"}
]`;

const SAMPLE_APPEND_EMPTY = `{"kind":"append_component","target":"main","componentType":"EmptyBox","props":{},"id":"EmptyBox-demo-001"}`;

/** Defaults for visual-editor pages-publish-preview (override via request body if needed). */
const PUBLISH_PREVIEW_DEFAULTS = {
  pageCode: "Home",
  portalCode: "MaxwellsHardware",
  profileCode: ["AllProfiles"],
} as const;

function newWidgetId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Append one command; keeps JSON array valid, or appends an NDJSON line. */
function appendCommandLine(prev: string, cmd: Record<string, unknown>): string {
  const line = JSON.stringify(cmd);
  const t = prev.trim();
  if (!t) {
    return line;
  }
  if (t.startsWith("[")) {
    try {
      const arr = JSON.parse(t) as Record<string, unknown>[];
      if (!Array.isArray(arr)) {
        return `${t}\n${line}`;
      }
      return JSON.stringify([...arr, cmd], null, 2);
    } catch {
      return `${t}\n${line}`;
    }
  }
  return `${t}\n${line}`;
}

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

function mergeProductCarouselPicker(
  prev: ProductCarouselUiState | null,
  incoming: ProductCarouselPickerPayload
): ProductCarouselUiState {
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
  /** Next slider chip click updates this BannerSlider id instead of appending. */
  bannerSliderUpdateComponentId?: string;
  productCarouselPicker?: ProductCarouselPickerPayload;
};

/** Deep-clone page from API JSON so React always sees a new reference and nested updates are plain objects. */
function pageFromApiPayload(raw: unknown): typeof INITIAL_PAGE | null {
  if (raw === null || raw === undefined || typeof raw !== "object") {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(raw)) as typeof INITIAL_PAGE;
  } catch {
    return null;
  }
}

function commandsToNdjson(commands: unknown[] | undefined): string | null {
  if (!commands?.length) {
    return null;
  }
  return commands.map((c) => JSON.stringify(c)).join("\n");
}

function formatChatAssistantReply(
  assistantContent: string | null | undefined,
  applied: number | undefined,
  errors: { commandIndex: number; message: string }[] | undefined
): string {
  const extra =
    errors && errors.length > 0
      ? `\n\nCommand issues:\n${errors.map((e) => `- #${e.commandIndex}: ${e.message}`).join("\n")}`
      : "";
  const main = (assistantContent ?? "").trim();
  const appliedCount = applied ?? 0;
  const changesLine = appliedCount > 0 ? "\n\nChanges applied" : "";
  if (main) {
    return main + changesLine + extra;
  }
  if (appliedCount > 0) {
    return "Changes applied" + extra;
  }
  return "(no text)" + extra;
}

export interface ChatPageClientProps {
  chatPanelEnabled: boolean;
  plainTextEnabled: boolean;
  openAiReady: boolean;
  ollamaConfigured: boolean;
}

function buildWelcome(plainTextEnabled: boolean, openAiReady: boolean, ollamaConfigured: boolean): string {
  const engines: string[] = [];
  if (plainTextEnabled) {
    engines.push("**plain text** (local, no key)");
  }
  if (ollamaConfigured) {
    engines.push("**Ollama** (local LLM)");
  }
  if (openAiReady) {
    engines.push("**OpenAI**");
  }
  const engineLine =
    engines.length > 0 ? `Engines: ${engines.join(", ")}.` : "No chat engines enabled — use **Apply commands** only.";
  return `Hi. ${engineLine} Try: \`set title My store\` then Send, or type \`help\`. **Apply commands** below still works without any key. See /commands-reference.txt.`;
}

export function ChatPageClient({
  chatPanelEnabled,
  plainTextEnabled,
  openAiReady,
  ollamaConfigured,
}: ChatPageClientProps) {
  const [page, setPage] = useState(INITIAL_PAGE);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: "assistant", content: buildWelcome(plainTextEnabled, openAiReady, ollamaConfigured) },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [commandsInput, setCommandsInput] = useState(DEFAULT_SAMPLE_NDJSON);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [bannerSliderChoices, setBannerSliderChoices] = useState<BannerSliderChoice[] | null>(null);
  const [bannerSliderUpdateComponentId, setBannerSliderUpdateComponentId] = useState<string | null>(null);
  const [productCarousel, setProductCarousel] = useState<ProductCarouselUiState | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const pushAssistant = useCallback((content: string) => {
    setMessages((m) => [...m, { role: "assistant", content }]);
  }, []);

  const appendCmd = useCallback((cmd: Record<string, unknown>) => {
    setCommandsInput((prev) => appendCommandLine(prev, cmd));
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
      // Strip the data:...;base64, prefix
      const base64 = dataUrl.split(",")[1] ?? "";
      setSelectedImage({ base64, mimeType: file.type, name: file.name });
      setLastError(null);
    };
    reader.onerror = () => setLastError("Failed to read image file.");
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
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
    setMessages((m) => [
      ...m,
      {
        role: "user",
        content: `[banner slider] ${c.label}`,
      },
    ]);
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
      if (nextPage !== null) {
        setPage(nextPage);
      }
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) {
        setCommandsInput(appliedNdjson);
      }
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
      if (!prev) {
        return prev;
      }
      const on = prev.selectedSkus.includes(sku);
      return {
        ...prev,
        selectedSkus: on ? prev.selectedSkus.filter((s) => s !== sku) : [...prev.selectedSkus, sku],
      };
    });
  }, []);

  const loadMoreProductCarousel = useCallback(async () => {
    if (loading || !productCarousel?.hasMore) {
      return;
    }
    setLastError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          productCarouselLoadMore: {
            widgetsKey: productCarousel.widgetsKey,
            pageIndex: productCarousel.pageIndex + 1,
          },
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
    if (loading || !productCarousel || productCarousel.selectedSkus.length === 0) {
      return;
    }
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
          productCarouselConfirm: {
            widgetsKey,
            skus: selectedSkus,
            ...(updateComponentId ? { updateComponentId } : {}),
          },
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
      if (nextPage !== null) {
        setPage(nextPage);
      }
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) {
        setCommandsInput(appliedNdjson);
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
      if (nextPage !== null) {
        setPage(nextPage);
      }
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) {
        setCommandsInput(appliedNdjson);
      }
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

  const applyCommands = async () => {
    if (loading) return;
    setLastError(null);
    const text = commandsInput.trim();
    setMessages((m) => [...m, { role: "user", content: `[commands]\n${text}` }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          useCommandsOnly: true,
          commandsText: text,
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as {
        error?: string;
        assistantContent?: string;
        page?: typeof page;
        errors?: { commandIndex: number; message: string }[];
        applied?: number;
        toolArgumentsParsed?: { commands: unknown[] }[];
      };
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      const nextPage = pageFromApiPayload(data.page);
      if (nextPage !== null) {
        setPage(nextPage);
      }
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) {
        setCommandsInput(appliedNdjson);
      }
      pushAssistant(data.assistantContent ?? "Done.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--panel)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 600 }}>Page builder chat</h1>
        <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
          Uses workspace <code>next</code> from <code>node_modules</code>. Run:{" "}
          <code style={{ color: "var(--accent)" }}>npx nx dev page-builder-chat</code>
          {" · "}
          <a href="/commands-reference.txt" target="_blank" rel="noreferrer">
            commands-reference.txt (copy-paste samples at top)
          </a>
          {" · "}
          Chat: plain-text <strong>{plainTextEnabled ? "on" : "off"}</strong>, Ollama{" "}
          <strong>{ollamaConfigured ? "on" : "off"}</strong>, OpenAI <strong>{openAiReady ? "on" : "off"}</strong> (
          <code>.env.example</code>)
        </p>
      </header>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            borderRight: "1px solid var(--border)",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "92%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: msg.role === "user" ? "var(--user-bubble)" : "var(--assistant-bubble)",
                  border: "1px solid var(--border)",
                  fontSize: "0.9rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            ))}
          </div>

          {lastError && (
            <div style={{ padding: "0 16px", color: "var(--error)", fontSize: "0.85rem" }}>{lastError}</div>
          )}

          {bannerSliderChoices && bannerSliderChoices.length > 0 && (
            <div
              style={{
                padding: "10px 16px",
                borderTop: "1px solid var(--border)",
                background: "var(--bg)",
                fontSize: "0.8rem",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Banner slider — choose one</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {bannerSliderChoices.map((c, i) => (
                  <button
                    key={`${i}-${c.masterWidgetKey}-${c.cmsSliderId}`}
                    type="button"
                    disabled={loading}
                    onClick={() => void pickBannerSlider(c)}
                    style={{
                      ...chipButtonStyle,
                      maxWidth: "100%",
                      textAlign: "left",
                      borderColor: "var(--accent)",
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {productCarousel !== null && (
            <div
              style={{
                padding: "10px 16px",
                borderTop: "1px solid var(--border)",
                background: "var(--bg)",
                fontSize: "0.8rem",
                maxHeight: 280,
                overflowY: "auto",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Products carousel — select products</div>
              {productCarousel.products.length === 0 ? (
                <div style={{ color: "var(--muted)" }}>No unassociated products for this widget key.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {productCarousel.products.map((p) => (
                    <label
                      key={p.sku}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        cursor: loading ? "default" : "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        disabled={loading}
                        checked={productCarousel.selectedSkus.includes(p.sku)}
                        onChange={() => toggleProductCarouselSku(p.sku)}
                        style={{ marginTop: 2 }}
                      />
                      <span>
                        {p.name}
                        <span style={{ display: "block", fontSize: "0.7rem", color: "var(--muted)" }}>{p.sku}</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  disabled={loading || !productCarousel.hasMore}
                  onClick={() => void loadMoreProductCarousel()}
                  style={{ ...chipButtonStyle, borderColor: "var(--accent)" }}
                >
                  Show more
                </button>
                <button
                  type="button"
                  disabled={loading || productCarousel.selectedSkus.length === 0}
                  onClick={() => void confirmProductCarousel()}
                  style={{ ...chipButtonStyle, borderColor: "var(--accent)", color: "var(--accent)" }}
                >
                  Add carousel
                </button>
              </div>
            </div>
          )}

          <div style={{ padding: 16, borderTop: "1px solid var(--border)", background: "var(--panel)" }}>
            {chatPanelEnabled ? (
              <>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 8 }}>
                  Chat — try <code>add banner slider</code>, <code>add products</code> /{" "}
                  <code>add product carousel</code>, <code>set title …</code>, <code>add text …</code>,{" "}
                  <code>help</code>. Free-form uses Ollama/OpenAI when configured.
                  {" | "}Upload an image to auto-detect widgets.
                </div>
                {selectedImage && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--accent)",
                      background: "var(--bg)",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span style={{ flex: 1 }}>
                      Image: <strong>{selectedImage.name}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--text)",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      Remove
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
                <div style={{ display: "flex", gap: 8 }}>
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={selectedImage ? "Optional: describe what you want to build from this image…" : "e.g. set title Summer sale\nadd heading Welcome\nadd text Shop now."}
                    rows={2}
                    style={{
                      flex: 1,
                      resize: "vertical",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                    }}
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedImage) {
                          void sendImageForAnalysis();
                        } else {
                          void sendChat();
                        }
                      }}
                      disabled={loading}
                      style={{
                        padding: "0 16px",
                        borderRadius: 8,
                        border: "none",
                        background: "var(--accent)",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: loading ? "wait" : "pointer",
                        flex: 1,
                      }}
                    >
                      {loading ? "…" : selectedImage ? "Analyze" : "Send"}
                    </button>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={loading}
                      title="Upload page screenshot for AI analysis"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--bg)",
                        color: "var(--text)",
                        cursor: loading ? "default" : "pointer",
                        fontSize: "0.7rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Upload image
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--muted)",
                  marginBottom: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px dashed var(--border)",
                  background: "var(--bg)",
                }}
              >
                Chat is off: enable <strong>plain text</strong> (default), or set{" "}
                <code>PAGE_BUILDER_CHAT_OLLAMA_URL</code> / <code>OPENAI_API_KEY</code>. Otherwise use{" "}
                <strong>Apply commands</strong> below.
              </div>
            )}

            <div style={{ marginTop: 20, fontSize: "0.75rem", color: "var(--muted)" }}>
              Apply commands (no AI, no key) — NDJSON or JSON array
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setCommandsInput(DEFAULT_SAMPLE_NDJSON);
                  pushAssistant("Loaded **default** sample (Heading, Text, VerticalSpacing, ButtonGroup, Container + root title). Click Apply commands.");
                }}
                style={{ ...chipButtonStyle, borderColor: "var(--accent)", color: "var(--accent)" }}
              >
                Load default sample
              </button>
            </div>
            <div style={{ marginTop: 12, fontSize: "0.75rem", color: "var(--muted)" }}>
              Insert widget (appends one command — then Apply)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  appendCmd({
                    kind: "merge_root_props",
                    target: "main",
                    props: { title: "Page title" },
                  })
                }
                style={chipButtonStyle}
              >
                + Root title
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  appendCmd({
                    kind: "append_component",
                    target: "main",
                    componentType: "Text",
                    props: {
                      align: "left",
                      text: "New text block",
                      padding: { top: "0", right: "0", bottom: "0", left: "0" },
                      size: "m",
                      color: "default",
                      weight: "normal",
                    },
                    id: newWidgetId("Text"),
                  })
                }
                style={chipButtonStyle}
              >
                + Text
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  appendCmd({
                    kind: "append_component",
                    target: "main",
                    componentType: "Heading",
                    props: {
                      align: "left",
                      text: "New heading",
                      margin: { top: "0", right: "0", bottom: "0", left: "0" },
                      padding: { top: "0", right: "0", bottom: "0", left: "0" },
                      border: { width: "0", color: "black", style: "solid", borderRadius: 0 },
                      size: "l",
                      background: "transparent",
                      textColor: "black",
                      level: "2",
                    },
                    id: newWidgetId("Heading"),
                  })
                }
                style={chipButtonStyle}
              >
                + Heading
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  appendCmd({
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
                      padding: { top: "16", right: "16", bottom: "16", left: "16" },
                      border: { width: "0", color: "black", borderClass: "solid", borderRadius: 0 },
                      height: "auto",
                      image: {
                        src: "",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      },
                    },
                    id: newWidgetId("Container"),
                  })
                }
                style={chipButtonStyle}
              >
                + Container
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  appendCmd({
                    kind: "append_component",
                    target: "main",
                    componentType: "VerticalSpacing",
                    props: { size: "24px" },
                    id: newWidgetId("VerticalSpacing"),
                  })
                }
                style={chipButtonStyle}
              >
                + Vertical space
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  appendCmd({
                    kind: "append_component",
                    target: "main",
                    componentType: "ButtonGroup",
                    props: {
                      align: "left",
                      buttons: [
                        { label: "Button", href: "#", variant: "primary", target: "_self" },
                      ],
                    },
                    id: newWidgetId("ButtonGroup"),
                  })
                }
                style={chipButtonStyle}
              >
                + Button group
              </button>
            </div>
            <textarea
              value={commandsInput}
              onChange={(e) => setCommandsInput(e.target.value)}
              rows={8}
              spellCheck={false}
              style={{
                width: "100%",
                marginTop: 8,
                padding: 10,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.8rem",
              }}
              disabled={loading}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => setCommandsInput(SAMPLE_NDJSON)} style={chipButtonStyle}>
                Load sample: category PLP
              </button>
              <button type="button" onClick={() => setCommandsInput(SAMPLE_JSON_ARRAY)} style={chipButtonStyle}>
                Load sample: product PDP
              </button>
              <button type="button" onClick={() => setCommandsInput(SAMPLE_APPEND_EMPTY)} style={chipButtonStyle}>
                Load sample: EmptyBox only
              </button>
              <button
                type="button"
                onClick={() => void applyCommands()}
                disabled={loading}
                style={{
                  ...chipButtonStyle,
                  background: "var(--success)",
                  color: "#0f1419",
                  border: "none",
                  fontWeight: 600,
                }}
              >
                Apply commands
              </button>
              <button
                type="button"
                onClick={() => {
                  setPage(INITIAL_PAGE);
                  pushAssistant("Reset page JSON to empty template.");
                }}
                style={chipButtonStyle}
              >
                Reset page
              </button>
            </div>
          </div>
        </main>

        <aside
          style={{
            width: "42%",
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            background: "var(--panel)",
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: "0.85rem" }}>
            Live <code>page</code> JSON — Puck root title is <code>data.root.props.title</code> (not <code>key</code>)
          </div>
          <pre
            style={{
              flex: 1,
              margin: 0,
              padding: 16,
              overflow: "auto",
              fontSize: "0.72rem",
              lineHeight: 1.45,
            }}
          >
            {JSON.stringify(page, null, 2)}
          </pre>
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={() => void publishToPreview()}
              disabled={publishLoading}
              style={{
                ...chipButtonStyle,
                alignSelf: "flex-start",
                background: "var(--accent, #3b82f6)",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                opacity: publishLoading ? 0.7 : 1,
                cursor: publishLoading ? "wait" : "pointer",
              }}
            >
              {publishLoading ? "Publishing…" : "Publish to preview"}
            </button>
            {publishStatus ? (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: publishStatus.startsWith("Success") ? "var(--success, #22c55e)" : "var(--danger, #f87171)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {publishStatus}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

const chipButtonStyle: CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
  fontSize: "0.8rem",
  cursor: "pointer",
};
