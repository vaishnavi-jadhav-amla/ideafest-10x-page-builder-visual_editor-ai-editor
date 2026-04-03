import { randomUUID } from "node:crypto";
import dns from "node:dns";
import https from "node:https";
import { URL } from "node:url";

dns.setDefaultResultOrder("ipv4first");

const DEFAULT_LIST_URL =
  "https://apigateways-z10-dev10.znodecorp.com/CMSWidgetConfiguration/GetUnAssociatedProductList";
const DEFAULT_ASSOCIATE_URL =
  "https://apigateways-z10-dev10.znodecorp.com/CMSWidgetConfiguration/AssociateProduct";

/** CMS widget instance key that actually has unassociated rows (matches typical Z10 dev docs / working curl). */
const DEFAULT_PRODUCT_CAROUSEL_WIDGETS_KEY = "666-cd3d61f0-462b-447c-b6f0-58d1fb273401";

export type UnassociatedProductRow = { sku: string; name: string };

/**
 * Stable key for **update/change** flows when the page has no ProductsCarousel yet:
 * **PAGE_BUILDER_PRODUCT_CAROUSEL_WIDGET_KEY**, optional random env, or dev default.
 */
export function resolveWidgetsKeyForUnassociatedProductList(): string {
  const fixed = process.env.PAGE_BUILDER_PRODUCT_CAROUSEL_WIDGET_KEY?.trim();
  if (fixed) {
    return fixed;
  }
  const randomOn = process.env.PAGE_BUILDER_PRODUCT_CAROUSEL_RANDOM_WIDGET_KEY?.trim().toLowerCase();
  if (randomOn === "1" || randomOn === "true" || randomOn === "yes") {
    const master = process.env.PAGE_BUILDER_PRODUCT_CAROUSEL_MASTER_KEY?.trim() || "666";
    return `${master}-${randomUUID()}`;
  }
  return DEFAULT_PRODUCT_CAROUSEL_WIDGETS_KEY;
}

/** New carousel session: always a fresh `{master}-{uuid}` (each "add product carousel" / "add products"). */
export function newWidgetsKeyForProductCarouselAdd(): string {
  const master = process.env.PAGE_BUILDER_PRODUCT_CAROUSEL_MASTER_KEY?.trim() || "666";
  return `${master}-${randomUUID()}`;
}

type PageContentRoot = { content?: unknown };

type PuckTreeItem = { type?: string; props?: unknown };

function isPuckContentArray(value: unknown): value is PuckTreeItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }
  return value.every(
    (item) => item !== null && typeof item === "object" && "type" in item && "props" in item
  );
}

export function widgetKeyFromProductsCarouselProps(props: Record<string, unknown>): string | null {
  const config = props.config;
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return null;
  }
  const c = config as Record<string, unknown>;
  const wc = c.widgetConfig;
  if (!wc || typeof wc !== "object" || Array.isArray(wc)) {
    return null;
  }
  const wk = (wc as Record<string, unknown>).widgetKey;
  if (typeof wk === "string" && wk.trim()) {
    return wk.trim();
  }
  return null;
}

/** Collect document-order ProductsCarousel `widgetKey` values from one Puck `content` tree. */
function collectProductsCarouselWidgetKeysFromContent(content: unknown, out: string[]): void {
  if (!isPuckContentArray(content)) {
    return;
  }
  for (const item of content) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const it = item as { type?: string; props?: unknown };
    if (it.type === "ProductsCarousel" && it.props && typeof it.props === "object" && !Array.isArray(it.props)) {
      const wk = widgetKeyFromProductsCarouselProps(it.props as Record<string, unknown>);
      if (wk) {
        out.push(wk);
      }
    }
    if (it.props && typeof it.props === "object" && !Array.isArray(it.props)) {
      for (const v of Object.values(it.props as Record<string, unknown>)) {
        if (isPuckContentArray(v)) {
          collectProductsCarouselWidgetKeysFromContent(v, out);
        }
      }
    }
  }
}

