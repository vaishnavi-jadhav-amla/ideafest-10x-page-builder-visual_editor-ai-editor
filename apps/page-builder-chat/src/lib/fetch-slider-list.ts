import dns from "node:dns";
import https from "node:https";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";

dns.setDefaultResultOrder("ipv4first");

const DEFAULT_SLIDER_LIST_URL = "https://apigateways-z10-dev10.znodecorp.com/Slider/SliderList";

const DEFAULT_SAVE_CMS_WIDGET_SLIDER_BANNER_URL =
  "https://apigateways-z10-dev10.znodecorp.com/CMSWidgetConfiguration/SaveCMSWidgetSliderBanner";

const DEFAULT_GET_CMS_WIDGET_SLIDER_BANNER_URL =
  "https://apigateways-z10-dev10.znodecorp.com/CMSWidgetConfiguration/GetCMSWidgetSliderBanner";

const DEFAULT_SAVE_CMS_CONTAINER_DETAILS_URL =
  "https://apigateways-z10-dev10.znodecorp.com/CMSWidgetConfiguration/SaveCmsContainerDetails";

const DEFAULT_CREATE_UPDATE_LINK_WIDGET_URL =
  "https://apigateways-z10-dev10.znodecorp.com/CMSWidgetConfiguration/CreateUpdateLinkWidgetConfiguration";

/** One row from SliderList: master key for Puck + gateway row id for SaveCMSWidgetSliderBanner. */
export type BannerSliderChoice = {
  /** CMS master widget key for `widgetConfig.masterWidgetKey` (e.g. `"8"`). */
  masterWidgetKey: string;
  /** `CMSSliderId` in SaveCMSWidgetSliderBanner body. */
  cmsSliderId: number;
  label: string;
};

function parseFiniteInt(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.trunc(v);
  }
  if (v == null) {
    return undefined;
  }
  const s = String(v).trim();
  if (!s) {
    return undefined;
  }
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

function envInt(name: string, defaultVal: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return defaultVal;
  }
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : defaultVal;
}

function useInsecureTlsForSliderUpstream(): boolean {
  const raw =
    process.env.PAGE_BUILDER_SLIDER_TLS_INSECURE?.trim() ||
    process.env.PAGE_BUILDER_PUBLISH_PREVIEW_TLS_INSECURE?.trim();
  const v = raw?.toLowerCase();
  if (v === "0" || v === "false" || v === "no") {
    return false;
  }
  if (v === "1" || v === "true" || v === "yes") {
    return true;
  }
  return process.env.NODE_ENV !== "production";
}

function isGatewayCurlDebugEnabled(): boolean {
  const v = process.env.PAGE_BUILDER_DEBUG_GATEWAY_CURL?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** Logs a copy-paste curl when PAGE_BUILDER_DEBUG_GATEWAY_CURL=1 (may include Basic auth — do not commit logs). */
function logGatewayCurlEquivalent(
  label: string,
  method: "GET" | "PUT" | "POST",
  url: string,
  headers: Record<string, string>,
  jsonBody?: string
): void {
  if (!isGatewayCurlDebugEnabled()) {
    return;
  }
  const parts: string[] = [`# ${label}`];
  if (useInsecureTlsForSliderUpstream()) {
    parts.push("# App uses TLS insecure mode for this upstream; add curl -k if certificate verification fails.");
  }
  parts.push(`curl --location ${JSON.stringify(url)}`, `--request ${method}`);
  for (const [k, v] of Object.entries(headers)) {
    parts.push(`--header ${JSON.stringify(`${k}: ${v}`)}`);
  }
  if ((method === "PUT" || method === "POST") && jsonBody !== undefined) {
    if (!headers["Content-Type"] && !headers["content-type"]) {
      parts.push(`--header ${JSON.stringify("Content-Type: application/json")}`);
    }
    parts.push(`--data ${JSON.stringify(jsonBody)}`);
  }
  console.log("[PAGE_BUILDER_DEBUG_GATEWAY_CURL]\n" + parts.join(" \\\n  "));
}

function httpsGet(urlStr: string, headers: Record<string, string>): Promise<{ statusCode: number; body: string }> {
  const url = new URL(urlStr);
  const insecure = useInsecureTlsForSliderUpstream();
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers,
        servername: url.hostname,
        ...(insecure ? { rejectUnauthorized: false } : {}),
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode ?? 500,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function httpsPutJson(
  urlStr: string,
  headers: Record<string, string>,
  payload: Record<string, unknown>
): Promise<{ statusCode: number; body: string }> {
  const body = JSON.stringify(payload);
  const url = new URL(urlStr);
  const insecure = useInsecureTlsForSliderUpstream();
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body, "utf8"),
        },
        servername: url.hostname,
        ...(insecure ? { rejectUnauthorized: false } : {}),
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode ?? 500,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      }
    );
    req.on("error", reject);
    req.write(body, "utf8");
    req.end();
  });
}

function httpsPostJson(
  urlStr: string,
  headers: Record<string, string>,
  payload: Record<string, unknown>,
  contentType = "application/json"
): Promise<{ statusCode: number; body: string }> {
  const body = JSON.stringify(payload);
  const url = new URL(urlStr);
  const insecure = useInsecureTlsForSliderUpstream();
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": contentType,
          "Content-Length": Buffer.byteLength(body, "utf8"),
        },
        servername: url.hostname,
        ...(insecure ? { rejectUnauthorized: false } : {}),
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode ?? 500,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      }
    );
    req.on("error", reject);
    req.write(body, "utf8");
    req.end();
  });
}

/** Case-insensitive read of first matching key (gateway APIs vary in casing). */
function getKeyCI(o: Record<string, unknown>, ...candidates: string[]): unknown {
  const lowerToActual = new Map<string, string>();
  for (const k of Object.keys(o)) {
    lowerToActual.set(k.toLowerCase(), k);
  }
  for (const c of candidates) {
    const actual = lowerToActual.get(c.toLowerCase());
    if (actual === undefined) {
      continue;
    }
    const v = o[actual];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return v;
    }
  }
  return undefined;
}

/** Unwrap `data` / `Data` / `Result` when the API returns JSON as a string. */
function unwrapMaybeJsonString(node: unknown): unknown {
  if (typeof node === "string") {
    const t = node.trim();
    if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
      try {
        return JSON.parse(t) as unknown;
      } catch {
        return node;
      }
    }
  }
  return node;
}

