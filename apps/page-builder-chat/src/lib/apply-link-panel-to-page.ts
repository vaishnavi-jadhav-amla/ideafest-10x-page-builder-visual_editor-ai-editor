import {
  applyPageBuilderCommands,
  registerWidgetsFromPuckAppend,
} from "@znode/agents/page-builder-config/commands";
import type { IPageStructure } from "@znode/types/visual-editor";
import { randomUUID } from "node:crypto";

import { findFirstLinkPanelOnPage, findPuckComponentById } from "./puck-update-by-instance-id";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** `2253-<uuid>` → master `2253` and full key. */
export function parseLinkPanelCompositeWidgetsKey(widgetsKey: string): { masterWidgetKey: string; fullKey: string } {
  const fullKey = widgetsKey.trim();
  const re = /^(.*)-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
  const m = fullKey.match(re);
  if (m?.[1]) {
    return { masterWidgetKey: m[1], fullKey };
  }
  return {
    masterWidgetKey: process.env.PAGE_BUILDER_LINK_PANEL_MASTER_KEY?.trim() || "2253",
    fullKey,
  };
}

function panelLabelFromEnv(): string {
  return (
    process.env.PAGE_BUILDER_LINK_PANEL_DISPLAY_NAME?.trim() ||
    process.env.PAGE_BUILDER_LINK_PANEL_WIDGET_NAME?.trim() ||
    "Link Panel"
  );
}

function typeOfMappingFromEnv(): string {
  return process.env.PAGE_BUILDER_CMS_TYPE_OF_MAPPING?.trim() || "PortalMapping";
}

export function buildLinkPanelAppendCommand(opts: {
  widgetsKey: string;
  masterWidgetKey: string;
  instanceId: string;
  panelDisplayName: string;
}): Record<string, unknown> {
  return {
    kind: "append_component",
    target: "main",
    componentType: "LinkPanel",
    id: opts.instanceId,
    props: {
      response: null,
      contentOrientation: "vertical",
      customClass: "",
      config: {
        type: "Widget",
        id: "LinkPanelWidget",
        hasConfigurable: true,
        widgetConfig: {
          masterWidgetKey: opts.masterWidgetKey,
          widgetKey: opts.widgetsKey,
          typeOfMapping: typeOfMappingFromEnv(),
          widgetCode: "LinkPanel",
          displayName: opts.panelDisplayName,
        },
      },
    },
  };
}

/**
 * Sets `LinkPanel` `widgetConfig.widgetKey` to the CMS `WidgetsKey`, or appends a **LinkPanel** on main if none exists.
 * Syncs `page.widgets` after merge.
 */
export function applyLinkPanelWidgetsKeyToPage(
  page: IPageStructure,
  widgetsKey: string
): { page: IPageStructure; commands: unknown[]; error?: string } {
  const { masterWidgetKey, fullKey } = parseLinkPanelCompositeWidgetsKey(widgetsKey);
  const panelDisplayName = panelLabelFromEnv();
  const existing = findFirstLinkPanelOnPage(page);

  if (existing) {
    const located = findPuckComponentById(page, existing.componentId);
    if (!located || located.type !== "LinkPanel") {
      return { page, commands: [], error: "Could not load LinkPanel props for merge." };
    }
    const p = located.props;
    const config = isPlainObject(p.config) ? { ...p.config } : {};
    const wc = isPlainObject(config.widgetConfig) ? { ...config.widgetConfig } : {};
    const newConfig = {
      ...config,
      type: "Widget",
      id: "LinkPanelWidget",
      hasConfigurable: true,
      widgetConfig: {
        ...wc,
        masterWidgetKey,
        widgetKey: fullKey,
        typeOfMapping: typeOfMappingFromEnv(),
        widgetCode: "LinkPanel",
        displayName: panelDisplayName,
      },
    };
    const newProps = { ...p, config: newConfig };
    const cmd = {
      kind: "merge_component_props" as const,
      target: existing.target,
      componentId: existing.componentId,
      props: newProps,
    };
    const result = applyPageBuilderCommands(page, [cmd]);
    if (result.errors.length > 0) {
      return { page, commands: [cmd], error: result.errors.map((e) => e.message).join("; ") };
    }
    const after = findPuckComponentById(result.page, existing.componentId);
    if (after?.props) {
      registerWidgetsFromPuckAppend(result.page, "LinkPanel", after.props as Record<string, unknown>);
    }
    return { page: result.page, commands: [cmd] };
  }

  const instanceId = `LinkPanel-${randomUUID()}`;
  const cmd = buildLinkPanelAppendCommand({
    widgetsKey: fullKey,
    masterWidgetKey,
    instanceId,
    panelDisplayName,
  });
  const result = applyPageBuilderCommands(page, [cmd]);
  if (result.errors.length > 0) {
    return { page, commands: [cmd], error: result.errors.map((e) => e.message).join("; ") };
  }
  return { page: result.page, commands: [cmd] };
}