/**
 * Last `widgetKey` from ProductsCarousel blocks on the page (main, then header, then footer).
 * Use for "update/change product carousel" so the list uses the same CMS key as the existing block.
 */
export function findLastProductsCarouselWidgetKeyOnPage(page: {
  data?: PageContentRoot;
  headerData?: PageContentRoot;
  footerData?: PageContentRoot;
}): string | null {
  const keys: string[] = [];
  collectProductsCarouselWidgetKeysFromContent(page.data?.content, keys);
  collectProductsCarouselWidgetKeysFromContent(page.headerData?.content, keys);
  collectProductsCarouselWidgetKeysFromContent(page.footerData?.content, keys);
  return keys.length > 0 ? keys[keys.length - 1]! : null;
}

/** Reuse key from page if present; otherwise env/default (see {@link resolveWidgetsKeyForUnassociatedProductList}). */
export function resolveWidgetsKeyForProductCarouselReuse(page: {
  data?: PageContentRoot;
  headerData?: PageContentRoot;
  footerData?: PageContentRoot;
}): string {
  return findLastProductsCarouselWidgetKeyOnPage(page) ?? resolveWidgetsKeyForUnassociatedProductList();
}

export type ProductCarouselPickerPayload = {
  widgetsKey: string;
  masterWidgetKey: string;
  displayName: string;
  products: UnassociatedProductRow[];
  pageIndex: number;
  pageSize: number;
  hasMore: boolean;
  /** When set, confirming products updates this block only (no append). */
  updateComponentId?: string;
};

function useInsecureTlsForGateway(): boolean {
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

function envInt(name: string, defaultVal: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return defaultVal;
  }
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : defaultVal;
}

/**
 * Gateway expects the same shape as a browser/curl call: GET with query string *and*
 * `Content-Type: application/x-www-form-urlencoded` body (expand, filter, sort, pageIndex, pageSize).
 */
function httpsGetWithFormUrlEncodedBody(
  urlStr: string,
  headers: Record<string, string>,
  formBody: string
): Promise<{ statusCode: number; body: string }> {
  const url = new URL(urlStr);
  const insecure = useInsecureTlsForGateway();
  const merged: Record<string, string> = {
    ...headers,
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": String(Buffer.byteLength(formBody, "utf8")),
  };
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: merged,
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
    req.write(formBody, "utf8");
    req.end();
  });
}

function shouldLogProductListCurl(): boolean {
  const v = process.env.PAGE_BUILDER_LOG_PRODUCT_LIST_CURL?.trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes") {
    return true;
  }
  if (v === "0" || v === "false" || v === "no") {
    return false;
  }
  return process.env.NODE_ENV !== "production";
}

