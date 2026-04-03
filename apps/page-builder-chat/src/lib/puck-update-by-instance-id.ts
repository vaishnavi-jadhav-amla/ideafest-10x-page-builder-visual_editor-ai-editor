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