function extractArrayFromSliderPayload(raw: unknown): unknown[] {
  let root = unwrapMaybeJsonString(raw);
  root = unwrapMaybeJsonString(
    root && typeof root === "object"
      ? (root as Record<string, unknown>).data ?? (root as Record<string, unknown>).Data
      : root
  );

  if (Array.isArray(root)) {
    return root;
  }
  if (!root || typeof root !== "object") {
    return [];
  }
  const o = root as Record<string, unknown>;
  const candidates = [
    o.data,
    o.Data,
    o.result,
    o.Result,
    o.sliderList,
    o.SliderList,
    o.sliders,
    o.Sliders,
    o.items,
    o.Items,
    o.list,
    o.List,
    o.records,
    o.Records,
    o.rows,
    o.Rows,
    o.model,
    o.Model,
    o.body,
    o.Body,
  ];
  for (const c of candidates) {
    const u = unwrapMaybeJsonString(c);
    if (Array.isArray(u)) {
      return u;
    }
    if (u && typeof u === "object") {
      const inner = u as Record<string, unknown>;
      for (const k of ["data", "Data", "list", "List", "items", "Items", "sliderList", "sliders", "Sliders"]) {
        const v = unwrapMaybeJsonString(inner[k]);
        if (Array.isArray(v)) {
          return v;
        }
      }
    }
  }
  return [];
}

/** Collect every array of plain objects (for unknown gateway shapes). */
function collectObjectArrays(node: unknown, depth: number, out: unknown[][]): void {
  if (depth > 16 || node === null || node === undefined) {
    return;
  }
  const n = unwrapMaybeJsonString(node);
  if (Array.isArray(n)) {
    if (
      n.length > 0 &&
      n.every((x) => x !== null && typeof x === "object" && !Array.isArray(x))
    ) {
      out.push(n);
    }
    for (const x of n) {
      collectObjectArrays(x, depth + 1, out);
    }
    return;
  }
  if (typeof n === "object") {
    for (const v of Object.values(n as Record<string, unknown>)) {
      collectObjectArrays(v, depth + 1, out);
    }
  }
}

function rowToChoice(row: unknown): BannerSliderChoice | null {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return null;
  }
  const o = row as Record<string, unknown>;

  let cmsSliderId = parseFiniteInt(
    getKeyCI(o, "CMSSliderId", "cmsSliderId", "CmsSliderId", "sliderId", "SliderId", "SliderCode")
  );
  if (cmsSliderId === undefined) {
    cmsSliderId = parseFiniteInt(getKeyCI(o, "id", "Id"));
  }

  const masterRaw = getKeyCI(
    o,
    "masterWidgetKey",
    "widgetKey",
    "WidgetKey",
    "sliderKey",
    "SliderKey",
    "widgetCode",
    "code",
    "Code",
    "key",
    "Key",
    "guid",
    "Guid",
    "uuid",
    "UUID"
  );
  let masterWidgetKey: string;
  if (masterRaw !== undefined && masterRaw !== null && String(masterRaw).trim() !== "") {
    masterWidgetKey = String(masterRaw).trim();
  } else if (cmsSliderId !== undefined) {
    // SliderList rows may omit widgetKey; use CMSSliderId as master for Puck/widgetKey composite.
    masterWidgetKey = String(cmsSliderId);
  } else {
    return null;
  }

  if (cmsSliderId === undefined && /^\d+$/.test(masterWidgetKey)) {
    cmsSliderId = parseFiniteInt(masterWidgetKey);
  }
  if (cmsSliderId === undefined) {
    return null;
  }

  const labelRaw =
    getKeyCI(
      o,
      "displayName",
      "name",
      "Name",
      "title",
      "Title",
      "sliderName",
      "SliderName",
      "description",
      "Description",
      "label",
      "Label"
    ) ?? masterWidgetKey;
  return {
    masterWidgetKey,
    cmsSliderId,
    label: String(labelRaw).trim() || masterWidgetKey,
  };
}

function bestSliderRowsFromPayload(parsed: unknown): unknown[] {
  const direct = extractArrayFromSliderPayload(parsed);
  const fromDirect = direct.map(rowToChoice).filter((x): x is BannerSliderChoice => x !== null);
  if (fromDirect.length > 0) {
    return direct;
  }

  const buckets: unknown[][] = [];
  collectObjectArrays(parsed, 0, buckets);
  let best: unknown[] = [];
  let bestScore = 0;
  for (const arr of buckets) {
    const choices = arr.map(rowToChoice).filter((x): x is BannerSliderChoice => x !== null);
    if (choices.length > bestScore) {
      bestScore = choices.length;
      best = arr;
    }
  }
  return best;
}

/**
 * Server-side GET to gateway SliderList (Basic auth). Does not expose credentials to the browser.
 */
export async function fetchBannerSliderChoicesFromGateway(): Promise<
  { ok: true; items: BannerSliderChoice[] } | { ok: false; error: string; detail?: string }
> {
  const url = process.env.PAGE_BUILDER_SLIDER_LIST_URL?.trim() || DEFAULT_SLIDER_LIST_URL;
  const authRaw =
    process.env.PAGE_BUILDER_SLIDER_AUTHORIZATION?.trim() ||
    process.env.PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION?.trim();
  if (!authRaw) {
    return { ok: false, error: "missing_auth" };
  }
  const authorization = authRaw.startsWith("Basic ") ? authRaw : `Basic ${authRaw}`;

  const sliderListHeaders = { Authorization: authorization, Accept: "application/json" };
  logGatewayCurlEquivalent("GET SliderList (banner slider picker)", "GET", url, sliderListHeaders);

  let res: { statusCode: number; body: string };
  try {
    res = await httpsGet(url, sliderListHeaders);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: "request_failed", detail: msg };
  }

  if (res.statusCode < 200 || res.statusCode >= 300) {
    return {
      ok: false,
      error: "upstream_status",
      detail: `${res.statusCode}: ${res.body.slice(0, 400)}`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(res.body) as unknown;
  } catch {
    return { ok: false, error: "invalid_json", detail: res.body.slice(0, 200) };
  }

  parsed = unwrapMaybeJsonString(parsed);
  if (parsed && typeof parsed === "object") {
    const root = parsed as Record<string, unknown>;
    const inner = root.data ?? root.Data ?? root.result ?? root.Result;
    parsed = unwrapMaybeJsonString(inner) ?? parsed;
  }

  const rows = bestSliderRowsFromPayload(parsed);
  let items = rows.map(rowToChoice).filter((x): x is BannerSliderChoice => x !== null);

  if (items.length === 0 && parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const one = rowToChoice(parsed);
    if (one) {
      items = [one];
    }
  }

  if (items.length === 0) {
    const preview =
      typeof parsed === "object" && parsed !== null
        ? JSON.stringify(parsed).slice(0, 800)
        : String(parsed).slice(0, 400);
    return {
      ok: false,
      error: "empty_list",
      detail:
        "No sliders parsed from API response. Top-level JSON preview (trimmed):\n" +
        preview +
        "\n\nIf keys differ, extend rowToChoice / extractArray in fetch-slider-list.ts or set PAGE_BUILDER_SLIDER_LIST_URL to an endpoint that returns a JSON array of slider rows.",
    };
  }

  return { ok: true, items };
}

