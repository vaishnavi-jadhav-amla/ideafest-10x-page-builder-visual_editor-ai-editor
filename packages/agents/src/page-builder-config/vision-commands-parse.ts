/* eslint-disable no-console */
/**
 * Shared parse + post-process logic for vision commands.
 * Extracted so both streaming and non-streaming vision flows can reuse it.
 */
import { randomUUID } from "crypto";
import type { VisionAnalysisResult, CmsWidgetSuggestion } from "./vision-commands";
import { WIDGET_CATALOG } from "./widget-catalog";

/* -------------------------------------------------------------------------- */
/*  JSON parsing                                                              */
/* -------------------------------------------------------------------------- */

export function parseVisionJson(content: string): VisionAnalysisResult {
  const trimmed = content.trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    // Try extracting from markdown fences
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence?.[1]?.trim()) {
      parsed = JSON.parse(fence[1].trim()) as Record<string, unknown>;
    } else {
      // Try finding first { to last }
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      if (start >= 0 && end > start) {
        parsed = JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
      } else {
        throw new Error("Could not find valid JSON object in vision model output");
      }
    }
  }

  // Extract the data object (content, root, zones)
  const rawData =
    typeof parsed.data === "object" && parsed.data !== null
      ? (parsed.data as Record<string, unknown>)
      : {};
  const data = {
    content: Array.isArray(rawData.content) ? rawData.content : [],
    root:
      typeof rawData.root === "object" && rawData.root !== null
        ? (rawData.root as { props: Record<string, unknown> })
        : { props: {} },
    zones:
      typeof rawData.zones === "object" && rawData.zones !== null
        ? (rawData.zones as Record<string, unknown[]>)
        : {},
  };

  const widgets = Array.isArray(parsed.widgets)
    ? (parsed.widgets as { widgetKey: string; type: string }[]).filter(
        (w) =>
          typeof w === "object" &&
          w !== null &&
          typeof w.widgetKey === "string" &&
          typeof w.type === "string"
      )
    : [];

  const cmsWidgetSuggestions = Array.isArray(parsed.cmsWidgetSuggestions)
    ? (parsed.cmsWidgetSuggestions as CmsWidgetSuggestion[]).filter(
        (s) =>
          typeof s === "object" &&
          s !== null &&
          typeof s.componentType === "string" &&
          WIDGET_CATALOG.some((w) => w.componentType === s.componentType)
      )
    : [];
  const description =
    typeof parsed.description === "string" ? parsed.description : "Image analyzed";

  // DEBUG: Log parsed data before UUID assignment
  console.log("[vision-parse] parseVisionJson — content items:", data.content.length);
  console.log("[vision-parse] parseVisionJson — zone keys:", Object.keys(data.zones));
  for (const [zk, zv] of Object.entries(data.zones)) {
    const types = (zv as { type?: string }[]).map((w) => w.type);
    console.log(`[vision-parse] parseVisionJson — zone "${zk}" widgets:`, types);
  }
  console.log("[vision-parse] parseVisionJson — widgets array:", JSON.stringify(widgets));
  console.log("[vision-parse] parseVisionJson — cmsWidgetSuggestions:", JSON.stringify(cmsWidgetSuggestions));

  return { data, widgets, cmsWidgetSuggestions, description };
}

/* -------------------------------------------------------------------------- */
/*  Auto-inject missing CMS widgets from cmsWidgetSuggestions                 */
/* -------------------------------------------------------------------------- */

/**
 * LLMs frequently detect CMS widgets (adding them to cmsWidgetSuggestions)
 * but fail to place the actual widget JSON in the zones. This function
 * inspects the parsed result and, for every cmsWidgetSuggestion whose
 * componentType is NOT already present in any zone (or content), injects
 * the widget with catalog default props into the primary container zone.
 */
