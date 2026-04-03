import type { IPageStructure } from "@znode/types/visual-editor";

import type { PageBuilderCommandTarget } from "@znode/agents/page-builder-config/commands";

type PuckTreeItem = { type?: string; props?: unknown };

type PageContentRoot = { content?: unknown };

function isPuckContentArray(value: unknown): value is PuckTreeItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }
  return value.every(
    (item) => item !== null && typeof item === "object" && "type" in item && "props" in item
  );
}

function puckItemId(item: PuckTreeItem): string | undefined {
  const p = item.props;
  if (p && typeof p === "object" && !Array.isArray(p)) {
    const id = (p as Record<string, unknown>).id;
    if (typeof id === "string" && id.trim()) {
      return id.trim();
    }
  }
  return undefined;
}

function idsMatch(a: string, b: string): boolean {
  return a === b || a.toLowerCase() === b.toLowerCase();
}

function searchContent(
  content: unknown,
  componentId: string,
  target: PageBuilderCommandTarget
): { target: PageBuilderCommandTarget; type: string; props: Record<string, unknown> } | null {
  if (!isPuckContentArray(content)) {
    return null;
  }
  for (const item of content) {
    const id = puckItemId(item);
    if (id && idsMatch(id, componentId) && typeof item.type === "string") {
      const props =
        item.props && typeof item.props === "object" && !Array.isArray(item.props)
          ? (item.props as Record<string, unknown>)
          : {};
      return { target, type: item.type, props };
    }
    const p = item.props;
    if (p && typeof p === "object" && !Array.isArray(p)) {
      for (const v of Object.values(p as Record<string, unknown>)) {
        if (isPuckContentArray(v)) {
          const inner = searchContent(v, componentId, target);
          if (inner) {
            return inner;
          }
        }
      }
    }
  }
  return null;
}

function walkForFirstLinkPanel(
  content: unknown,
  target: PageBuilderCommandTarget
): { target: PageBuilderCommandTarget; componentId: string } | null {
  if (!isPuckContentArray(content)) {
    return null;
  }
  for (const item of content) {
    if (item.type === "LinkPanel") {
      const id = puckItemId(item);
      if (id) {
        return { target, componentId: id };
      }
    }
    const p = item.props;
    if (p && typeof p === "object") {
      for (const v of Object.values(p as Record<string, unknown>)) {
        const inner = walkForFirstLinkPanel(v, target);
        if (inner) {
          return inner;
        }
      }
    }
  }
  return null;
}

/** First `LinkPanel` in main → header → footer (for applying CMS `WidgetsKey` to page JSON). */
export function findFirstLinkPanelOnPage(
  page: IPageStructure
): { target: PageBuilderCommandTarget; componentId: string } | null {
  return (
    walkForFirstLinkPanel(page.data?.content, "main") ??
    walkForFirstLinkPanel(page.headerData?.content, "header") ??
    walkForFirstLinkPanel(page.footerData?.content, "footer") ??
    null
  );
}

/** Locate a Puck block by `props.id` in main, header, or footer content trees. */
export function findPuckComponentById(
  page: IPageStructure,
  componentId: string
): { target: PageBuilderCommandTarget; type: string; props: Record<string, unknown> } | null {
  const id = componentId.trim();
  if (!id) {
    return null;
  }
  return (
    searchContent(page.data?.content, id, "main") ??
    searchContent(page.headerData?.content, id, "header") ??
    searchContent(page.footerData?.content, id, "footer") ??
    null
  );
}

/**
 * Parses natural phrases like `change Heading-123-abc color to red` / `set Text-… colour to #f00`.
 * Avoids calling Ollama when the user names an existing `props.id`.
 */