function buildGetCmsWidgetSliderBannerUrl(widgetsKey: string): string {
  const base =
    process.env.PAGE_BUILDER_GET_CMS_WIDGET_SLIDER_BANNER_URL?.trim() || DEFAULT_GET_CMS_WIDGET_SLIDER_BANNER_URL;
  const mappingId = envInt("PAGE_BUILDER_CMS_MAPPING_ID", 7);
  const typeOfMapping = process.env.PAGE_BUILDER_CMS_TYPE_OF_MAPPING?.trim() || "PortalMapping";
  const filter = `CMSMappingId~eq~${mappingId},WidgetsKey~is~${widgetsKey},TypeOFMapping~is~${typeOfMapping}`;
  const u = new URL(base);
  u.searchParams.set("filter", filter);
  return u.toString();
}

export type CmsWidgetSliderBannerMeta = {
  cmsWidgetSliderBannerId?: number;
  cmsWidgetsId?: number;
  cmsSliderId?: number;
};

/** Strip JSON-as-string and common gateway wrappers (`data` / `Result` chains). */
function unwrapGetCmsWidgetSliderBannerPayload(node: unknown): unknown {
  let n: unknown = node;
  for (let i = 0; i < 8; i++) {
    const asString = unwrapMaybeJsonString(n);
    if (asString !== n) {
      n = asString;
      continue;
    }
    if (!n || typeof n !== "object" || Array.isArray(n)) {
      return n;
    }
    const o = n as Record<string, unknown>;
    const inner = o.data ?? o.Data ?? o.result ?? o.Result ?? o.response ?? o.Response;
    if (inner !== undefined && inner !== null) {
      n = inner;
      continue;
    }
    return n;
  }
  return n;
}

function recordHasCmsWidgetSliderBannerFields(o: Record<string, unknown>): boolean {
  return (
    getKeyCI(o, "CMSWidgetSliderBannerId", "cmsWidgetSliderBannerId", "CmsWidgetSliderBannerId") !== undefined ||
    getKeyCI(o, "CMSWidgetsId", "cmsWidgetsId", "CmsWidgetsId") !== undefined ||
    getKeyCI(o, "CMSSliderId", "cmsSliderId", "CmsSliderId") !== undefined ||
    getKeyCI(o, "WidgetsKey", "widgetsKey", "WidgetKey") !== undefined
  );
}

function extractRowsFromGetCmsWidgetSliderBannerJson(parsed: unknown): unknown[] {
  const root = unwrapGetCmsWidgetSliderBannerPayload(parsed);
  if (Array.isArray(root)) {
    return root;
  }
  if (!root || typeof root !== "object") {
    return [];
  }
  const o = root as Record<string, unknown>;

  const odataVal = o["@odata.value"];
  if (Array.isArray(odataVal)) {
    return odataVal;
  }
  const d = o.d ?? o.D;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    const dr = (d as Record<string, unknown>).results ?? (d as Record<string, unknown>).Results;
    if (Array.isArray(dr)) {
      return dr;
    }
  }

  const directArrays = [
    o.value,
    o.Value,
    o.data,
    o.Data,
    o.items,
    o.Items,
    o.results,
    o.Results,
    o.CMSWidgetSliderBanners,
    o.cmsWidgetSliderBanners,
    o.CMSWidgetSliderBannerList,
    o.cmsWidgetSliderBannerList,
  ];
  for (const c of directArrays) {
    if (Array.isArray(c)) {
      return c;
    }
  }

  const singletonKeys = [
    "value",
    "Value",
    "data",
    "Data",
    "result",
    "Result",
    "model",
    "Model",
    "response",
    "Response",
  ];
  for (const key of singletonKeys) {
    const c = o[key];
    if (c && typeof c === "object" && !Array.isArray(c)) {
      const rec = c as Record<string, unknown>;
      if (recordHasCmsWidgetSliderBannerFields(rec)) {
        return [rec];
      }
    }
  }

  for (const c of directArrays) {
    if (c && typeof c === "object" && !Array.isArray(c)) {
      const inner = c as Record<string, unknown>;
      const v =
        inner.value ??
        inner.Value ??
        inner.items ??
        inner.Items ??
        inner.results ??
        inner.Results;
      if (Array.isArray(v)) {
        return v;
      }
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const rec = v as Record<string, unknown>;
        if (recordHasCmsWidgetSliderBannerFields(rec)) {
          return [rec];
        }
      }
    }
  }

  if (recordHasCmsWidgetSliderBannerFields(o)) {
    return [root];
  }

  return [];
}

function normalizeCmsNumericValue(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.trunc(v);
  }
  if (typeof v === "bigint") {
    return Number(v);
  }
  if (typeof v === "string" && v.trim()) {
    const t = v.trim();
    const n = parseInt(t, 10);
    if (Number.isFinite(n)) {
      return n;
    }
    const f = parseFloat(t);
    if (Number.isFinite(f)) {
      return Math.trunc(f);
    }
  }
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const w = v as Record<string, unknown>;
    return normalizeCmsNumericValue(w.value ?? w.Value ?? w.data ?? w.Data);
  }
  return undefined;
}

function readNumericField(o: Record<string, unknown>, ...candidates: string[]): number | undefined {
  const v = getKeyCI(o, ...candidates);
  return normalizeCmsNumericValue(v);
}

/**
 * Walk entire JSON tree; match property names case-insensitively so odd gateway/OData shapes still yield ids.
 */
