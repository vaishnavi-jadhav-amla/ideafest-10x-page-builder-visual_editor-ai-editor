import type { PageBuilderCommand, PageBuilderCommandTarget } from "./commands";

function newWidgetId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Short help shown when nothing matches or user types "help". */
export const PLAIN_TEXT_COMMANDS_HELP = `Local plain-text commands (no API key). One instruction per line:

  set page key <url-key>     e.g. set page key category/{}
  set title <text>           page root title (main)
  title: <text>              same as set title

  add text <text>            Text widget
  add text as "…"            Text (natural phrasing; smart quotes OK)
  add heading <text>         Heading widget
  add heading as "…"         Heading (natural phrasing)
  add heading "…" with color "…"   Heading + CSS color (colour OK)
  set heading as "…" and text as "…"   one line: Heading + Text (quotes required)
  add container              layout Container (Flex)
  add column                 Column widget (2 cols)
  add vertical space [Npx]   default 24px
  add button group           one primary button
  add button group labelled as "…"   ButtonGroup with that label (labeled as … also works)
  add empty box              EmptyBox widget

  clear [content]            clears main content
  remove <component-id>      remove by props.id

Examples:
  set title Summer sale
  add heading Welcome
  add text Shop the collection.
  add vertical space 32px
`;

function targetFromToken(t: string | undefined): PageBuilderCommandTarget {
  if (t === "header" || t === "footer") {
    return t;
  }
  return "main";
}

/**
 * `add heading …` / `add text …` tails that mention styling but are not handled by a dedicated
 * pattern should not hit the catch-all matchers (so /api/chat can use the LLM).
 */
const LOCAL_STYLING_HINT = /\bwith\s+(color|colour|size|font|align|weight)\b/i;

/**
 * Convert conservative plain English / shorthand into PageBuilderCommand[].
 * Only lines that match known patterns produce commands (no guesswork for random prose).
 */
