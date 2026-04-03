import type { Data } from "@measured/puck";
import type { IExtendedData, IPageStructure, PWidget } from "@znode/types/visual-editor";

/** Area of the page JSON commands apply to (main canvas, global header, or global footer). */
export type PageBuilderCommandTarget = "main" | "header" | "footer";

export type PageBuilderCommand =
  | { kind: "set_page_key"; key: string }
  | { kind: "merge_root_props"; target: PageBuilderCommandTarget; props: Record<string, unknown> }
  | { kind: "clear_content"; target: PageBuilderCommandTarget }
  | {
      kind: "append_component";
      target: PageBuilderCommandTarget;
      componentType: string;
      props?: Record<string, unknown>;
      /** When omitted, a stable id is generated. */
      id?: string;
    }
  | { kind: "remove_component"; target: PageBuilderCommandTarget; componentId: string }
  | {
      kind: "merge_component_props";
      target: PageBuilderCommandTarget;
      componentId: string;
      props: Record<string, unknown>;
    }
  | { kind: "replace_zones"; target: PageBuilderCommandTarget; zones: Record<string, Data["content"]> };

/** Short reference for tooling / LLM system prompts. */
export const PAGE_BUILDER_COMMAND_KINDS = [
  "set_page_key",
  "merge_root_props",
  "clear_content",
  "append_component",
  "remove_component",
  "merge_component_props",
  "replace_zones",
] as const;

const PAGE_BUILDER_KIND_SET = new Set<string>(PAGE_BUILDER_COMMAND_KINDS);