function scanForBannerMetaByKeyPatterns(node: unknown): CmsWidgetSliderBannerMeta {
  const out: CmsWidgetSliderBannerMeta = {};
  const visit = (n: unknown, depth: number): void => {
    if (depth > 32 || n === null || n === undefined) {
      return;
    }
    if (Array.isArray(n)) {
      for (const x of n) {
        visit(x, depth + 1);
      }
      return;
    }
    if (typeof n !== "object") {
      return;
    }
    const o = n as Record<string, unknown>;
    for (const [key, v] of Object.entries(o)) {
      const kl = key.replace(/\s/g, "").toLowerCase();
      const num = normalizeCmsNumericValue(v);
      if (num === undefined) {
        continue;
      }
      if (
        kl === "cmswidgetsliderbannerid" ||
        (kl.includes("widgetsliderbanner") && kl.endsWith("id"))
      ) {
        if (out.cmsWidgetSliderBannerId === undefined) {
          out.cmsWidgetSliderBannerId = num;
        }
      } else if (
        kl === "cmswidgetsid" ||
        kl === "cms_widgets_id" ||
        (kl.startsWith("cmswidgets") && kl.endsWith("id") && !kl.includes("slider") && !kl.includes("banner"))
      ) {
        if (out.cmsWidgetsId === undefined) {
          out.cmsWidgetsId = num;
        }
      } else if (kl === "cmssliderid" || kl === "cms_slider_id") {
        if (out.cmsSliderId === undefined) {
          out.cmsSliderId = num;
        }
      }
    }
    for (const v of Object.values(o)) {
      visit(v, depth + 1);
    }
  };
  visit(node, 0);
  return out;
}

function rowToCmsWidgetSliderBannerMeta(row: unknown): CmsWidgetSliderBannerMeta {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return {};
  }
  const o = row as Record<string, unknown>;
  return {
    cmsWidgetSliderBannerId: readNumericField(o, "CMSWidgetSliderBannerId", "cmsWidgetSliderBannerId", "CmsWidgetSliderBannerId"),
    cmsWidgetsId: readNumericField(o, "CMSWidgetsId", "cmsWidgetsId", "CmsWidgetsId"),
    cmsSliderId: readNumericField(o, "CMSSliderId", "cmsSliderId", "CmsSliderId"),
  };
}

function mergeCmsWidgetSliderBannerMeta(
  a: CmsWidgetSliderBannerMeta,
  b: CmsWidgetSliderBannerMeta
): CmsWidgetSliderBannerMeta {
  return {
    cmsWidgetSliderBannerId: b.cmsWidgetSliderBannerId ?? a.cmsWidgetSliderBannerId,
    cmsWidgetsId: b.cmsWidgetsId ?? a.cmsWidgetsId,
    cmsSliderId: b.cmsSliderId ?? a.cmsSliderId,
  };
}

function metaFromGetCmsWidgetSliderBannerRows(rows: unknown[]): CmsWidgetSliderBannerMeta {
  let acc: CmsWidgetSliderBannerMeta = {};
  for (const row of rows) {
    acc = mergeCmsWidgetSliderBannerMeta(acc, rowToCmsWidgetSliderBannerMeta(row));
  }
  return acc;
}

function extractCmsWidgetSliderBannerMetaDeep(parsed: unknown): CmsWidgetSliderBannerMeta {
  const buckets: unknown[][] = [];
  collectObjectArrays(parsed, 0, buckets);
  for (const arr of buckets) {
    const m = metaFromGetCmsWidgetSliderBannerRows(arr);
    if (m.cmsWidgetSliderBannerId !== undefined || m.cmsWidgetsId !== undefined) {
      return m;
    }
  }
  return {};
}

/** Last resort: find first id-like numbers in raw JSON text (handles odd encodings the parser kept as string). */
function extractMetaFromBannerResponseTextLoose(body: string): CmsWidgetSliderBannerMeta {
  const pick = (patterns: RegExp[]): number | undefined => {
    for (const re of patterns) {
      const m = body.match(re);
      if (m?.[1]) {
        const n = parseInt(m[1], 10);
        if (Number.isFinite(n)) {
          return n;
        }
      }
    }
    return undefined;
  };
  return {
    cmsWidgetSliderBannerId: pick([
      /"CMSWidgetSliderBannerId"\s*:\s*(-?\d+)/i,
      /"cmsWidgetSliderBannerId"\s*:\s*(-?\d+)/i,
      /"CmsWidgetSliderBannerId"\s*:\s*(-?\d+)/i,
    ]),
    cmsWidgetsId: pick([
      /"CMSWidgetsId"\s*:\s*(-?\d+)/i,
      /"cmsWidgetsId"\s*:\s*(-?\d+)/i,
      /"CmsWidgetsId"\s*:\s*(-?\d+)/i,
    ]),
  };
}

function extractCmsWidgetSliderBannerMetaFromGetResponse(parsed: unknown, rawBody?: string): CmsWidgetSliderBannerMeta {
  let p: unknown = parsed;
  for (let i = 0; i < 5; i++) {
    const u = unwrapMaybeJsonString(p);
    if (u === p) {
      break;
    }
    p = u;
  }
  p = unwrapGetCmsWidgetSliderBannerPayload(p);

  const rows = extractRowsFromGetCmsWidgetSliderBannerJson(p);
  let meta = rows.length > 0 ? metaFromGetCmsWidgetSliderBannerRows(rows) : {};

  if (meta.cmsWidgetSliderBannerId === undefined || meta.cmsWidgetsId === undefined) {
    meta = mergeCmsWidgetSliderBannerMeta(meta, extractCmsWidgetSliderBannerMetaDeep(p));
  }
  if (meta.cmsWidgetSliderBannerId === undefined || meta.cmsWidgetsId === undefined) {
    meta = mergeCmsWidgetSliderBannerMeta(meta, scanForBannerMetaByKeyPatterns(p));
  }
  if (meta.cmsWidgetSliderBannerId === undefined || meta.cmsWidgetsId === undefined) {
    meta = mergeCmsWidgetSliderBannerMeta(meta, scanForBannerMetaByKeyPatterns(parsed));
  }
  if (
    (meta.cmsWidgetSliderBannerId === undefined || meta.cmsWidgetsId === undefined) &&
    rawBody &&
    rawBody.length > 0
  ) {
    meta = mergeCmsWidgetSliderBannerMeta(meta, extractMetaFromBannerResponseTextLoose(rawBody));
  }
  return meta;
}

/**
 * GET existing CMS row for this `WidgetsKey` (mapping + type from env) so Save can send correct ids on update.
 */
