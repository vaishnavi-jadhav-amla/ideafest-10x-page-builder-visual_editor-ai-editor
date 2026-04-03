"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

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

type LinkPanelUiState = {
  url: string;
  displayName: string;
  /** After CMS **Submit**: show "Add more?" + **Finalise** (page JSON), not before. */
  afterCmsSave: boolean;
  /**
   * First successful **Submit** sets this `WidgetsKey`; every later **Submit** in the session reuses it so the gateway
   * payload stays the same except `Title` / `Url`. **Finalise** writes this key into the page JSON.
   */
  sessionWidgetsKey: string | null;
};

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
  /** Next slider chip click updates this BannerSlider id instead of appending. */
  bannerSliderUpdateComponentId?: string;
  productCarouselPicker?: ProductCarouselPickerPayload;
  showLinkPanelForm?: boolean;
  source?: string;
  linkPanelSessionWidgetsKey?: string;
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
  const extra = errors && errors.length > 0 ? `\n\nCommand issues:\n${errors.map((e) => `- #${e.commandIndex}: ${e.message}`).join("\n")}` : "";
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
      <span style={{ fontSize: size * 0.38, fontWeight: 800, color: "#16a34a", letterSpacing: -0.5 }}>Z</span>
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
  const engineLine = engines.length > 0 ? `Engines: ${engines.join(", ")}.` : "No chat engines enabled — use **Apply commands** only.";
  return `Hi. ${engineLine} Try: \`set title My store\` then Send, or type \`help\`. **Apply commands** below still works without any key. See /commands-reference.txt.`;
}