function injectMissingCmsWidgets(result: VisionAnalysisResult): VisionAnalysisResult {
  if (!result.cmsWidgetSuggestions.length) return result;

  // Collect all component types already present in zones + content
  const existingTypes = new Set<string>();
  for (const item of result.data.content) {
    const t = (item as Record<string, unknown>).type;
    if (typeof t === "string") existingTypes.add(t);
  }
  for (const zoneItems of Object.values(result.data.zones)) {
    for (const item of zoneItems) {
      const t = (item as Record<string, unknown>).type;
      if (typeof t === "string") existingTypes.add(t);
    }
  }

  // Find the primary container zone — typically "Container-xxx:Container"
  // If there are multiple, use the one with the most widgets (the main content zone).
  let targetZoneKey: string | null = null;
  let targetZoneLen = -1;
  for (const [key, items] of Object.entries(result.data.zones)) {
    if (key.includes(":Container")) {
      if (items.length > targetZoneLen) {
        targetZoneLen = items.length;
        targetZoneKey = key;
      }
    }
  }

  // If no container zone exists, check if there's a Container in content and create its zone
  if (!targetZoneKey) {
    for (const item of result.data.content) {
      const rec = item as Record<string, unknown>;
      if (rec.type === "Container") {
        const props = rec.props as Record<string, unknown> | undefined;
        const id = props?.id as string | undefined;
        if (id) {
          targetZoneKey = `${id}:Container`;
          if (!result.data.zones[targetZoneKey]) {
            result.data.zones[targetZoneKey] = [];
          }
          break;
        }
      }
    }
  }

  // If still no zone, place at end of content as fallback
  const missingWidgets: unknown[] = [];
  let counter = 900; // high counter to avoid ID collisions

  for (const suggestion of result.cmsWidgetSuggestions) {
    if (existingTypes.has(suggestion.componentType)) continue;

    const catalogEntry = WIDGET_CATALOG.find(
      (w) => w.componentType === suggestion.componentType && w.requiresCmsPicker
    );
    if (!catalogEntry) continue;

    counter++;
    const placeholderId = `${suggestion.componentType}-${counter}`;
    const widget = {
      type: suggestion.componentType,
      props: {
        ...JSON.parse(JSON.stringify(catalogEntry.defaultProps)),
        id: placeholderId,
      },
    };

    console.log(`[vision-parse] injectMissingCmsWidgets — injecting ${suggestion.componentType} (id: ${placeholderId}) into ${targetZoneKey ?? "content"}`);
    missingWidgets.push(widget);
    existingTypes.add(suggestion.componentType);
  }

  if (missingWidgets.length === 0) return result;

  if (targetZoneKey) {
    result.data.zones[targetZoneKey] = [
      ...result.data.zones[targetZoneKey],
      ...missingWidgets,
    ];
  } else {
    // No container zone — append to content
    result.data.content = [...result.data.content, ...missingWidgets];
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*  UUID post-processing                                                      */
/* -------------------------------------------------------------------------- */

export function assignRealUuids(result: VisionAnalysisResult): VisionAnalysisResult {
  const idMap = new Map<string, string>();
  const uuidMap = new Map<string, string>();

  function collectIds(item: Record<string, unknown>) {
    const props = item.props as Record<string, unknown> | undefined;
    if (!props) return;
    const oldId = props.id as string | undefined;
    const type = item.type as string | undefined;
    if (!oldId || !type) return;
    if (idMap.has(oldId)) return;
    const uuid = randomUUID();
    const newId = `${type}-${uuid}`;
    idMap.set(oldId, newId);
    uuidMap.set(oldId, uuid);
  }

  for (const item of result.data.content) {
    collectIds(item as Record<string, unknown>);
  }
  for (const zoneItems of Object.values(result.data.zones)) {
    for (const item of zoneItems) {
      collectIds(item as Record<string, unknown>);
    }
  }

  function rewriteItem(item: Record<string, unknown>) {
    const props = item.props as Record<string, unknown> | undefined;
    if (!props) return;
    const oldId = props.id as string | undefined;
    if (!oldId) return;
    const newId = idMap.get(oldId);
    const uuid = uuidMap.get(oldId);
    if (!newId || !uuid) return;
    props.id = newId;

    const config = props.config as Record<string, unknown> | undefined;
    if (config) {
      const wc = config.widgetConfig as Record<string, unknown> | undefined;
      if (wc && typeof wc.masterWidgetKey === "string") {
        wc.widgetKey = `${wc.masterWidgetKey}-${uuid}`;
      }
      const pmp = config.postMessagePayload as Record<string, unknown> | undefined;
      if (pmp) {
        const pmpData = pmp.data as Record<string, unknown> | undefined;
        if (pmpData && typeof pmpData.widgetCode === "string") {
          pmpData.widgetKey = `${pmpData.widgetCode === "FormWidget" ? "" : ""}${props.id}`;
        }
      }
    }
  }

  for (const item of result.data.content) {
    rewriteItem(item as Record<string, unknown>);
  }
  for (const zoneItems of Object.values(result.data.zones)) {
    for (const item of zoneItems) {
      rewriteItem(item as Record<string, unknown>);
    }
  }

  const newZones: Record<string, unknown[]> = {};
  for (const [oldKey, items] of Object.entries(result.data.zones)) {
    let newKey = oldKey;
    const colonIdx = oldKey.indexOf(":");
    if (colonIdx > 0) {
      const parentId = oldKey.slice(0, colonIdx);
      const zoneName = oldKey.slice(colonIdx);
      const mappedParentId = idMap.get(parentId);
      if (mappedParentId) {
        newKey = `${mappedParentId}${zoneName}`;
      }
    }
    newZones[newKey] = items;
  }
  result.data.zones = newZones;

  const newWidgets: { widgetKey: string; type: string }[] = [];
  function extractWidgetRefs(item: Record<string, unknown>) {
    const props = item.props as Record<string, unknown> | undefined;
    if (!props) return;
    const config = props.config as Record<string, unknown> | undefined;
    if (!config) return;
    const wc = config.widgetConfig as Record<string, unknown> | undefined;
    if (wc && typeof wc.widgetKey === "string" && typeof wc.widgetCode === "string") {
      newWidgets.push({ widgetKey: wc.widgetKey, type: wc.widgetCode });
    }
  }

  for (const item of result.data.content) {
    extractWidgetRefs(item as Record<string, unknown>);
  }
  for (const zoneItems of Object.values(result.data.zones)) {
    for (const item of zoneItems) {
      extractWidgetRefs(item as Record<string, unknown>);
    }
  }
  result.widgets = newWidgets;

  return result;
}

/* -------------------------------------------------------------------------- */
/*  Combined: parse + UUID assignment                                         */
/* -------------------------------------------------------------------------- */

/**
 * Parse raw LLM vision output and apply UUID post-processing.
 * Used by both streaming (final step) and non-streaming vision flows.
 */
export function parseAndPostProcess(content: string): VisionAnalysisResult {
  console.log("[vision-parse] parseAndPostProcess — raw content length:", content.length);
  console.log("[vision-parse] parseAndPostProcess — raw content (last 500 chars):", content.slice(-500));
  const parsed = parseVisionJson(content);
  // Auto-inject CMS widgets the LLM detected but didn't place in zones
  const injected = injectMissingCmsWidgets(parsed);
  const result = assignRealUuids(injected);
  // DEBUG: Log final output after UUID rewrite
  console.log("[vision-parse] parseAndPostProcess — FINAL zone keys:", Object.keys(result.data.zones));
  for (const [zk, zv] of Object.entries(result.data.zones)) {
    const types = (zv as { type?: string }[]).map((w) => w.type);
    console.log(`[vision-parse] parseAndPostProcess — FINAL zone "${zk}" widgets:`, types);
  }
  console.log("[vision-parse] parseAndPostProcess — FINAL widgets:", JSON.stringify(result.widgets));
  return result;
}