export async function fetchCmsWidgetSliderBannerMetadata(widgetsKey: string): Promise<
  { ok: true; meta: CmsWidgetSliderBannerMeta } | { ok: false; error: string; detail?: string }
> {
  const authRaw =
    process.env.PAGE_BUILDER_SLIDER_AUTHORIZATION?.trim() ||
    process.env.PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION?.trim();
  if (!authRaw) {
    return { ok: false, error: "missing_auth" };
  }
  const authorization = authRaw.startsWith("Basic ") ? authRaw : `Basic ${authRaw}`;
  const url = buildGetCmsWidgetSliderBannerUrl(widgetsKey);
  const getBannerHeaders = { Authorization: authorization };
  logGatewayCurlEquivalent(
    `GET GetCMSWidgetSliderBanner (WidgetsKey in query filter = ${widgetsKey})`,
    "GET",
    url,
    getBannerHeaders
  );
  let res: { statusCode: number; body: string };
  try {
    res = await httpsGet(url, getBannerHeaders);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: "request_failed", detail: msg };
  }
  if (res.statusCode < 200 || res.statusCode >= 300) {
    return {
      ok: false,
      error: "upstream_status",
      detail: `${res.statusCode}: ${res.body.slice(0, 400)}`,
    };
  }
  const bodyTrim = res.body.replace(/^\uFEFF/, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyTrim) as unknown;
  } catch {
    return { ok: false, error: "invalid_json", detail: res.body.slice(0, 200) };
  }
  const meta = extractCmsWidgetSliderBannerMetaFromGetResponse(parsed, bodyTrim);
  if (isGatewayCurlDebugEnabled()) {
    console.log(
      "[PAGE_BUILDER_DEBUG_GATEWAY_CURL] GetCMSWidgetSliderBanner parsed meta:",
      JSON.stringify(meta)
    );
  }
  return { ok: true, meta };
}

function parseCmsWidgetSliderBannerIdFromGatewayJson(body: string): number | undefined {
  if (!body || !body.trim()) {
    return undefined;
  }
  try {
    const j = JSON.parse(body) as unknown;
    const readFrom = (o: Record<string, unknown>): number | undefined => {
      const raw =
        o.CMSWidgetSliderBannerId ??
        o.cmsWidgetSliderBannerId ??
        o.CmsWidgetSliderBannerId;
      if (typeof raw === "number" && Number.isFinite(raw)) {
        return Math.trunc(raw);
      }
      if (typeof raw === "string" && raw.trim()) {
        const n = parseInt(raw, 10);
        return Number.isFinite(n) ? n : undefined;
      }
      return undefined;
    };
    if (!j || typeof j !== "object") {
      return undefined;
    }
    const o = j as Record<string, unknown>;
    const direct = readFrom(o);
    if (direct !== undefined) {
      return direct;
    }
    const inner = (o.Data ?? o.data ?? o.Result ?? o.result) as unknown;
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      return readFrom(inner as Record<string, unknown>);
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/** Current `widgetConfig.widgetKey` on the block — use for GetCMSWidgetSliderBanner when Save sends a new composite key. */
export function extractBannerSliderWidgetKeyFromProps(props: Record<string, unknown>): string | undefined {
  const config = props.config;
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return undefined;
  }
  const wc = (config as Record<string, unknown>).widgetConfig;
  if (!wc || typeof wc !== "object" || Array.isArray(wc)) {
    return undefined;
  }
  const wk = (wc as Record<string, unknown>).widgetKey ?? (wc as Record<string, unknown>).WidgetKey;
  if (typeof wk === "string" && wk.trim()) {
    return wk.trim();
  }
  return undefined;
}

/** Read id stored on a BannerSlider block after first SaveCMSWidgetSliderBanner (for updates). */
export function extractCmsWidgetSliderBannerIdFromBannerProps(
  props: Record<string, unknown>
): number | undefined {
  const config = props.config;
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return undefined;
  }
  const wc = (config as Record<string, unknown>).widgetConfig;
  if (!wc || typeof wc !== "object" || Array.isArray(wc)) {
    return undefined;
  }
  const o = wc as Record<string, unknown>;
  const v =
    o.cmsWidgetSliderBannerId ?? o.CMSWidgetSliderBannerId ?? o.cmsSliderBannerId ?? o.CMSSliderBannerId;
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.trunc(v);
  }
  if (typeof v === "string" && v.trim()) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/**
 * PUT SaveCMSWidgetSliderBanner on the gateway (server-side; Basic auth).
 * Call this before mutating page JSON so CMS mapping exists for the new `WidgetsKey`.
 * Pass **cmsWidgetSliderBannerId** from the block after first save; response may return the id for new rows.
 */
export async function saveCmsWidgetSliderBannerToGateway(params: {
  cmsSliderId: number;
  /** Sent on Save body as `WidgetsKey` (often new composite `{master}-{uuid}` after a pick). */
  widgetsKey: string;
  /**
   * GET GetCMSWidgetSliderBanner uses this key when the CMS row is still keyed by the previous `widgetKey`
   * (e.g. `8-{uuid}`) while Save must use the new `widgetsKey` (e.g. `12-{uuid}`).
   */
  lookupWidgetsKey?: string;
  /** From page JSON after first save; used if GET returns no row. */
  cmsWidgetSliderBannerId?: number;
}): Promise<
  { ok: true; cmsWidgetSliderBannerId?: number } | { ok: false; status: number; body: string }
