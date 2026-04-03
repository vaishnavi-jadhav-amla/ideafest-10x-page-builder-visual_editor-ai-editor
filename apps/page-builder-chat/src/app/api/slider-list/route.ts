import { NextResponse } from "next/server";

import { fetchBannerSliderChoicesFromGateway } from "../../../lib/fetch-slider-list";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/slider-list — server-side proxy to gateway SliderList (Basic auth from env).
 * For debugging and tools; chat flow uses the same fetch internally.
 */
export async function GET() {
  const res = await fetchBannerSliderChoicesFromGateway();
  if (!res.ok) {
    const hints: Record<string, string> = {
      missing_auth:
        "Set PAGE_BUILDER_SLIDER_AUTHORIZATION or PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION (Basic …).",
      request_failed: "Network/TLS error — see PAGE_BUILDER_SLIDER_TLS_INSECURE or NODE_EXTRA_CA_CERTS.",
      upstream_status: "Gateway returned an error (check URL and credentials).",
      invalid_json: "Response was not JSON.",
      empty_list: "Parsed zero sliders — API shape may differ; extend extractArrayFromSliderPayload.",
    };
    return NextResponse.json(
      {
        ok: false,
        error: res.error,
        detail: "detail" in res ? res.detail : undefined,
        hint: hints[res.error] ?? undefined,
      },
      { status: res.error === "missing_auth" ? 500 : 502 }
    );
  }
  return NextResponse.json({ ok: true, items: res.items });
}
