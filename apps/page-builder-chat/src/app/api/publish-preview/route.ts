import dns from "node:dns";
import https from "node:https";
import { URL } from "node:url";

import { NextResponse } from "next/server";

/** Prefer IPv4 first — fixes some Windows / Node outbound HTTPS failures (ECONNREFUSED to IPv6). */
dns.setDefaultResultOrder("ipv4first");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_UPSTREAM =
  "https://apigateways-z10-dev10.znodecorp.com/v2/visual-editor/pages-publish-preview";

type PublishBody = {
  pageCode?: string;
  portalCode?: string;
  profileCode?: string[];
  pageJson?: string;
};

function formatRequestError(e: unknown): string {
  if (!(e instanceof Error)) {
    return String(e);
  }
  const parts: string[] = [e.message];
  const code = (e as NodeJS.ErrnoException).code;
  if (code) {
    parts.push(`code: ${code}`);
  }
  const cause = (e as Error & { cause?: unknown }).cause;
  if (cause instanceof Error) {
    parts.push(`cause: ${cause.message}`);
    const ccode = (cause as NodeJS.ErrnoException).code;
    if (ccode) {
      parts.push(`causeCode: ${ccode}`);
    }
  } else if (cause != null) {
    parts.push(`cause: ${String(cause)}`);
  }
  return parts.join(" — ");
}

/**
 * Corporate gateways often use certs Node does not trust locally.
 * When not in production, default to skipping verification for this request only (opt out with PAGE_BUILDER_PUBLISH_PREVIEW_TLS_INSECURE=false).
 * `next start` uses NODE_ENV=production — verified TLS unless PAGE_BUILDER_PUBLISH_PREVIEW_TLS_INSECURE=true.
 */
function useInsecureTlsForUpstream(): boolean {
  const v = process.env.PAGE_BUILDER_PUBLISH_PREVIEW_TLS_INSECURE?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no") {
    return false;
  }
  if (v === "1" || v === "true" || v === "yes") {
    return true;
  }
  return process.env.NODE_ENV !== "production";
}

/** Node `https` avoids undici `fetch` failures on some Windows setups; errors include errno codes. */
function httpsPostJson(
  urlStr: string,
  headers: Record<string, string>,
  payload: Record<string, unknown>
): Promise<{ statusCode: number; body: string; contentType: string | undefined }> {
  const body = JSON.stringify(payload);
  const url = new URL(urlStr);
  const insecure = useInsecureTlsForUpstream();

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
        /** Dev-only: corporate gateways often use a chain Node does not trust; prefer NODE_EXTRA_CA_CERTS when possible. */
        ...(insecure ? { rejectUnauthorized: false } : {}),
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode ?? 500,
            body: Buffer.concat(chunks).toString("utf8"),
            contentType: res.headers["content-type"],
          });
        });
      }
    );
    req.on("error", reject);
    req.write(body, "utf8");
    req.end();
  });
}

export async function POST(req: Request) {
  const upstream =
    process.env.PAGE_BUILDER_PUBLISH_PREVIEW_URL?.trim() || DEFAULT_UPSTREAM;
  const authHeader = process.env.PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION?.trim();

  if (!authHeader) {
    return NextResponse.json(
      {
        error:
          "Set PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION in apps/page-builder-chat/.env (Basic … value from your API gateway).",
      },
      { status: 500 }
    );
  }

  let body: PublishBody;
  try {
    body = (await req.json()) as PublishBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.pageJson !== "string") {
    return NextResponse.json({ error: "Missing pageJson (string)." }, { status: 400 });
  }

  const payload = {
    pageCode: body.pageCode ?? "Home",
    portalCode: body.portalCode ?? "MaxwellsHardware",
    profileCode: body.profileCode ?? ["AllProfiles"],
    pageJson: body.pageJson,
  };

  const authorization = authHeader.startsWith("Basic ") ? authHeader : `Basic ${authHeader}`;

  let res: { statusCode: number; body: string; contentType: string | undefined };
  try {
    res = await httpsPostJson(upstream, { Authorization: authorization }, payload);
  } catch (e) {
    const detail = formatRequestError(e);
    return NextResponse.json(
      {
        error: `Upstream request failed: ${detail}`,
        hint:
          "ENOTFOUND/ETIMEDOUT: VPN/network to the gateway. UNABLE_TO_VERIFY_*: set NODE_EXTRA_CA_CERTS to your org PEM, or PAGE_BUILDER_PUBLISH_PREVIEW_TLS_INSECURE=true if NODE_ENV is production but you need to skip verify for this call.",
      },
      { status: 502 }
    );
  }

  return new NextResponse(res.body, {
    status: res.statusCode,
    headers: { "Content-Type": res.contentType ?? "application/json" },
  });
}