> {
  const url = process.env.PAGE_BUILDER_SAVE_CMS_WIDGET_SLIDER_BANNER_URL?.trim() || DEFAULT_SAVE_CMS_WIDGET_SLIDER_BANNER_URL;
  const authRaw =
    process.env.PAGE_BUILDER_SLIDER_AUTHORIZATION?.trim() ||
    process.env.PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION?.trim();
  if (!authRaw) {
    return {
      ok: false,
      status: 401,
      body: "missing_auth: set PAGE_BUILDER_SLIDER_AUTHORIZATION or PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION",
    };
  }
  const authorization = authRaw.startsWith("Basic ") ? authRaw : `Basic ${authRaw}`;

  const keyForGet = params.lookupWidgetsKey?.trim() || params.widgetsKey.trim();
  const metaRes = await fetchCmsWidgetSliderBannerMetadata(keyForGet);
  const meta: CmsWidgetSliderBannerMeta = metaRes.ok ? metaRes.meta : {};

  const storedBannerId =
    params.cmsWidgetSliderBannerId !== undefined && Number.isFinite(params.cmsWidgetSliderBannerId)
      ? Math.trunc(params.cmsWidgetSliderBannerId)
      : undefined;

  const idForPayload =
    meta.cmsWidgetSliderBannerId !== undefined && Number.isFinite(meta.cmsWidgetSliderBannerId)
      ? Math.trunc(meta.cmsWidgetSliderBannerId)
      : storedBannerId !== undefined
        ? storedBannerId
        : envInt("PAGE_BUILDER_CMS_WIDGET_SLIDER_BANNER_ID", 0);

  const widgetsIdForPayload =
    meta.cmsWidgetsId !== undefined && Number.isFinite(meta.cmsWidgetsId)
      ? Math.trunc(meta.cmsWidgetsId)
      : envInt("PAGE_BUILDER_CMS_WIDGETS_ID", 0);

  const sliderIdFromPick = Math.trunc(params.cmsSliderId);
  const sliderIdForPayload =
    Number.isFinite(sliderIdFromPick) && sliderIdFromPick > 0 ? sliderIdFromPick : 0;

  const payload: Record<string, unknown> = {
    CMSWidgetSliderBannerId: idForPayload,
    CMSWidgetsId: widgetsIdForPayload,
    CMSSliderId: sliderIdForPayload,
    CMSMappingId: envInt("PAGE_BUILDER_CMS_MAPPING_ID", 7),
    WidgetsKey: params.widgetsKey,
    TypeOFMapping: process.env.PAGE_BUILDER_CMS_TYPE_OF_MAPPING?.trim() || "PortalMapping",
    WidgetCode: "BannerSlider",
  };

  const saveBannerHeaders = { Authorization: authorization, Accept: "application/json" };
  logGatewayCurlEquivalent(
    `PUT SaveCMSWidgetSliderBanner (GET used keyForGet=${keyForGet}, Save WidgetsKey=${params.widgetsKey})`,
    "PUT",
    url,
    saveBannerHeaders,
    JSON.stringify(payload)
  );

  let res: { statusCode: number; body: string };
  try {
    res = await httpsPutJson(url, saveBannerHeaders, payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, body: msg };
  }

  if (res.statusCode < 200 || res.statusCode >= 300) {
    return { ok: false, status: res.statusCode, body: res.body.slice(0, 800) };
  }
  const fromBody = parseCmsWidgetSliderBannerIdFromGatewayJson(res.body);
  const resolved =
    fromBody !== undefined
      ? fromBody
      : idForPayload > 0
        ? idForPayload
        : undefined;
  return { ok: true, cmsWidgetSliderBannerId: resolved };
}

/** Body for PUT SaveCmsContainerDetails — `WidgetKey` must match page `widgetConfig.widgetKey`. */
export type SaveCmsContainerDetailsBody = {
  widgetKey: string;
  displayName: string;
  widgetCode: string;
  containerKey: string;
  widgetName?: string;
  fileName?: string;
};

/**
 * PUT SaveCmsContainerDetails before appending a container widget (Home Page Promo, AdSpace, …).
 */
export async function saveCmsContainerDetailsToGateway(
  params: SaveCmsContainerDetailsBody
): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
  const url =
    process.env.PAGE_BUILDER_SAVE_CMS_CONTAINER_DETAILS_URL?.trim() || DEFAULT_SAVE_CMS_CONTAINER_DETAILS_URL;
  const authRaw =
    process.env.PAGE_BUILDER_SLIDER_AUTHORIZATION?.trim() ||
    process.env.PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION?.trim();
  if (!authRaw) {
    return {
      ok: false,
      status: 401,
      body: "missing_auth: set PAGE_BUILDER_SLIDER_AUTHORIZATION or PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION",
    };
  }
  const authorization = authRaw.startsWith("Basic ") ? authRaw : `Basic ${authRaw}`;

  const displayName = params.displayName.trim() || params.widgetCode;
  const widgetName = (params.widgetName ?? displayName).trim() || params.widgetCode;
  const fileName = params.fileName ?? "";

  const payload: Record<string, unknown> = {
    CMSContainerConfigurationId: envInt("PAGE_BUILDER_CMS_CONTAINER_CONFIGURATION_ID", 0),
    CMSWidgetsId: envInt("PAGE_BUILDER_CMS_WIDGETS_ID", 0),
    CMSMappingId: envInt("PAGE_BUILDER_CMS_MAPPING_ID", 7),
    WidgetKey: params.widgetKey,
    TypeOFMapping: process.env.PAGE_BUILDER_CMS_TYPE_OF_MAPPING?.trim() || "PortalMapping",
    WidgetName: widgetName,
    DisplayName: displayName,
    FileName: fileName,
    WidgetCode: params.widgetCode.trim(),
    ContainerKey: params.containerKey.trim(),
  };

  const containerHeaders = { Authorization: authorization, Accept: "application/json" };
  logGatewayCurlEquivalent("PUT SaveCmsContainerDetails", "PUT", url, containerHeaders, JSON.stringify(payload));

  let res: { statusCode: number; body: string };
  try {
    res = await httpsPutJson(url, containerHeaders, payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, body: msg };
  }

  if (res.statusCode < 200 || res.statusCode >= 300) {
    return { ok: false, status: res.statusCode, body: res.body.slice(0, 800) };
  }
  return { ok: true };
}

export function isAddAdSpaceChatIntent(message: string): boolean {
  const m = message.trim().toLowerCase();
  if (!m) {
    return false;
  }
  if (
    /\badd\s+ad\s*space\b/.test(m) ||
    /\badd\s+adspace\b/.test(m) ||
    /\binsert\s+ad\s*space\b/.test(m) ||
    /\binsert\s+adspace\b/.test(m)
  ) {
    return true;
  }
  return intentFuzzyMatch(m, ["adspace", "ad space"]);
}

/**
 * Saved page JSON: `props.id` = `AdSpace-{uuid}`, `widgetKey` = `{master}-{uuid}`.
 */
export function buildAdSpaceAppendCommand(opts: {
  masterWidgetKey: string;
  displayName: string;
  instanceId: string;
}): Record<string, unknown> {
  const { masterWidgetKey, displayName, instanceId } = opts;
  const suffix = instanceId.startsWith("AdSpace-")
    ? instanceId.slice("AdSpace-".length)
    : instanceId;
  const compositeWidgetKey = `${masterWidgetKey}-${suffix}`;
  const dn = displayName.trim() || "AdSpace";
  return {
    kind: "append_component",
    target: "main",
    componentType: "AdSpace",
    id: instanceId,
    props: {
      response: null,
      config: {
        type: "Widget",
        id: "AdSpaceWidget",
        hasConfigurable: false,
        widgetConfig: {
          masterWidgetKey,
          widgetKey: compositeWidgetKey,
          widgetCode: "AdSpace",
          displayName: dn,
        },
      },
    },
  };
}