export function interpretPlainTextPageCommands(input: string): PageBuilderCommand[] {
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const commands: PageBuilderCommand[] = [];

  for (let raw of lines) {
    let m: RegExpMatchArray | null;
    let target: PageBuilderCommandTarget = "main";
    const targetPrefix = /^(main|header|footer)\s*:\s*/i;
    const tm = raw.match(targetPrefix);
    if (tm) {
      target = targetFromToken(tm[1].toLowerCase());
      raw = raw.slice(tm[0].length).trim();
    }
    const line = raw.replace(/\u201c|\u201d/g, '"').replace(/\u2018|\u2019/g, "'");
    const lower = line.toLowerCase();
    if (lower === "help" || lower === "?" || lower === "examples") {
      continue;
    }

    if ((m = line.match(/^set\s+page\s+key\s+(.+)$/i))) {
      commands.push({ kind: "set_page_key", key: m[1].trim() });
      continue;
    }
    if ((m = line.match(/^page\s+key\s+(.+)$/i))) {
      commands.push({ kind: "set_page_key", key: m[1].trim() });
      continue;
    }
    /** One-line: set heading as "…" and text as "…" (same as Ollama-friendly phrasing) */
    if (
      (m = line.match(/^(?:set\s+)?heading\s+as\s+"([^"]*)"\s+and\s+text\s+as\s+"([^"]*)"\s*$/i)) ||
      (m = line.match(/^(?:set\s+)?heading\s+as\s+'([^']*)'\s+and\s+text\s+as\s+'([^']*)'\s*$/i))
    ) {
      const headingText = m[1].trim() || "Heading";
      const bodyText = m[2].trim() || "New text";
      commands.push({
        kind: "append_component",
        target,
        componentType: "Heading",
        props: {
          align: "left",
          text: headingText,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
          padding: { top: "0", right: "0", bottom: "0", left: "0" },
          border: { width: "0", color: "black", style: "solid", borderRadius: 0 },
          size: "l",
          background: "transparent",
          textColor: "black",
          level: "2",
        },
        id: newWidgetId("Heading"),
      });
      commands.push({
        kind: "append_component",
        target,
        componentType: "Text",
        props: {
          align: "left",
          text: bodyText,
          padding: { top: "0", right: "0", bottom: "0", left: "0" },
          size: "m",
          color: "default",
          weight: "normal",
        },
        id: newWidgetId("Text"),
      });
      continue;
    }
    if ((m = line.match(/^set\s+title\s+(.+)$/i)) || (m = line.match(/^title:\s*(.+)$/i))) {
      commands.push({ kind: "merge_root_props", target, props: { title: m[1].trim() } });
      continue;
    }
    if ((m = line.match(/^title\s+(.+)$/i))) {
      commands.push({ kind: "merge_root_props", target, props: { title: m[1].trim() } });
      continue;
    }

    if (
      (m = line.match(/^add\s+text\s+as\s+"([^"]*)"\s*$/i)) ||
      (m = line.match(/^add\s+text\s+as\s+'([^']*)'\s*$/i))
    ) {
      const text = m[1].trim() || "New text";
      commands.push({
        kind: "append_component",
        target,
        componentType: "Text",
        props: {
          align: "left",
          text,
          padding: { top: "0", right: "0", bottom: "0", left: "0" },
          size: "m",
          color: "default",
          weight: "normal",
        },
        id: newWidgetId("Text"),
      });
      continue;
    }
    if ((m = line.match(/^add\s+text\s+as\s+(.+)$/i))) {
      const text = m[1].trim().replace(/^["']|["']$/g, "").trim() || "New text";
      commands.push({
        kind: "append_component",
        target,
        componentType: "Text",
        props: {
          align: "left",
          text,
          padding: { top: "0", right: "0", bottom: "0", left: "0" },
          size: "m",
          color: "default",
          weight: "normal",
        },
        id: newWidgetId("Text"),
      });
      continue;
    }

    if (
      (m = line.match(/^add\s+heading\s+as\s+"([^"]*)"\s*$/i)) ||
      (m = line.match(/^add\s+heading\s+as\s+'([^']*)'\s*$/i))
    ) {
      const text = m[1].trim() || "Heading";
      commands.push({
        kind: "append_component",
        target,
        componentType: "Heading",
        props: {
          align: "left",
          text,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
          padding: { top: "0", right: "0", bottom: "0", left: "0" },
          border: { width: "0", color: "black", style: "solid", borderRadius: 0 },
          size: "l",
          background: "transparent",
          textColor: "black",
          level: "2",
        },
        id: newWidgetId("Heading"),
      });
      continue;
    }
    if ((m = line.match(/^add\s+heading\s+as\s+(.+)$/i))) {
      const text = m[1].trim().replace(/^["']|["']$/g, "").trim() || "Heading";
      commands.push({
        kind: "append_component",
        target,
        componentType: "Heading",
        props: {
          align: "left",
          text,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
          padding: { top: "0", right: "0", bottom: "0", left: "0" },
          border: { width: "0", color: "black", style: "solid", borderRadius: 0 },
          size: "l",
          background: "transparent",
          textColor: "black",
          level: "2",
        },
        id: newWidgetId("Heading"),
      });
      continue;
    }

    if (
      (m = line.match(/^add\s+heading\s+"([^"]*)"\s+with\s+colou?r\s+"([^"]*)"\s*$/i)) ||
      (m = line.match(/^add\s+heading\s+'([^']*)'\s+with\s+colou?r\s+'([^']*)'\s*$/i))
    ) {
      const text = m[1].trim() || "Heading";
      const textColor = m[2].trim() || "black";
      commands.push({
        kind: "append_component",
        target,
        componentType: "Heading",
        props: {
          align: "left",
          text,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
          padding: { top: "0", right: "0", bottom: "0", left: "0" },
          border: { width: "0", color: "black", style: "solid", borderRadius: 0 },
          size: "l",
          background: "transparent",
          textColor,
          level: "2",
        },
        id: newWidgetId("Heading"),
      });
      continue;
    }
    if (
      (m = line.match(/^add\s+heading\s+"([^"]*)"\s+with\s+colou?r\s+(\S+)\s*$/i)) ||
      (m = line.match(/^add\s+heading\s+'([^']*)'\s+with\s+colou?r\s+(\S+)\s*$/i))
    ) {
      const text = m[1].trim() || "Heading";
      const textColor = m[2].trim() || "black";
      commands.push({
        kind: "append_component",
        target,
        componentType: "Heading",
        props: {
          align: "left",
          text,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
          padding: { top: "0", right: "0", bottom: "0", left: "0" },
          border: { width: "0", color: "black", style: "solid", borderRadius: 0 },
          size: "l",
          background: "transparent",
          textColor,
          level: "2",
        },
        id: newWidgetId("Heading"),
      });
      continue;
    }

    if ((m = line.match(/^add\s+text\s*(.*)$/i))) {
      const rest = m[1].trim();
      if (LOCAL_STYLING_HINT.test(rest)) {
        continue;
      }
      const text = rest || "New text";
      commands.push({
        kind: "append_component",
        target,
        componentType: "Text",
        props: {
          align: "left",
          text,
          padding: { top: "0", right: "0", bottom: "0", left: "0" },
          size: "m",
          color: "default",
          weight: "normal",
        },
        id: newWidgetId("Text"),
      });
      continue;
    }

    if ((m = line.match(/^add\s+heading\s*(.*)$/i))) {
      const rest = m[1].trim();
      if (LOCAL_STYLING_HINT.test(rest)) {
        continue;
      }
      const text = rest || "Heading";
      commands.push({
        kind: "append_component",
        target,
        componentType: "Heading",
        props: {
          align: "left",
          text,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
          padding: { top: "0", right: "0", bottom: "0", left: "0" },
          border: { width: "0", color: "black", style: "solid", borderRadius: 0 },
          size: "l",
          background: "transparent",
          textColor: "black",
          level: "2",
        },
        id: newWidgetId("Heading"),
      });
      continue;
    }

    if (/^add\s+container\s*$/i.test(raw)) {
      commands.push({
        kind: "append_component",
        target,
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
      });
      continue;
    }

    if (/^add\s+column\s*$/i.test(line)) {
      commands.push({
        kind: "append_component",
        target,
        componentType: "Column",
        props: {
          distribution: "auto",
          columns: [{}, {}],
          gap: 2,
          hasDropZoneDisabled: false,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
        },
        id: newWidgetId("Column"),
      });
      continue;
    }

    if ((m = line.match(/^add\s+vertical\s*space(?:\s+(\d+)\s*px)?\s*$/i))) {
      const size = m[1] ? `${m[1]}px` : "24px";
      commands.push({
        kind: "append_component",
        target,
        componentType: "VerticalSpacing",
        props: { size },
        id: newWidgetId("VerticalSpacing"),
      });
      continue;
    }

    if (/^add\s+button\s*group\s*$/i.test(line)) {
      commands.push({
        kind: "append_component",
        target,
        componentType: "ButtonGroup",
        props: {
          align: "left",
          buttons: [{ label: "Button", href: "#", variant: "primary", target: "_self" }],
        },
        id: newWidgetId("ButtonGroup"),
      });
      continue;
    }
    if (
      (m = line.match(/^add\s+button\s*group\s+label(?:led|ed)?\s+as\s+"([^"]+)"\s*$/i)) ||
      (m = line.match(/^add\s+button\s*group\s+label(?:led|ed)?\s+as\s+'([^']+)'\s*$/i))
    ) {
      const label = m[1].trim() || "Button";
      commands.push({
        kind: "append_component",
        target,
        componentType: "ButtonGroup",
        props: {
          align: "left",
          buttons: [{ label, href: "#", variant: "primary", target: "_self" }],
        },
        id: newWidgetId("ButtonGroup"),
      });
      continue;
    }
    if ((m = line.match(/^add\s+button\s*group\s+label(?:led|ed)?\s+as\s+(.+)$/i))) {
      const label = m[1].trim().replace(/^["']|["']$/g, "") || "Button";
      commands.push({
        kind: "append_component",
        target,
        componentType: "ButtonGroup",
        props: {
          align: "left",
          buttons: [{ label, href: "#", variant: "primary", target: "_self" }],
        },
        id: newWidgetId("ButtonGroup"),
      });
      continue;
    }

    if (/^add\s+empty\s*box\s*$/i.test(line)) {
      commands.push({
        kind: "append_component",
        target,
        componentType: "EmptyBox",
        props: {},
        id: newWidgetId("EmptyBox"),
      });
      continue;
    }

    if ((m = line.match(/^add\s+product\s*list(?:\s+(.+))?$/i))) {
      const hint = (m[1] || "category").trim().toLowerCase();
      const configId = hint.includes("product") ? "product" : "category";
      commands.push({
        kind: "append_component",
        target,
        componentType: "ProductListPage",
        props: { config: { id: configId } },
        id: newWidgetId("ProductListPage"),
      });
      continue;
    }

    if (/^add\s+product\s*details\s*$/i.test(line)) {
      commands.push({
        kind: "append_component",
        target,
        componentType: "ProductDetailsPage",
        props: { config: { id: "product" } },
        id: newWidgetId("ProductDetailsPage"),
      });
      continue;
    }

    if (/^clear(\s+content)?\s*$/i.test(line)) {
      commands.push({ kind: "clear_content", target });
      continue;
    }

    if ((m = line.match(/^remove(?:\s+component)?\s+(\S.+)$/i))) {
      commands.push({ kind: "remove_component", target, componentId: m[1].trim() });
      continue;
    }
  }

  return commands;
}

export function isPlainTextHelpRequest(input: string): boolean {
  const t = input.trim().toLowerCase();
  return t === "help" || t === "?" || t === "examples";
}