export function parseComponentColorChangeRequest(message: string): { componentId: string; color: string } | null {
  const m = message
    .trim()
    .match(/^(?:change|update|set)\s+(\S+)\s+(?:text\s+)?colou?r\s+to\s+(.+)$/i);
  if (!m?.[1] || m[2] === undefined) {
    return null;
  }
  const componentId = m[1].trim();
  const color = m[2].trim().replace(/^["']|["']$/g, "").trim();
  if (!componentId || !color) {
    return null;
  }
  if (/^(ProductsCarousel|BannerSlider)-/i.test(componentId)) {
    return null;
  }
  return { componentId, color };
}

/**
 * Phrases like `change Heading-1775206954152-ai87cka7 background to blue` / `set Text-… background to #e0e0e0`.
 */
export function parseComponentBackgroundChangeRequest(message: string): { componentId: string; background: string } | null {
  const m = message
    .trim()
    .match(/^(?:change|update|set)\s+(\S+)\s+background\s+to\s+(.+)$/i);
  if (!m?.[1] || m[2] === undefined) {
    return null;
  }
  const componentId = m[1].trim();
  const background = m[2].trim().replace(/^["']|["']$/g, "").trim();
  if (!componentId || !background) {
    return null;
  }
  if (/^(ProductsCarousel|BannerSlider)-/i.test(componentId)) {
    return null;
  }
  return { componentId, background };
}

/**
 * Phrases like `align Heading-1775204443299-6bdg4clk to centre` / `please align Text-… to center`.
 * British **centre** → Puck `align` **center**. Runs before OpenAI so behaviour matches the Ollama path.
 */
export function parseComponentAlignRequest(message: string): { componentId: string; align: "left" | "center" | "right" } | null {
  const t = message.trim().replace(/\s+/g, " ");
  const m = t.match(/^(?:please\s+)?align\s+(\S+)\s+(?:to\s+)?(left|right|center|centre)\s*\.?$/i);
  if (!m?.[1] || !m[2]) {
    return null;
  }
  const componentId = m[1].trim();
  let raw = m[2].trim().toLowerCase();
  if (raw === "centre") {
    raw = "center";
  }
  if (raw !== "left" && raw !== "right" && raw !== "center") {
    return null;
  }
  if (!componentId) {
    return null;
  }
  if (/^(ProductsCarousel|BannerSlider)-/i.test(componentId)) {
    return null;
  }
  return { componentId, align: raw };
}

const HEADING_SIZE = new Set(["xxxl", "xxl", "xl", "l", "m", "s", "xs", "default"]);
const TEXT_SIZE = new Set(["s", "m"]);
const TEXT_WEIGHT = new Set(["normal", "semibold", "bold", "extrabold"]);

function isWidgetMergeExcludedId(componentId: string): boolean {
  return /^(ProductsCarousel|BannerSlider)-/i.test(componentId);
}

/**
 * `change Heading-x level to 4` / `set Heading-x to level 2` / `update Heading-x to h3`.
 * Puck stores **level** as `"1"`…`"6"`.
 */
export function parseComponentLevelChangeRequest(message: string): { componentId: string; level: string } | null {
  const t = message.trim();
  let m = t.match(/^(?:change|update|set)\s+(\S+)\s+(?:level\s+to|to\s+level)\s+([1-6])\s*\.?$/i);
  if (m?.[1] && m[2]) {
    const componentId = m[1].trim();
    if (!componentId || isWidgetMergeExcludedId(componentId)) {
      return null;
    }
    return { componentId, level: m[2] };
  }
  m = t.match(/^(?:change|update|set)\s+(\S+)\s+to\s+h([1-6])\s*\.?$/i);
  if (m?.[1] && m[2]) {
    const componentId = m[1].trim();
    if (!componentId || isWidgetMergeExcludedId(componentId)) {
      return null;
    }
    return { componentId, level: m[2] };
  }
  return null;
}

/**
 * `change Heading-x size to l` / `set Text-y size to m` (Text only **s** | **m**).
 */
export function parseComponentSizeChangeRequest(message: string): { componentId: string; size: string } | null {
  const m = message
    .trim()
    .match(/^(?:change|update|set)\s+(\S+)\s+size\s+to\s+(\S+)\s*\.?$/i);
  if (!m?.[1] || !m[2]) {
    return null;
  }
  const componentId = m[1].trim();
  const size = m[2].trim().toLowerCase();
  if (!componentId || !size || isWidgetMergeExcludedId(componentId)) {
    return null;
  }
  return { componentId, size };
}

/**
 * Validates size token for the component type; returns props or null if invalid for **Text**.
 */
export function mergeSizePropsForPuckType(componentType: string, size: string): Record<string, unknown> | null {
  if (componentType === "Text") {
    if (!TEXT_SIZE.has(size)) {
      return null;
    }
    return { size };
  }
  if (componentType === "Heading") {
    if (!HEADING_SIZE.has(size)) {
      return null;
    }
    return { size };
  }
  if (HEADING_SIZE.has(size) || TEXT_SIZE.has(size)) {
    return { size };
  }
  return null;
}

/**
 * `change Heading-x text to Hello` / `set Text-y title to "Sale"` (Ollama-style copy edits by **props.id**).
 */
export function parseComponentTextChangeRequest(message: string): { componentId: string; text: string } | null {
  const m = message
    .trim()
    .match(/^(?:change|update|set)\s+(\S+)\s+(?:text|title)\s+to\s+([\s\S]+)$/i);
  if (!m?.[1] || m[2] === undefined) {
    return null;
  }
  const componentId = m[1].trim();
  let text = m[2].trim().replace(/^["']|["']$/g, "").trim();
  if (!componentId || isWidgetMergeExcludedId(componentId)) {
    return null;
  }
  return { componentId, text };
}

/**
 * `change Text-x weight to bold` (Text widget **weight**).
 */
export function parseComponentWeightChangeRequest(message: string): { componentId: string; weight: string } | null {
  const m = message
    .trim()
    .match(/^(?:change|update|set)\s+(\S+)\s+weight\s+to\s+(normal|semibold|bold|extrabold)\s*\.?$/i);
  if (!m?.[1] || !m[2]) {
    return null;
  }
  const componentId = m[1].trim();
  const weight = m[2].trim().toLowerCase();
  if (!componentId || isWidgetMergeExcludedId(componentId)) {
    return null;
  }
  return { componentId, weight };
}

/** Props key for color merges — Heading uses `textColor`; Text uses `color` (semantic / theme). */
export function mergeColorPropsForPuckType(componentType: string, color: string): Record<string, unknown> {
  if (componentType === "Text") {
    return { color };
  }
  return { textColor: color };
}

/**
 * Parses: `Update ProductsCarousel-{uuid}` / `change BannerSlider-{uuid}` (verb + type + hyphen + UUID).
 */
export function parseUpdateWidgetByInstanceId(message: string): {
  componentType: "ProductsCarousel" | "BannerSlider";
  componentId: string;
} | null {
  const m = message.trim();
  const re =
    /\b(?:update|change|edit|refresh)\s+(ProductsCarousel|BannerSlider)-([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\b/i;
  const match = m.match(re);
  if (!match) {
    return null;
  }
  const kindRaw = match[1];
  const uuid = match[2].toLowerCase();
  const componentType =
    kindRaw.toLowerCase() === "bannerslider" ? "BannerSlider" : "ProductsCarousel";
  const componentId = `${componentType}-${uuid}`;
  return { componentType, componentId };
}

function collectBannerSliderComponentIdsFromContent(content: unknown, out: string[]): void {
  if (!isPuckContentArray(content)) {
    return;
  }
  for (const item of content) {
    if (item.type === "BannerSlider") {
      const id = puckItemId(item);
      if (id) {
        out.push(id);
      }
    }
    const p = item.props;
    if (p && typeof p === "object" && !Array.isArray(p)) {
      for (const v of Object.values(p as Record<string, unknown>)) {
        if (isPuckContentArray(v)) {
          collectBannerSliderComponentIdsFromContent(v, out);
        }
      }
    }
  }
}

/** Last `BannerSlider` `props.id` on the page (for "update slider banner" without an explicit id). */
export function findLastBannerSliderComponentIdOnPage(page: {
  data?: PageContentRoot;
  headerData?: PageContentRoot;
  footerData?: PageContentRoot;
}): string | null {
  const ids: string[] = [];
  collectBannerSliderComponentIdsFromContent(page.data?.content, ids);
  collectBannerSliderComponentIdsFromContent(page.headerData?.content, ids);
  collectBannerSliderComponentIdsFromContent(page.footerData?.content, ids);
  return ids.length > 0 ? ids[ids.length - 1]! : null;
}