import { fuzzyAddVerb, fuzzyUpdateVerb, fuzzyWidgetName } from "./fuzzy-match";

function intentFuzzyMatch(lower: string, targets: readonly string[], mode: "add" | "update" | "both" = "add"): boolean {
  const words = lower.trim().split(/\s+/);
  if (words.length < 2) return false;
  let verb = words[0]!;
  let startIdx = 1;
  if (verb === "please" && words.length >= 3) {
    verb = words[1]!;
    startIdx = 2;
  }
  if (verb === "a" || verb === "an") return false;

  const isAdd = fuzzyAddVerb(verb) !== null;
  const isUpdate = fuzzyUpdateVerb(verb) !== null;

  if (mode === "add" && !isAdd) return false;
  if (mode === "update" && !isUpdate) return false;
  if (mode === "both" && !isAdd && !isUpdate) return false;

  let tail = words.slice(startIdx).join(" ");
  tail = tail.replace(/^(?:a|an|the)\s+/i, "");
  if (!tail) return false;

  return fuzzyWidgetName(tail, targets, 3) !== null;
}

export function isAddHomePagePromoChatIntent(message: string): boolean {
  const m = message.trim().toLowerCase();
  if (!m) return false;
  if (
    /\badd\s+home\s*page\s*promo\b/.test(m) ||
    /\badd\s+homepage\s+promo\b/.test(m) ||
    /\badd\s+homepagepromo\b/.test(m) ||
    /\binsert\s+home\s*page\s*promo\b/.test(m) ||
    /\binsert\s+homepage\s+promo\b/.test(m) ||
    /\binsert\s+homepagepromo\b/.test(m)
  ) {
    return true;
  }
  return intentFuzzyMatch(m, ["homepagepromo", "home page promo"]);
}

/**
 * Saved page JSON shape: `props.id` = `HomePagePromo-{uuid}`, `widgetKey` = `{master}-{uuid}`.
 */
export function buildHomePagePromoAppendCommand(opts: {
  masterWidgetKey: string;
  displayName: string;
  instanceId: string;
}): Record<string, unknown> {
  const { masterWidgetKey, displayName, instanceId } = opts;
  const suffix = instanceId.startsWith("HomePagePromo-")
    ? instanceId.slice("HomePagePromo-".length)
    : instanceId;
  const compositeWidgetKey = `${masterWidgetKey}-${suffix}`;
  return {
    kind: "append_component",
    target: "main",
    componentType: "HomePagePromo",
    id: instanceId,
    props: {
      response: null,
      config: {
        type: "Widget",
        id: "HomePagePromoWidget",
        hasConfigurable: false,
        widgetConfig: {
          masterWidgetKey,
          widgetKey: compositeWidgetKey,
          widgetCode: "HomePagePromo",
          displayName: displayName || "Home Page Promo",
        },
      },
      hasWidgetUpdated: true,
    },
  };
}

export function isAddBannerSliderChatIntent(message: string): boolean {
  const m = message.trim().toLowerCase();
  if (!m) {
    return false;
  }
  const addBannerOnly = /\badd\s+(a\s+)?banner\b(?!\s+slider\b)/;
  if (
    /\badd\s+(a\s+)?banner\s+slider\b/.test(m) ||
    /\badd\s+(a\s+)?bannerslider\b/.test(m) ||
    addBannerOnly.test(m) ||
    /^\s*banner\s+slider\s*$/i.test(message.trim()) ||
    /^\s*bannerslider\s*$/i.test(message.trim()) ||
    /\binsert\s+banner\s+slider\b/.test(m) ||
    /\binsert\s+(a\s+)?bannerslider\b/.test(m) ||
    /\binsert\s+(a\s+)?banner\b(?!\s+slider\b)/.test(m)
  ) {
    return true;
  }
  return intentFuzzyMatch(m, ["bannerslider", "banner slider", "banner"]);
}

/** Natural phrasing for updating the last Banner Slider on the page (same picker as `Update BannerSlider-{uuid}`). */
export function isUpdateBannerSliderChatIntent(message: string): boolean {
  const m = message.trim().toLowerCase();
  if (!m) {
    return false;
  }
  if (
    /\bupdate\s+(?:the\s+)?(?:slider\s+banner|banner\s+slider)\b/.test(m) ||
    /\bchange\s+(?:the\s+)?(?:slider\s+banner|banner\s+slider)\b/.test(m) ||
    /\bedit\s+(?:the\s+)?(?:slider\s+banner|banner\s+slider)\b/.test(m) ||
    /\brefresh\s+(?:the\s+)?(?:slider\s+banner|banner\s+slider)\b/.test(m)
  ) {
    return true;
  }
  return intentFuzzyMatch(m, ["bannerslider", "banner slider", "slider banner"], "update");
}

/**
 * Props aligned with saved page JSON: `props.id` = `BannerSlider-{uuid}`,
 * `widgetKey` = `{masterWidgetKey}-{same uuid}` (instance), `masterWidgetKey` from CMS list (e.g. `"8"`).
 */
export function buildBannerSliderAppendCommand(opts: {
  /** CMS / gateway slider id (master), e.g. `"8"`. */
  masterWidgetKey: string;
  displayName: string;
  /** Full Puck id, e.g. `BannerSlider-e5152812-6f97-4812-8c23-6e857d40f019`. */
  instanceId: string;
  /** From SaveCMSWidgetSliderBanner response after first save (persist for updates). */
  cmsWidgetSliderBannerId?: number;
}): Record<string, unknown> {
  const { masterWidgetKey, displayName, instanceId, cmsWidgetSliderBannerId } = opts;
  const suffix = instanceId.startsWith("BannerSlider-")
    ? instanceId.slice("BannerSlider-".length)
    : instanceId;
  const compositeWidgetKey = `${masterWidgetKey}-${suffix}`;
  return {
    kind: "append_component",
    target: "main",
    componentType: "BannerSlider",
    id: instanceId,
    props: {
      axis: "horizontal",
      showThumbs: true,
      showArrows: true,
      autoFocus: false,
      infiniteLoop: true,
      interval: 2000,
      selectedItem: 0,
      transitionTime: 2000,
      swipeScrollTolerance: 10,
      showStatus: true,
      showIndicators: true,
      stopOnHover: true,
      swipeable: true,
      useKeyboardArrows: true,
      emulateTouch: true,
      autoPlay: true,
      response: null,
      config: {
        type: "Widget",
        id: "BannerSliderWidget",
        hasConfigurable: true,
        widgetConfig: {
          masterWidgetKey,
          widgetKey: compositeWidgetKey,
          widgetCode: "BannerSlider",
          displayName: displayName || "Banner Slider",
          ...(cmsWidgetSliderBannerId !== undefined && Number.isFinite(cmsWidgetSliderBannerId)
            ? { cmsWidgetSliderBannerId: Math.trunc(cmsWidgetSliderBannerId) }
            : {}),
        },
      },
    },
  };
}