export function ChatPageClient({ chatPanelEnabled, plainTextEnabled, openAiReady, ollamaConfigured }: ChatPageClientProps) {
  const [page, setPage] = useState(INITIAL_PAGE);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [{ role: "assistant", content: buildWelcome(plainTextEnabled, openAiReady, ollamaConfigured) }]);
  const [chatInput, setChatInput] = useState("");
  const [commandsInput, setCommandsInput] = useState(DEFAULT_SAMPLE_NDJSON);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [bannerSliderChoices, setBannerSliderChoices] = useState<BannerSliderChoice[] | null>(null);
  const [bannerSliderUpdateComponentId, setBannerSliderUpdateComponentId] = useState<string | null>(null);
  const [productCarousel, setProductCarousel] = useState<ProductCarouselUiState | null>(null);
  const [linkPanel, setLinkPanel] = useState<LinkPanelUiState | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Receive page structure pushed by the page-builder (parent window).
   * Updates local page state so the AI chat always works on the latest editor data.
   */
  useEffect(() => {
    function handlePageSync(event: MessageEvent) {
      if (event.data?.type !== "PAGE_BUILDER_SYNC_PAGE") return;
      // Only accept messages originating from the direct parent window.
      if (event.source !== window.parent) return;
      const syncedPage = event.data?.page;
      if (syncedPage && typeof syncedPage === "object") {
        setPage(syncedPage);
      }
    }
    window.addEventListener("message", handlePageSync);
    return () => window.removeEventListener("message", handlePageSync);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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

  const pushAssistant = useCallback((content: string) => {
    setMessages((m) => [...m, { role: "assistant", content }]);
  }, []);

  const appendCmd = useCallback((cmd: Record<string, unknown>) => {
    setCommandsInput((prev) => appendCommandLine(prev, cmd));
  }, []);

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
        // Transfer the latest page structure back to the page-builder iframe host.
        if (typeof window !== "undefined" && window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "CHAT_PAGE_UPDATE", page }, "*");
        }
        setTimeout(() => setPublishStatus(null), 2000);
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
    setLinkPanel(null);
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
    setLinkPanel(null);
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

  const submitLinkPanel = useCallback(async () => {
    if (loading || !linkPanel) {
      return;
    }
    const url = linkPanel.url.trim();
    const displayName = linkPanel.displayName.trim();
    if (!url || !displayName) {
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
          linkWidgetSubmit: {
            url,
            displayName,
            ...(linkPanel.sessionWidgetsKey?.trim() ? { reuseWidgetsKey: linkPanel.sessionWidgetsKey.trim() } : {}),
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
      if (data.showLinkPanelForm) {
        if (data.source === "link-widget-save-ok") {
          setLinkPanel((prev) => ({
            url: "",
            displayName: "",
            afterCmsSave: true,
            sessionWidgetsKey: prev?.sessionWidgetsKey ?? data.linkPanelSessionWidgetsKey ?? null,
          }));
        } else if (data.source === "link-widget-save-error") {
          setLinkPanel((prev) => prev ?? { url, displayName, afterCmsSave: false, sessionWidgetsKey: null });
        } else {
          setLinkPanel({ url: "", displayName: "", afterCmsSave: false, sessionWidgetsKey: null });
        }
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [loading, page, linkPanel, pushAssistant]);

  const finaliseLinkPanelOnPage = useCallback(async () => {
    if (loading || !linkPanel?.sessionWidgetsKey?.trim()) {
      return;
    }
    const widgetsKey = linkPanel.sessionWidgetsKey.trim();
    setLastError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          applyLinkPanelPageUpdate: { widgetsKey },
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
      if (data.showLinkPanelForm && data.source === "link-panel-page-update-ok") {
        setLinkPanel({ url: "", displayName: "", afterCmsSave: false, sessionWidgetsKey: null });
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [loading, page, linkPanel, pushAssistant]);

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || loading) return;
    setLastError(null);
    setBannerSliderChoices(null);
    setBannerSliderUpdateComponentId(null);
    setProductCarousel(null);
    setLinkPanel(null);
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
      if (data.showLinkPanelForm) {
        if (data.source === "link-widget-save-ok") {
          setLinkPanel((prev) => ({
            url: "",
            displayName: "",
            afterCmsSave: true,
            sessionWidgetsKey: prev?.sessionWidgetsKey ?? data.linkPanelSessionWidgetsKey ?? null,
          }));
        } else if (data.source === "link-widget-save-error") {
          setLinkPanel((prev) => prev ?? { url: "", displayName: "", afterCmsSave: false, sessionWidgetsKey: null });
        } else if (data.source === "link-panel-page-update-ok") {
          setLinkPanel({ url: "", displayName: "", afterCmsSave: false, sessionWidgetsKey: null });
        } else {
          setLinkPanel({ url: "", displayName: "", afterCmsSave: false, sessionWidgetsKey: null });
        }
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
    <div style={styles.chatContainer}>
      {/* ── Header ──────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <ZnodeLogo size={40} />
          <div>
            <div style={styles.headerTitle}>Znode Smart Assistant</div>
          </div>
        </div>
        <div style={styles.headerActions} />
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
          {publishStatus.startsWith("Success") ? "Published to preview successfully" : "Failed to publish to preview"}
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
                <div style={styles.assistantLabel}>ZNODE Smart Assistant</div>
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
              <button key={`${i}-${c.masterWidgetKey}-${c.cmsSliderId}`} type="button" disabled={loading} onClick={() => void pickBannerSlider(c)} style={styles.chip}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Link panel ─────────────────────────────── */}
      {linkPanel !== null && (
        <div style={styles.pickerPanel}>
          <div style={styles.pickerTitle}>Link Panel — CMS Link Configuration</div>
          {linkPanel.afterCmsSave ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                Link saved to CMS. <strong>Add more</strong> opens the form to save another link (same API). <strong>Finalise</strong> updates the page JSON (LinkPanel{" "}
                <code>widgetKey</code>) using the shared session key (same for every link you add here).
              </div>
              <div style={styles.chipRow}>
                <button type="button" disabled={loading} onClick={() => setLinkPanel((p) => (p ? { ...p, url: "", displayName: "", afterCmsSave: false } : p))} style={styles.chip}>
                  Add more
                </button>
                <button
                  type="button"
                  disabled={loading || !linkPanel.sessionWidgetsKey?.trim()}
                  onClick={() => void finaliseLinkPanelOnPage()}
                  style={{
                    ...styles.chip,
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    opacity: loading || !linkPanel.sessionWidgetsKey?.trim() ? 0.5 : 1,
                    cursor: loading || !linkPanel.sessionWidgetsKey?.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  Finalise
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.78rem", lineHeight: 1.4 }}>
                <strong>Submit</strong> calls <code>CreateUpdateLinkWidgetConfiguration</code>. The first submit in this panel picks a <code>WidgetsKey</code>; after{" "}
                <strong>Add more</strong>, only <strong>Title</strong> and <strong>Url</strong> change — other gateway fields stay the same. Use <strong>Finalise</strong> when you
                want the page JSON updated.
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontWeight: 500, fontSize: "0.82rem" }}>URL</span>
                <input
                  type="text"
                  inputMode="url"
                  value={linkPanel.url}
                  onChange={(e) => setLinkPanel((p) => (p ? { ...p, url: e.target.value } : p))}
                  placeholder="https://…"
                  disabled={loading}
                  style={styles.linkInput}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontWeight: 500, fontSize: "0.82rem" }}>Display name (link title)</span>
                <input
                  type="text"
                  value={linkPanel.displayName}
                  onChange={(e) => setLinkPanel((p) => (p ? { ...p, displayName: e.target.value } : p))}
                  placeholder="Maps to CMS Title (visible link text)"
                  disabled={loading}
                  style={styles.linkInput}
                />
              </label>
              <div style={styles.chipRow}>
                <button
                  type="button"
                  disabled={loading || !linkPanel.url.trim() || !linkPanel.displayName.trim()}
                  onClick={() => void submitLinkPanel()}
                  style={{
                    ...styles.chip,
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    cursor: loading || !linkPanel.url.trim() || !linkPanel.displayName.trim() ? "not-allowed" : "pointer",
                    opacity: loading || !linkPanel.url.trim() || !linkPanel.displayName.trim() ? 0.5 : 1,
                  }}
                >
                  Submit
                </button>
                {linkPanel.sessionWidgetsKey?.trim() ? (
                  <button
                    type="button"
                    disabled={loading || !linkPanel.sessionWidgetsKey?.trim()}
                    onClick={() => void finaliseLinkPanelOnPage()}
                    style={{
                      ...styles.chip,
                      opacity: loading ? 0.5 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    Finalise
                  </button>
                ) : null}
              </div>
            </div>
          )}
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

      {/* ── Commands panel (collapsible) ───────────── */}
      <details style={styles.commandsDetails}>
        <summary style={styles.commandsSummary}>Apply commands (no AI, no key) — NDJSON or JSON array</summary>
        <div style={styles.commandsBody}>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => {
                setCommandsInput(DEFAULT_SAMPLE_NDJSON);
                pushAssistant("Loaded **default** sample (Heading, Text, VerticalSpacing, ButtonGroup, Container + root title). Click Apply commands.");
              }}
              style={{ ...styles.chip }}
            >
              Load default sample
            </button>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 6 }}>Insert widget (appends one command — then Apply)</div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 8 }}>
            <button type="button" disabled={loading} onClick={() => appendCmd({ kind: "merge_root_props", target: "main", props: { title: "Page title" } })} style={styles.chip}>
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
                  props: { align: "left", text: "New text block", padding: { top: "0", right: "0", bottom: "0", left: "0" }, size: "m", color: "default", weight: "normal" },
                  id: newWidgetId("Text"),
                })
              }
              style={styles.chip}
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
              style={styles.chip}
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
                    image: { src: "", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" },
                  },
                  id: newWidgetId("Container"),
                })
              }
              style={styles.chip}
            >
              + Container
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => appendCmd({ kind: "append_component", target: "main", componentType: "VerticalSpacing", props: { size: "24px" }, id: newWidgetId("VerticalSpacing") })}
              style={styles.chip}
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
                  props: { align: "left", buttons: [{ label: "Button", href: "#", variant: "primary", target: "_self" }] },
                  id: newWidgetId("ButtonGroup"),
                })
              }
              style={styles.chip}
            >
              + Button group
            </button>
          </div>
          <textarea value={commandsInput} onChange={(e) => setCommandsInput(e.target.value)} rows={8} spellCheck={false} style={styles.commandsTextarea} disabled={loading} />
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setCommandsInput(SAMPLE_NDJSON)} style={styles.chip}>
              Load sample: category PLP
            </button>
            <button type="button" onClick={() => setCommandsInput(SAMPLE_JSON_ARRAY)} style={styles.chip}>
              Load sample: product PDP
            </button>
            <button type="button" onClick={() => setCommandsInput(SAMPLE_APPEND_EMPTY)} style={styles.chip}>
              Load sample: EmptyBox only
            </button>
            <button
              type="button"
              onClick={() => void applyCommands()}
              disabled={loading}
              style={{ ...styles.chip, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 600 }}
            >
              Apply commands
            </button>
            <button
              type="button"
              onClick={() => {
                setPage(INITIAL_PAGE);
                pushAssistant("Reset page JSON to empty template.");
              }}
              style={styles.chip}
            >
              Reset page
            </button>
          </div>
        </div>
      </details>

      {/* ── Input area ─────────────────────────────── */}
      {chatPanelEnabled ? (
        <div style={styles.inputArea}>
          <div style={styles.inputRow}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              style={styles.textInput}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendChat();
                }
              }}
            />
            <button
              type="button"
              onClick={() => void sendChat()}
              disabled={loading || !chatInput.trim()}
              style={{
                ...styles.sendBtn,
                opacity: loading || !chatInput.trim() ? 0.5 : 1,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              )}
            </button>
          </div>
          <div style={styles.inputHint}>
            Try: <strong>add banner slider</strong>, <strong>add text</strong>, <strong>set title</strong>, or ask anything
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
    width: "100%",
    height: "100vh",
    background: "var(--panel)",
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

  linkInput: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "#fff",
    color: "var(--text)",
    fontSize: "0.85rem",
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

  commandsDetails: {
    borderTop: "1px solid var(--border)",
    background: "#fafbfc",
  },
  commandsSummary: {
    padding: "10px 16px",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "var(--muted)",
    cursor: "pointer",
  },
  commandsBody: {
    padding: "0 16px 12px",
  },
  commandsTextarea: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "#fff",
    color: "var(--text)",
    fontFamily: "ui-monospace, monospace",
    fontSize: "0.8rem",
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
