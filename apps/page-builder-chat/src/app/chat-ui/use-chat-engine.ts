"use client";

import { useCallback, useRef, useState } from "react";

/* ── Shared types ────────────────────────────────────── */

export interface PageState {
  key: string;
  data: {
    content: unknown[];
    root: Record<string, unknown>;
  };
}

export const INITIAL_PAGE: PageState = {
  key: "category/{}",
  data: {
    content: [],
    root: { props: {} },
  },
};

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type BannerSliderChoice = {
  masterWidgetKey: string;
  cmsSliderId: number;
  label: string;
};

export type ProductCarouselPickerPayload = {
  widgetsKey: string;
  masterWidgetKey: string;
  displayName: string;
  products: { sku: string; name: string }[];
  pageIndex: number;
  pageSize: number;
  hasMore: boolean;
  updateComponentId?: string;
};

export type ProductCarouselUiState = ProductCarouselPickerPayload & {
  selectedSkus: string[];
};

type ChatApiJson = {
  error?: string;
  assistantContent?: string | null;
  page?: PageState;
  errors?: { commandIndex: number; message: string }[];
  applied?: number;
  toolArgumentsParsed?: { commands: unknown[] }[];
  bannerSliderChoices?: BannerSliderChoice[];
  bannerSliderUpdateComponentId?: string;
  productCarouselPicker?: ProductCarouselPickerPayload;
};

/* ── Helpers ─────────────────────────────────────────── */

function pageFromApiPayload(raw: unknown): PageState | null {
  if (raw === null || raw === undefined || typeof raw !== "object") return null;
  try {
    return structuredClone(raw) as PageState;
  } catch {
    return null;
  }
}

function formatChatAssistantReply(
  assistantContent: string | null | undefined,
  applied: number | undefined,
  errors: { commandIndex: number; message: string }[] | undefined
): string {
  const extra =
    errors && errors.length > 0
      ? "\n\nCommand issues:\n" + errors.map((e) => `- #${e.commandIndex}: ${e.message}`).join("\n")
      : "";
  const main = (assistantContent ?? "").trim();
  const appliedCount = applied ?? 0;
  const changesLine = appliedCount > 0 ? "\n\nChanges applied" : "";
  if (main) return main + changesLine + extra;
  if (appliedCount > 0) return "Changes applied" + extra;
  return "(no text)" + extra;
}

function mergeProductCarouselPicker(
  prev: ProductCarouselUiState | null,
  incoming: ProductCarouselPickerPayload
): ProductCarouselUiState {
  const updateId = incoming.updateComponentId ?? prev?.updateComponentId;
  if (prev?.widgetsKey === incoming.widgetsKey && incoming.pageIndex > 1) {
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

/* ── Publish defaults ─────────────────────────────────── */

const PUBLISH_PREVIEW_DEFAULTS = {
  pageCode: "Home",
  portalCode: "MaxwellsHardware",
  profileCode: ["AllProfiles"],
} as const;

/* ── Hook ────────────────────────────────────────────── */

export interface UseChatEngineOptions {
  page: PageState;
  onPageChange: (page: PageState) => void;
  welcomeMessage?: string;
}

export function useChatEngine({ page, onPageChange, welcomeMessage }: UseChatEngineOptions) {
  const pageRef = useRef(page);
  pageRef.current = page;

  const onPageChangeRef = useRef(onPageChange);
  onPageChangeRef.current = onPageChange;

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    welcomeMessage ? [{ role: "assistant", content: welcomeMessage }] : []
  );
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [bannerSliderChoices, setBannerSliderChoices] = useState<BannerSliderChoice[] | null>(null);
  const [bannerSliderUpdateComponentId, setBannerSliderUpdateComponentId] = useState<string | null>(null);
  const [productCarousel, setProductCarousel] = useState<ProductCarouselUiState | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);

  const pushAssistant = useCallback((content: string) => {
    setMessages((m) => [...m, { role: "assistant", content }]);
  }, []);

  const publishPage = useCallback(
    async (pageToPublish: PageState) => {
      setPublishLoading(true);
      setPublishStatus(null);
      try {
        const pageJson = JSON.stringify(pageToPublish, null, 2);
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
        if (res.ok) {
          const status = "Published to preview successfully.";
          setPublishStatus(status);
          pushAssistant(status);
        } else {
          const status = `Publish failed (${res.status}): ${text.slice(0, 300)}`;
          setPublishStatus(status);
          pushAssistant(status);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const status = `Publish error: ${msg}`;
        setPublishStatus(status);
        pushAssistant(status);
      } finally {
        setPublishLoading(false);
      }
    },
    [pushAssistant]
  );

  const processApiResponse = useCallback(
    (data: ChatApiJson) => {
      const nextPage = pageFromApiPayload(data.page);
      if (nextPage !== null) {
        onPageChangeRef.current(nextPage);
        void publishPage(nextPage);
      }
      if (data.bannerSliderChoices?.length) {
        setBannerSliderChoices(data.bannerSliderChoices);
        setBannerSliderUpdateComponentId(data.bannerSliderUpdateComponentId ?? null);
      } else {
        setBannerSliderChoices(null);
        setBannerSliderUpdateComponentId(null);
      }
      if (data.productCarouselPicker) {
        const picker = data.productCarouselPicker;
        setProductCarousel((prev) => mergeProductCarouselPicker(prev, picker));
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    },
    [pushAssistant, publishPage]
  );

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
        body: JSON.stringify({ page: pageRef.current, message: text, useCommandsOnly: false }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      processApiResponse(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

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
          page: pageRef.current,
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
      processApiResponse(data);
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
      return {
        ...prev,
        selectedSkus: on ? prev.selectedSkus.filter((s) => s !== sku) : [...prev.selectedSkus, sku],
      };
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
          page: pageRef.current,
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
        const picker = data.productCarouselPicker;
        setProductCarousel((prev) => mergeProductCarouselPicker(prev, picker));
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [loading, productCarousel, pushAssistant]);

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
          page: pageRef.current,
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
      processApiResponse(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [loading, productCarousel, pushAssistant, processApiResponse]);

  return {
    messages,
    chatInput,
    setChatInput,
    loading,
    lastError,
    bannerSliderChoices,
    productCarousel,
    publishLoading,
    publishStatus,
    sendChat,
    pickBannerSlider,
    toggleProductCarouselSku,
    loadMoreProductCarousel,
    confirmProductCarousel,
    pushAssistant,
  };
}