export function isAddLinkPanelChatIntent(message: string): boolean {
  const m = message.trim().toLowerCase();
  if (!m) {
    return false;
  }
  if (
    /\badd\s+link\s+panel\b/.test(m) ||
    /\badd\s+links\b/.test(m) ||
    /^\s*add\s+link\s*$/i.test(message.trim()) ||
    /^\s*link\s+panel\s*$/i.test(message.trim()) ||
    /\badd\s+a\s+link\b/.test(m)
  ) {
    return true;
  }
  return intentFuzzyMatch(m, ["linkpanel", "link panel", "links", "link"]);
}

function envBool(name: string, defaultVal: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (raw === "1" || raw === "true" || raw === "yes") {
    return true;
  }
  if (raw === "0" || raw === "false" || raw === "no") {
    return false;
  }
  return defaultVal;
}

/**
 * POST CreateUpdateLinkWidgetConfiguration — `Content-Type: application/json` (current gateway sample).
 * Form **display name** → `Title`; panel label → `DisplayName` / `WidgetName` (env, default **Link Panel**).
 * Pass **reuseWidgetsKey** (same session as first submit) so only `Title` / `Url` change for additional links.
 */
export async function createUpdateLinkWidgetConfigurationToGateway(params: {
  url: string;
  displayName: string;
  /** Same `WidgetsKey` as the first link in this session — keeps all other payload fields aligned. */
  reuseWidgetsKey?: string;
}): Promise<{ ok: true; widgetsKey: string } | { ok: false; status: number; body: string }> {
  const master = process.env.PAGE_BUILDER_LINK_PANEL_MASTER_KEY?.trim() || "2253";
  const reuse = typeof params.reuseWidgetsKey === "string" ? params.reuseWidgetsKey.trim() : "";
  const widgetsKey = reuse || `${master}-${randomUUID()}`;

  const skip =
    process.env.PAGE_BUILDER_SKIP_CREATE_UPDATE_LINK_WIDGET === "true" ||
    process.env.PAGE_BUILDER_SKIP_CREATE_UPDATE_LINK_WIDGET === "1";
  if (skip) {
    return { ok: true, widgetsKey };
  }

  const endpoint =
    process.env.PAGE_BUILDER_CREATE_UPDATE_LINK_WIDGET_URL?.trim() || DEFAULT_CREATE_UPDATE_LINK_WIDGET_URL;
  const authRaw =
    process.env.PAGE_BUILDER_SLIDER_AUTHORIZATION?.trim() ||
    process.env.PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION?.trim();
  if (!authRaw) {
    return {
      ok: false,
      status: 401,
      body: "missing_auth: set PAGE_BUILDER_SLIDER_AUTHORIZATION or PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION",
    };
  }
  const authorization = authRaw.startsWith("Basic ") ? authRaw : `Basic ${authRaw}`;

  const title = params.displayName.trim();
  const urlStr = params.url.trim();
  const localeId = envInt(
    "PAGE_BUILDER_LINK_WIDGET_LOCALE_ID",
    envInt("PAGE_BUILDER_PRODUCT_LIST_LOCALE_ID", 1)
  );
  const portalId = envInt("PAGE_BUILDER_PORTAL_ID", 0);
  const panelLabel =
    process.env.PAGE_BUILDER_LINK_PANEL_DISPLAY_NAME?.trim() ||
    process.env.PAGE_BUILDER_LINK_PANEL_WIDGET_NAME?.trim() ||
    "Link Panel";
  const displayOrder = envInt("PAGE_BUILDER_LINK_WIDGET_DISPLAY_ORDER", 999);

  const payload: Record<string, unknown> = {
    CMSWidgetTitleConfigurationId: 0,
    CMSWidgetsId: envInt("PAGE_BUILDER_CMS_WIDGETS_ID", 0),
    CMSWidgetCode: "LinkPanel",
    PortalId: portalId,
    MediaId: 0,
    Title: title,
    Url: urlStr,
    MediaPath: null,
    CMSMappingId: envInt("PAGE_BUILDER_CMS_MAPPING_ID", 7),
    WidgetsKey: widgetsKey,
    WidgetCode: null,
    TypeOFMapping: process.env.PAGE_BUILDER_CMS_TYPE_OF_MAPPING?.trim() || "PortalMapping",
    DisplayName: panelLabel,
    WidgetName: panelLabel,
    IsActive: envBool("PAGE_BUILDER_LINK_WIDGET_IS_ACTIVE", false),
    LocaleId: localeId,
    TitleCode: null,
    CMSWidgetTitleConfigurationLocaleId: 0,
    Image: null,
    IsNewTab: envBool("PAGE_BUILDER_LINK_WIDGET_IS_NEW_TAB", false),
    DisplayOrder: displayOrder,
    EnableCMSPreview: envBool("PAGE_BUILDER_LINK_WIDGET_ENABLE_CMS_PREVIEW", false),
  };

  const headers: Record<string, string> = {
    Authorization: authorization,
    "Content-Type": "application/json",
  };
  logGatewayCurlEquivalent("POST CreateUpdateLinkWidgetConfiguration", "POST", endpoint, headers, JSON.stringify(payload));

  let res: { statusCode: number; body: string };
  try {
    res = await httpsPostJson(endpoint, headers, payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, body: msg };
  }

  if (res.statusCode < 200 || res.statusCode >= 300) {
    return { ok: false, status: res.statusCode, body: res.body.slice(0, 800) };
  }
  return { ok: true, widgetsKey };
}