/** Map common model mistakes to canonical `kind` values. */
const KIND_ALIASES: Record<string, PageBuilderCommand["kind"]> = {
  add_component: "append_component",
  insert_component: "append_component",
  delete_component: "remove_component",
  update_component_props: "merge_component_props",
  merge_props: "merge_component_props",
  set_root_props: "merge_root_props",
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** Normalize LLM `kind` strings (camelCase, spacing) to our snake_case union. */
function normalizeCommandKind(raw: string): PageBuilderCommand["kind"] | null {
  const t = raw.trim();
  if (PAGE_BUILDER_KIND_SET.has(t)) {
    return t as PageBuilderCommand["kind"];
  }
  const alias = KIND_ALIASES[t.toLowerCase()];
  if (alias) {
    return alias;
  }
  const snake = t
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
  if (PAGE_BUILDER_KIND_SET.has(snake)) {
    return snake as PageBuilderCommand["kind"];
  }
  const snakeAlias = KIND_ALIASES[snake];
  if (snakeAlias) {
    return snakeAlias;
  }
  return null;
}

function coerceTarget(v: unknown): PageBuilderCommandTarget | null {
  if (typeof v !== "string") {
    return null;
  }
  const x = v.trim().toLowerCase();
  if (x === "main" || x === "header" || x === "footer") {
    return x;
  }
  return null;
}

/**
 * Plain text / chat often uses `remove id "ButtonGroup-…"`; capture groups keep the `id "` prefix.
 * LLMs may also wrap ids in quotes. Strip those so lookup matches `props.id` on the page.
 */
function normalizeUserSuppliedComponentId(raw: string): string {
  let s = raw.trim().replace(/\u201c|\u201d/g, '"').replace(/\u2018|\u2019/g, "'");
  s = s.replace(/^id\s+/i, "").trim();
  if (s.length >= 2 && ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/** LLMs often put the Puck block id in props.id or use alternate key names. */
function coerceComponentIdFromCommand(o: Record<string, unknown>): string | null {
  const tryStr = (v: unknown): string | null =>
    typeof v === "string" && v.trim() ? normalizeUserSuppliedComponentId(v) : null;
  const fromTop =
    tryStr(o.componentId) ??
    tryStr(o.component_id) ??
    tryStr(o.id) ??
    tryStr(o.blockId) ??
    tryStr(o.block_id) ??
    tryStr(o.elementId) ??
    tryStr(o.element_id) ??
    tryStr(o.puckId) ??
    tryStr(o.puck_id);
  if (fromTop) {
    return fromTop;
  }
  const comp = o.component;
  if (isPlainObject(comp) && tryStr(comp.id)) {
    return tryStr(comp.id);
  }
  const props = o.props;
  if (isPlainObject(props) && tryStr(props.id)) {
    return tryStr(props.id);
  }
  return null;
}

/**
 * Puck registers exact PascalCase types (e.g. ButtonGroup). LLMs often invent "HeaderGroup" / headergroup.
 */
function normalizePuckComponentType(raw: string): string {
  const t = raw.trim();
  if (!t) {
    return t;
  }
  const fold = t.toLowerCase().replace(/[\s_-]/g, "");
  if (fold === "headergroup" || fold === "headergroupbutton" || fold === "buttongroupheader") {
    return "ButtonGroup";
  }
  if (fold === "buttongroup") {
    return "ButtonGroup";
  }
  return t;
}

const BUTTON_GROUP_ALIGN = new Set(["left", "center", "right"]);

type ButtonGroupButton = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  target: "_self" | "_blank" | "_parent" | "_top";
};

/** Coerce one button entry to the shape ButtonGroupRender expects (matches page-builder-chat + ButtonGroupConfig). */
function normalizeButtonGroupButton(raw: unknown): ButtonGroupButton {
  const fallback: ButtonGroupButton = {
    label: "Button",
    href: "#",
    variant: "primary",
    target: "_self",
  };
  if (raw === undefined || raw === null) {
    return fallback;
  }
  if (typeof raw === "string") {
    const s = raw.trim();
    return { ...fallback, label: s || fallback.label };
  }
  if (!isPlainObject(raw)) {
    return fallback;
  }
  const o = raw;
  const label =
    typeof o.label === "string"
      ? o.label
      : typeof o.text === "string"
        ? o.text
        : typeof o.title === "string"
          ? o.title
          : typeof o.name === "string"
            ? o.name
            : fallback.label;
  const href =
    typeof o.href === "string"
      ? o.href
      : typeof o.url === "string"
        ? o.url
        : typeof o.link === "string"
          ? o.link
          : fallback.href;
  let variant: "primary" | "secondary" = "primary";
  if (o.variant === "secondary" || o.variant === "primary") {
    variant = o.variant;
  } else if (typeof o.variant === "string" && o.variant.toLowerCase() === "secondary") {
    variant = "secondary";
  }
  let target: ButtonGroupButton["target"] = "_self";
  if (typeof o.target === "string" && ["_self", "_blank", "_parent", "_top"].includes(o.target)) {
    target = o.target as ButtonGroupButton["target"];
  }
  const lt = typeof label === "string" ? label.trim() : "";
  return { label: lt || fallback.label, href, variant, target };
}

/**
 * LLMs often emit wrong keys (ctas, items) or partial button objects. Puck needs:
 * { align: "left"|"center"|"right", buttons: [{ label, href, variant, target }, ...] }
 */
function normalizeButtonGroupPropsForPuck(raw: Record<string, unknown>): Record<string, unknown> {
  let list: unknown =
    raw.buttons ??
    raw.ctas ??
    raw.items ??
    raw.buttonList ??
    raw.actions ??
    raw.actionButtons;
  if (list === undefined && raw.button !== undefined && isPlainObject(raw.button)) {
    list = [raw.button];
  }
  if (list !== undefined && !Array.isArray(list) && isPlainObject(list)) {
    list = [list];
  }
  let buttons: ButtonGroupButton[];
  if (!Array.isArray(list) || list.length === 0) {
    buttons = [normalizeButtonGroupButton(undefined)];
  } else {
    buttons = list.map((item) => normalizeButtonGroupButton(item));
  }
  const alignRaw = raw.align;
  const align =
    typeof alignRaw === "string" && BUTTON_GROUP_ALIGN.has(alignRaw) ? alignRaw : "left";
  return { align, buttons };
}

function coercePropsRecord(v: unknown): Record<string, unknown> {
  if (isPlainObject(v)) {
    return v;
  }
  return {};
}

/**
 * LLM / user phrasing: "centre", color vs textColor, "size 4" meaning heading level 4.
 */
function normalizeMergePropsFromLlm(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...props };
  const align = out.align;
  if (typeof align === "string" && align.toLowerCase() === "centre") {
    out.align = "center";
  }
  if (out.textColor === undefined && typeof out.color === "string" && out.color.trim()) {
    out.textColor = out.color.trim();
    delete out.color;
  }
  const sz = out.size;
  if (out.level === undefined) {
    if (sz === 4 || sz === "4") {
      out.level = "4";
      delete out.size;
    } else if (typeof sz === "string" && /^[1-6]$/.test(sz)) {
      out.level = sz;
      delete out.size;
    } else if (typeof sz === "number" && sz >= 1 && sz <= 6 && Number.isInteger(sz)) {
      out.level = String(sz);
      delete out.size;
    }
  }
  return out;
}

type CoerceCommandResult = { ok: true; command: PageBuilderCommand } | { ok: false; message: string };

/**
 * Coerce a loosely-typed / LLM-shaped object into PageBuilderCommand.
 * Handles camelCase `kind`, snake_case field aliases, and case-insensitive `target`.
 */
export function coercePageBuilderCommand(input: unknown): CoerceCommandResult {
  if (typeof input === "string") {
    try {
      return coercePageBuilderCommand(JSON.parse(input) as unknown);
    } catch {
      return { ok: false, message: "Command must be a JSON object" };
    }
  }
  if (!isPlainObject(input)) {
    return { ok: false, message: "Command must be an object" };
  }
  const o = input;
  const rawKind = o.kind;
  if (typeof rawKind !== "string") {
    return { ok: false, message: "Missing or invalid kind" };
  }
  const kind = normalizeCommandKind(rawKind);
  if (!kind) {
    return { ok: false, message: `Unknown command kind: ${JSON.stringify(rawKind)}` };
  }

  switch (kind) {
    case "set_page_key": {
      const key = o.key;
      if (typeof key !== "string" || !key.trim()) {
        return { ok: false, message: "set_page_key requires a non-empty string key" };
      }
      return { ok: true, command: { kind, key: key.trim() } };
    }
    case "merge_root_props": {
      const target = coerceTarget(o.target);
      if (!target) {
        return { ok: false, message: "merge_root_props requires target: main | header | footer" };
      }
      return { ok: true, command: { kind, target, props: coercePropsRecord(o.props) } };
    }
    case "clear_content": {
      const target = coerceTarget(o.target);
      if (!target) {
        return { ok: false, message: "clear_content requires target: main | header | footer" };
      }
      return { ok: true, command: { kind, target } };
    }
    case "append_component": {
      const target = coerceTarget(o.target);
      if (!target) {
        return { ok: false, message: "append_component requires target: main | header | footer" };
      }
      const componentTypeRaw = o.componentType ?? o.component_type ?? o.type;
      if (typeof componentTypeRaw !== "string" || !componentTypeRaw.trim()) {
        return { ok: false, message: "append_component requires componentType (Puck widget name)" };
      }
      const componentType = normalizePuckComponentType(componentTypeRaw);
      const id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : undefined;
      const props = o.props !== undefined ? coercePropsRecord(o.props) : undefined;
      return { ok: true, command: { kind, target, componentType, ...(props !== undefined ? { props } : {}), ...(id ? { id } : {}) } };
    }
    case "remove_component":
    case "merge_component_props": {
      let target = coerceTarget(o.target);
      /** LLMs often omit target or use "content"/"body"/"page". Default main instead of failing. */
      if (!target) {
        target = "main";
      }
      const componentId = coerceComponentIdFromCommand(o);
      if (!componentId) {
        return { ok: false, message: `${kind} requires componentId` };
      }
      if (kind === "remove_component") {
        return { ok: true, command: { kind, target, componentId } };
      }
      let mergeProps = normalizeMergePropsFromLlm(coercePropsRecord(o.props));
      if (isPlainObject(o.props) && typeof o.props.id === "string" && o.props.id.trim() === componentId) {
        const { id: _removed, ...rest } = mergeProps;
        mergeProps = rest;
      }
      return {
        ok: true,
        command: {
          kind,
          target,
          componentId,
          props: mergeProps,
        },
      };
    }
    case "replace_zones": {
      const target = coerceTarget(o.target);
      if (!target) {
        return { ok: false, message: "replace_zones requires target: main | header | footer" };
      }
      if (!isPlainObject(o.zones)) {
        return { ok: false, message: "replace_zones requires zones object" };
      }
      return { ok: true, command: { kind, target, zones: o.zones as Record<string, Data["content"]> } };
    }
    default: {
      const _exhaustive: never = kind;
      return { ok: false, message: `Unhandled kind: ${_exhaustive}` };
    }
  }
}

export interface ApplyPageBuilderCommandsResult {
  page: IPageStructure;
  applied: number;
  errors: ApplyPageBuilderCommandError[];
}

export interface ApplyPageBuilderCommandError {
  commandIndex: number;
  message: string;
}

function newId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 10)}`;
  return `${prefix}-${suffix}`;
}

function clonePageStructure(page: IPageStructure): IPageStructure {
  return structuredClone(page) as IPageStructure;
}

function isComponentList(value: unknown): value is Data["content"] {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }
  return value.every((item) => item && typeof item === "object" && "type" in item && "props" in item);
}

function getComponentId(item: { type?: string; props?: { id?: string }; id?: string }): string | undefined {
  if (item.props && typeof item.props.id === "string") {
    return item.props.id;
  }
  if (typeof item.id === "string") {
    return item.id;
  }
  return undefined;
}

function pickData(page: IPageStructure, target: PageBuilderCommandTarget): IExtendedData {
  if (target === "header") {
    if (!page.headerData) {
      page.headerData = { content: [], root: { props: {} } };
    }
    return page.headerData as IExtendedData;
  }
  if (target === "footer") {
    if (!page.footerData) {
      page.footerData = { content: [], root: { props: {} } };
    }
    return page.footerData as IExtendedData;
  }
  return page.data;
}

function ensureDataShape(data: IExtendedData): void {
  if (!data.content) {
    data.content = [];
  }
  if (!data.root || typeof data.root !== "object") {
    data.root = { props: {} };
    return;
  }
  const r = data.root as Record<string, unknown>;
  if (Object.keys(r).length === 0) {
    r.props = {};
  }
}

/**
 * Puck expects root component props on `data.root.props` (see @measured/puck: rootProps = data.root.props || data.root).
 * Flat fields on `root` are deprecated; merge here so merge_root_props and LLM output match saved Puck JSON.
 */
function mergeRootProps(data: IExtendedData, props: Record<string, unknown>): void {
  ensureDataShape(data);
  const root = data.root as Record<string, unknown>;
  const readOnly = root.readOnly;
  const existingProps =
    root.props && typeof root.props === "object" && !Array.isArray(root.props)
      ? { ...(root.props as Record<string, unknown>) }
      : {};
  const flat: Record<string, unknown> = {};
  for (const key of Object.keys(root)) {
    if (key === "props" || key === "readOnly") {
      continue;
    }
    flat[key] = root[key];
    delete root[key];
  }
  root.props = { ...existingProps, ...flat, ...props };
  if (readOnly !== undefined) {
    root.readOnly = readOnly;
  }
}

function removeComponentByIdFromArray(arr: Data["content"], componentId: string): boolean {
  const idx = arr.findIndex((item) => getComponentId(item) === componentId);
  if (idx !== -1) {
    arr.splice(idx, 1);
    return true;
  }
  for (const item of arr) {
    if (item.props && typeof item.props === "object") {
      for (const value of Object.values(item.props as Record<string, unknown>)) {
        if (isComponentList(value) && removeComponentByIdFromArray(value, componentId)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Znode saved pages keep `widgets[]` in sync with Widget props (see visual-editor / publish JSON).
 * Register master + instance widgetKey entries when appending a Puck block with config.type === "Widget".
 * Call after **merge** updates to `widgetConfig.widgetKey` so `page.widgets` stays in sync.
 */
export function registerWidgetsFromPuckAppend(
  page: IPageStructure,
  componentType: string,
  props: Record<string, unknown>
): void {
  const cfg = props.config;
  if (!isPlainObject(cfg) || cfg.type !== "Widget") {
    return;
  }
  const wc = cfg.widgetConfig;
  if (!isPlainObject(wc)) {
    return;
  }
  const type =
    typeof wc.widgetCode === "string" && wc.widgetCode.trim() ? wc.widgetCode.trim() : componentType;
  const master =
    wc.masterWidgetKey !== undefined && wc.masterWidgetKey !== null
      ? String(wc.masterWidgetKey).trim()
      : "";
  const wk =
    wc.widgetKey !== undefined && wc.widgetKey !== null ? String(wc.widgetKey).trim() : "";
  if (!wk) {
    return;
  }
  const list: PWidget[] = page.widgets ?? [];
  const add = (key: string) => {
    if (!list.some((w) => w.widgetKey === key)) {
      list.push({ widgetKey: key, type });
    }
  };
  if (master) {
    add(master);
  }
  add(wk);
  page.widgets = list;
}

function mergeComponentPropsInArray(arr: Data["content"], componentId: string, props: Record<string, unknown>): boolean {
  for (const item of arr) {
    if (getComponentId(item) === componentId && item.props && typeof item.props === "object") {
      item.props = { ...item.props, ...props };
      return true;
    }
    if (item.props && typeof item.props === "object") {
      for (const value of Object.values(item.props as Record<string, unknown>)) {
        if (isComponentList(value) && mergeComponentPropsInArray(value, componentId, props)) {
          return true;
        }
      }
    }
  }
  return false;
}

function applyOne(page: IPageStructure, command: PageBuilderCommand): string | null {
  switch (command.kind) {
    case "set_page_key": {
      page.key = command.key;
      return null;
    }
    case "merge_root_props": {
      const data = pickData(page, command.target);
      mergeRootProps(data, command.props);
      return null;
    }
    case "clear_content": {
      const data = pickData(page, command.target);
      ensureDataShape(data);
      data.content = [];
      return null;
    }
    case "append_component": {
      const data = pickData(page, command.target);
      ensureDataShape(data);
      const id = command.id ?? newId(command.componentType);
      let merged: Record<string, unknown> = { ...(command.props ?? {}) };
      if (command.componentType === "ButtonGroup") {
        merged = normalizeButtonGroupPropsForPuck(merged);
      }
      const props = { ...merged, id };
      data.content.push({ type: command.componentType, props } as Data["content"][number]);
      registerWidgetsFromPuckAppend(page, command.componentType, props as Record<string, unknown>);
      return null;
    }
    case "remove_component": {
      const data = pickData(page, command.target);
      ensureDataShape(data);
      const removed = removeComponentByIdFromArray(data.content, command.componentId);
      return removed ? null : `No component with id "${command.componentId}"`;
    }
    case "merge_component_props": {
      const data = pickData(page, command.target);
      ensureDataShape(data);
      const updated = mergeComponentPropsInArray(data.content, command.componentId, command.props);
      return updated ? null : `No component with id "${command.componentId}"`;
    }
    case "replace_zones": {
      const data = pickData(page, command.target);
      ensureDataShape(data);
      data.zones = { ...command.zones };
      return null;
    }
    default:
      return "Unknown command";
  }
}

/**
 * Applies declarative commands to a copy of the page structure.
 * Does not call APIs or the visual editor — safe to run in isolation from the Puck UI and server save path.
 */
export function applyPageBuilderCommands(page: IPageStructure, commands: readonly unknown[]): ApplyPageBuilderCommandsResult {
  const next = clonePageStructure(page);
  const errors: ApplyPageBuilderCommandError[] = [];
  let applied = 0;

  commands.forEach((raw, commandIndex) => {
    const coerced = coercePageBuilderCommand(raw);
    if (!coerced.ok) {
      errors.push({ commandIndex, message: coerced.message });
      return;
    }
    const err = applyOne(next, coerced.command);
    if (err) {
      errors.push({ commandIndex, message: err });
    } else {
      applied += 1;
    }
  });

  return { page: next, applied, errors };
}