/** Bash-oriented curl for debugging; Authorization is redacted. */
function logGetUnassociatedProductListCurl(fullUrl: string, formBody: string, authorization: string): void {
  const redacted = /^Basic\s+/i.test(authorization) ? "Basic <redacted>" : "<redacted>";
  const lines: string[] = [
    "[GetUnAssociatedProductList] equivalent curl (Authorization redacted):",
    `curl --location --request GET '${fullUrl.replace(/'/g, "'\\''")}' \\`,
    `--header 'Authorization: ${redacted}' \\`,
    `--header 'Content-Type: application/x-www-form-urlencoded' \\`,
  ];
  const params = new URLSearchParams(formBody);
  const keys = ["expand", "filter", "sort", "pageIndex", "pageSize"] as const;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = params.get(k) ?? "";
    const esc = `${k}=${v}`.replace(/'/g, `'\\''`);
    const cont = i < keys.length - 1 ? " \\" : "";
    lines.push(`--data-urlencode '${esc}'${cont}`);
  }
  console.log(lines.join("\n"));
}

function httpsPostJson(
  urlStr: string,
  headers: Record<string, string>,
  payload: unknown
): Promise<{ statusCode: number; body: string }> {
  const body = JSON.stringify(payload);
  const url = new URL(urlStr);
  const insecure = useInsecureTlsForGateway();
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: "POST",
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

function buildODataFilter(widgetsKey: string): string {
  const mappingId = envInt("PAGE_BUILDER_CMS_MAPPING_ID", 7);
  const typeOfMapping = process.env.PAGE_BUILDER_CMS_TYPE_OF_MAPPING?.trim() || "PortalMapping";
  const localeId = envInt("PAGE_BUILDER_PRODUCT_LIST_LOCALE_ID", 1);
  return `WidgetsKey~is~${widgetsKey},CMSMappingId~eq~${mappingId},TypeOFMapping~is~${typeOfMapping},LocaleId~eq~${localeId},widgetcode~eq~ProductList`;
}

export function buildUnassociatedProductListUrl(
  widgetsKey: string,
  pageIndex: number,
  pageSize: number
): string {
  const base =
    process.env.PAGE_BUILDER_GET_UNASSOCIATED_PRODUCT_LIST_URL?.trim() || DEFAULT_LIST_URL;
  const u = new URL(base);
  u.searchParams.set("expand", "");
  u.searchParams.set("filter", buildODataFilter(widgetsKey));
  u.searchParams.set("sort", "");
  u.searchParams.set("pageIndex", String(pageIndex));
  u.searchParams.set("pageSize", String(pageSize));
  return u.toString();
}

/** Same fields as query string, sent again as `application/x-www-form-urlencoded` body (gateway expects both). */
export function buildUnassociatedProductListFormBody(
  widgetsKey: string,
  pageIndex: number,
  pageSize: number
): string {
  const params = new URLSearchParams();
  params.set("expand", "");
  params.set("filter", buildODataFilter(widgetsKey));
  params.set("sort", "");
  params.set("pageIndex", String(pageIndex));
  params.set("pageSize", String(pageSize));
  return params.toString();
}

function rowToProduct(row: unknown): UnassociatedProductRow | null {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return null;
  }
  const o = row as Record<string, unknown>;
  const skuRaw = getKeyCI(
    o,
    "sku",
    "SKU",
    "productSku",
    "ProductSku",
    "PublishProductSku",
    "publishProductSku",
    "productCode",
    "ProductCode",
    "code",
    "Code"
  );
  if (skuRaw === undefined || skuRaw === null || String(skuRaw).trim() === "") {
    return null;
  }
  const sku = String(skuRaw).trim();
  const nameRaw =
    getKeyCI(
      o,
      "name",
      "Name",
      "productName",
      "ProductName",
      "productTitle",
      "title",
      "Title",
      "displayName",
      "DisplayName"
    ) ?? sku;
  return { sku, name: String(nameRaw).trim() || sku };
}

function isArrayOfRecords(a: unknown): a is Record<string, unknown>[] {
  return (
    Array.isArray(a) &&
    a.length > 0 &&
    typeof a[0] === "object" &&
    a[0] !== null &&
    !Array.isArray(a[0])
  );
}

function extractProductRows(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (!parsed || typeof parsed !== "object") {
    return [];
  }
  const o = parsed as Record<string, unknown>;

  const d = o.d ?? o.D;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    const dObj = d as Record<string, unknown>;
    const dr = dObj.results ?? dObj.Results ?? dObj.data ?? dObj.Data;
    if (Array.isArray(dr)) {
      return dr;
    }
  }
  if (Array.isArray(d)) {
    return d;
  }

  const candidates = [
    o.data,
    o.Data,
    o.items,
    o.Items,
    o.results,
    o.Results,
    o.list,
    o.List,
    o.records,
    o.Records,
    o.value,
    o.Value,
    o.rows,
    o.Rows,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) {
      return c;
    }
    if (c && typeof c === "object") {
      const inner = c as Record<string, unknown>;
      for (const k of ["data", "Data", "items", "Items", "value", "Value", "results", "Results"]) {
        const v = inner[k];
        if (Array.isArray(v)) {
          return v;
        }
      }
    }
  }

  for (const key of Object.keys(o)) {
    const v = o[key];
    if (isArrayOfRecords(v)) {
      return v;
    }
  }
  return [];
}

function readTotalCount(parsed: unknown): number | undefined {
  if (!parsed || typeof parsed !== "object") {
    return undefined;
  }
  const o = parsed as Record<string, unknown>;
  const raw =
    o["@odata.count"] ??
    o.totalCount ??
    o.TotalCount ??
    o.total ??
    o.Total;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export async function fetchUnassociatedProductPage(params: {
  widgetsKey: string;
  pageIndex: number;
  pageSize: number;
}): Promise<
  | { ok: true; items: UnassociatedProductRow[]; hasMore: boolean }
  | { ok: false; error: string; detail?: string }
> {
  const authRaw =
    process.env.PAGE_BUILDER_SLIDER_AUTHORIZATION?.trim() ||
    process.env.PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION?.trim();
  if (!authRaw) {
    return { ok: false, error: "missing_auth" };
  }
  const authorization = authRaw.startsWith("Basic ") ? authRaw : `Basic ${authRaw}`;
  const url = buildUnassociatedProductListUrl(params.widgetsKey, params.pageIndex, params.pageSize);
  const formBody = buildUnassociatedProductListFormBody(
    params.widgetsKey,
    params.pageIndex,
    params.pageSize
  );

  if (shouldLogProductListCurl()) {
    logGetUnassociatedProductListCurl(url, formBody, authorization);
  }

  let res: { statusCode: number; body: string };
  try {
    res = await httpsGetWithFormUrlEncodedBody(url, { Authorization: authorization }, formBody);
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

  const rows = extractProductRows(parsed);
  const items = rows.map(rowToProduct).filter((x): x is UnassociatedProductRow => x !== null);
  if (items.length === 0 && rows.length > 0 && shouldLogProductListCurl()) {
    console.log(
      "[GetUnAssociatedProductList] received rows but none matched SKU fields; first row keys:",
      rows[0] && typeof rows[0] === "object" && rows[0] !== null
        ? Object.keys(rows[0] as object).join(",")
        : "(n/a)"
    );
  }
  if (items.length === 0 && rows.length === 0 && shouldLogProductListCurl()) {
    const keys = typeof parsed === "object" && parsed !== null ? Object.keys(parsed as object).join(",") : "";
    console.log(
      "[GetUnAssociatedProductList] 0 rows after parse; top-level JSON keys:",
      keys || "(n/a)",
      "body preview:",
      res.body.slice(0, 400)
    );
  }
  const total = readTotalCount(parsed);
  const { pageIndex, pageSize } = params;
  let hasMore: boolean;
  if (typeof total === "number") {
    hasMore = pageIndex * pageSize < total;
  } else {
    hasMore = items.length >= pageSize;
  }

  return { ok: true, items, hasMore };
}

export async function associateProductsWithWidget(params: {
  widgetsKey: string;
  skus: string[];
}): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
  const url = process.env.PAGE_BUILDER_ASSOCIATE_PRODUCT_URL?.trim() || DEFAULT_ASSOCIATE_URL;
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

  const mappingId = envInt("PAGE_BUILDER_CMS_MAPPING_ID", 7);
  const cmsWidgetsId = envInt("PAGE_BUILDER_ASSOCIATE_PRODUCT_CMS_WIDGETS_ID", 1);
  const localeId = envInt("PAGE_BUILDER_PRODUCT_LIST_LOCALE_ID", 1);
  const typeOfMapping = process.env.PAGE_BUILDER_CMS_TYPE_OF_MAPPING?.trim() || "PortalMapping";
  const cmsWidgetCode =
    process.env.PAGE_BUILDER_PRODUCT_CAROUSEL_WIDGET_CODE?.trim() || "ProductList";

  const cmsWidgetProducts = params.skus.map((sku, i) => ({
    cmsWidgetProductId: 0,
    cmsWidgetsId,
    cmsMappingId: mappingId,
    widgetsKey: params.widgetsKey,
    typeOfMapping,
    sku: sku.trim(),
    displayOrder: i + 1,
    publishProductId: 0,
    cmsWidgetCode,
  }));

  const payload = {
    cmsWidgetProducts,
    localeId,
    enableCMSPreview: process.env.PAGE_BUILDER_ASSOCIATE_PRODUCT_ENABLE_PREVIEW === "true",
  };

  let res: { statusCode: number; body: string };
  try {
    res = await httpsPostJson(url, { Authorization: authorization }, payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, body: msg };
  }

  if (res.statusCode < 200 || res.statusCode >= 300) {
    return { ok: false, status: res.statusCode, body: res.body.slice(0, 800) };
  }
  return { ok: true };
}

export function splitProductCarouselWidgetsKey(widgetsKey: string): { masterWidgetKey: string; suffix: string } | null {
  const i = widgetsKey.indexOf("-");
  if (i <= 0) {
    return null;
  }
  return { masterWidgetKey: widgetsKey.slice(0, i), suffix: widgetsKey.slice(i + 1) };
}

export function instanceIdFromProductCarouselWidgetsKey(widgetsKey: string): string | null {
  const s = splitProductCarouselWidgetsKey(widgetsKey);
  if (!s) {
    return null;
  }
  return `ProductsCarousel-${s.suffix}`;
}

export function buildProductsCarouselAppendCommand(opts: {
  masterWidgetKey: string;
  displayName: string;
  instanceId: string;
}): Record<string, unknown> {
  const { masterWidgetKey, displayName, instanceId } = opts;
  const suffix = instanceId.startsWith("ProductsCarousel-")
    ? instanceId.slice("ProductsCarousel-".length)
    : instanceId;
  const compositeWidgetKey = `${masterWidgetKey}-${suffix}`;
  return {
    kind: "append_component",
    target: "main",
    componentType: "ProductsCarousel",
    id: instanceId,
    props: {
      spaceBetween: 10,
      slidesPerView: 5,
      hasNavigationEnable: true,
      hasPaginationEnable: true,
      response: null,
      hasGrid: false,
      config: {
        type: "Widget",
        id: "ProductsCarouselWidget",
        hasConfigurable: true,
        widgetConfig: {
          masterWidgetKey,
          widgetKey: compositeWidgetKey,
          widgetCode: "ProductList",
          displayName: displayName || "Product List",
        },
      },
    },
  };
}

export function isAddProductsCarouselChatIntent(message: string): boolean {
  const m = message.trim().toLowerCase();
  if (!m) {
    return false;
  }
  return (
    /\badd\s+products\b/.test(m) ||
    /\badd\s+product\s+carousel\b/.test(m) ||
    /\badd\s+products\s+carousel\b/.test(m) ||
    /\binsert\s+product\s+carousel\b/.test(m) ||
    /\binsert\s+products\s+carousel\b/.test(m)
  );
}

/** "Update/change product carousel" — reuse the same `widgetsKey` as the carousel already on the page (or env fallback). */
export function isUpdateProductsCarouselChatIntent(message: string): boolean {
  const m = message.trim().toLowerCase();
  if (!m) {
    return false;
  }
  return (
    /\bupdate\s+product\s+carousel\b/.test(m) ||
    /\bupdate\s+products\s+carousel\b/.test(m) ||
    /\bchange\s+product\s+carousel\b/.test(m) ||
    /\bchange\s+products\s+carousel\b/.test(m) ||
    /\bedit\s+product\s+carousel\b/.test(m) ||
    /\bedit\s+products\s+carousel\b/.test(m) ||
    /\brefresh\s+product\s+carousel\b/.test(m) ||
    /\brefresh\s+products\s+carousel\b/.test(m)
  );
}
