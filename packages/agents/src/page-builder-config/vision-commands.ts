/* eslint-disable max-len */
/* eslint-disable no-console */
import type { IPageStructure } from "@znode/types/visual-editor";

import { buildWidgetCatalogPrompt, WIDGET_CATALOG } from "./widget-catalog";

/* -------------------------------------------------------------------------- */
/*  JSON parsing + UUID post-processing (shared module)                       */
/* -------------------------------------------------------------------------- */

import { parseAndPostProcess } from "./vision-commands-parse";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface VisionAnalysisResult {
  /** Puck data object with content, root, and zones — ready to merge into IPageStructure.data. */
  data: {
    content: unknown[];
    root: { props: Record<string, unknown> };
    zones: Record<string, unknown[]>;
  };
  /** Widget references for CMS-managed widgets (BannerSlider, ProductsCarousel, etc.). */
  widgets: { widgetKey: string; type: string }[];
  /**
   * CMS widgets the AI detected but cannot fully instantiate (need picker flows).
   * The caller should surface these as follow-up suggestions in the chat UI.
   */
  cmsWidgetSuggestions: CmsWidgetSuggestion[];
  /** Free-text description of what the AI saw in the image. */
  description: string;
}

export interface CmsWidgetSuggestion {
  componentType: string;
  reason: string;
}

export interface RunVisionCommandsOptions {
  page: IPageStructure;
  /** Base64-encoded image data (without the data: prefix). */
  imageBase64: string;
  /** MIME type of the image (e.g. "image/png", "image/jpeg"). */
  imageMimeType: string;
  /** Optional user message providing additional context. */
  userMessage?: string;
}

export interface RunOpenAiVisionOptions extends RunVisionCommandsOptions {
  apiKey: string;
  model?: string;
}

export interface RunClaudeVisionOptions extends RunVisionCommandsOptions {
  apiKey: string;
  model?: string;
}

export interface RunOllamaVisionOptions extends RunVisionCommandsOptions {
  baseUrl: string;
  model: string;
  numCtx?: number;
  numPredict?: number;
  numGpu?: number;
}

/* -------------------------------------------------------------------------- */
/*  System prompt (shared between OpenAI and Ollama)                          */
/* -------------------------------------------------------------------------- */

export const VISION_SYSTEM_PROMPT = `You are a Znode page builder assistant with computer vision. The user uploads a screenshot or mockup of a web page (or a section of one). Your job is to analyze the image and output a JSON object that maps visual elements to Puck page builder widgets.

${buildWidgetCatalogPrompt()}

REFERENCE EXAMPLE — A real page image (wholesale plumbing supply homepage) produced this output:
{
  "description": "Wholesale plumbing supply homepage with banner slider, hero text, industry cards, advantage section, featured categories/products carousels, video, and brand links.",
  "data": {
    "content": [
          {"type":"VerticalSpacing","props":{"size":"24px","id":"VerticalSpacing-xxx"}},
      {"type":"Container","props":{"align":"center","block":"box","maxWidth":1200,
        "margin":{"top":"0","right":"0","bottom":"0","left":"0"},
        "padding":{"top":"0","right":"0","bottom":"0","left":"0"},
        "border":{"width":"0","color":"black","style":"solid","borderRadius":0},
        "height":"auto",
        "image":{"src":"","backgroundSize":"cover","backgroundPosition":"center","backgroundRepeat":"no-repeat","backgroundColor":""},
        "id":"Container-xxx","layout":"custom",
        "flexProperties":{"flexDirection":"column","rowAlignment":{},"columnAlignment":{},"flexWrap":"nowrap"},
        "rigidView":"no"}},
        {"type":"VerticalSpacing","props":{"size":"96px","id":"VerticalSpacing-xxx"}}
    ],
    "root": {"props": {}},
    "zones": {
      "Container-xxx:Container": [
        {"type":"BannerSlider","props":{"axis":"horizontal","showThumbs":true,"showArrows":true,"infiniteLoop":true,"interval":2000,"transitionTime":2000,"showIndicators":true,"autoPlay":true,"config":{"type":"Widget","id":"BannerSliderWidget","hasConfigurable":true,"widgetConfig":{"masterWidgetKey":"555","widgetKey":"555","widgetCode":"BannerSlider","displayName":"Banner Slider"}},"id":"BannerSlider-001"}},
        {"type":"Heading","props":{"align":"left","text":"Your Trusted Partner for Wholesale Plumbing Supplies, HVAC, Municipal & More","margin":{"top":"0","right":"0","bottom":"0","left":"0"},"padding":{"top":"0","right":"0","bottom":"0","left":"0"},"border":{"width":"0","color":"black","style":"solid","borderRadius":0},"size":"xl","background":"transparent","textColor":"black","id":"Heading-xxx","level":"2"}},
        {"type":"RichTextWidget","props":{"text":"<p>At Etna Supply, we're committed to being more than just a supplier...</p>","config":{"type":"Widget","id":"RichTextWidget","hasConfigurable":true,"hasPostMessage":true},"id":"RichTextWidget-xxx"}},
        {"type":"Column","props":{"distribution":"manual","columns":[{"span":1},{"span":5},{"span":5},{"span":1}],"gap":2,"margin":{"top":0,"right":0,"bottom":0,"left":0},"hasDropZoneDisabled":false,"id":"Column-xxx"}},
        {"type":"Heading","props":{"align":"left","text":"Industries We Serve","margin":{"top":"0","right":"0","bottom":"0","left":"0"},"padding":{"top":"0","right":"0","bottom":"0","left":"0"},"border":{"width":"0","color":"black","style":"solid","borderRadius":0},"size":"xl","background":"transparent","textColor":"black","id":"Heading-xxx","level":"2"}},
        {"type":"Column","props":{"distribution":"auto","columns":[{},{},{},{},{}],"gap":2,"margin":{"top":0,"right":0,"bottom":0,"left":0},"hasDropZoneDisabled":false,"id":"Column-xxx"}},
        {"type":"Heading","props":{"align":"left","text":"The Etna Supply Advantage","margin":{"top":"0","right":"0","bottom":"0","left":"0"},"padding":{"top":"0","right":"0","bottom":"0","left":"0"},"border":{"width":"0","color":"black","style":"solid","borderRadius":0},"size":"xl","background":"transparent","textColor":"black","id":"Heading-xxx","level":"2"}},
        {"type":"Text","props":{"align":"left","text":"We believe in providing more than products...","padding":{"top":"0","right":"0","bottom":"0","left":"0"},"size":"s","weight":"normal","color":"default","id":"Text-xxx"}},
        {"type":"Column","props":{"distribution":"auto","columns":[{},{},{}],"gap":20,"margin":{"top":0,"right":0,"bottom":0,"left":0},"hasDropZoneDisabled":false,"id":"Column-xxx"}},
        {"type":"Heading","props":{"align":"center","text":"Featured Categories","margin":{"top":"0","right":"0","bottom":"0","left":"0"},"padding":{"top":"0","right":"0","bottom":"0","left":"0"},"border":{"width":"0","color":"black","style":"solid","borderRadius":0},"size":"xl","background":"transparent","textColor":"#6d0020","id":"Heading-xxx","level":"2"}},
        {"type":"CategoriesCarousel","props":{"spaceBetween":10,"slidesPerView":5,"hasNavigationEnable":true,"hasPaginationEnable":true,"hasGrid":false,"config":{"type":"Widget","id":"CategoriesWidget","hasConfigurable":true,"widgetConfig":{"masterWidgetKey":"1992","widgetKey":"1992","widgetCode":"CategoryList","displayName":"category List"}},"id":"CategoriesCarousel-001"}},
        {"type":"Column","props":{"distribution":"manual","columns":[{"span":5},{"span":7}],"gap":20,"margin":{"top":0,"right":0,"bottom":0,"left":0},"hasDropZoneDisabled":false,"id":"Column-xxx"}},
        {"type":"Heading","props":{"align":"center","text":"Featured Products","margin":{"top":"0","right":"0","bottom":"0","left":"0"},"padding":{"top":"0","right":"0","bottom":"0","left":"0"},"border":{"width":"0","color":"black","style":"solid","borderRadius":0},"size":"xl","background":"transparent","textColor":"#710d20","id":"Heading-xxx","level":"2"}},
        {"type":"ProductsCarousel","props":{"spaceBetween":10,"slidesPerView":5,"hasNavigationEnable":true,"hasPaginationEnable":true,"hasGrid":false,"config":{"type":"Widget","id":"ProductsCarouselWidget","hasConfigurable":true,"widgetConfig":{"masterWidgetKey":"666","widgetKey":"666","widgetCode":"ProductList","displayName":"Product List"}},"id":"ProductsCarousel-001"}},
        {"type":"Heading","props":{"align":"left","text":"Trusted Brands","margin":{"top":"0","right":"0","bottom":"0","left":"0"},"padding":{"top":"0","right":"0","bottom":"0","left":"0"},"border":{"width":"0","color":"black","style":"solid","borderRadius":0},"size":"xl","background":"transparent","textColor":"black","id":"Heading-xxx","level":"2"}},
        {"type":"LinkPanel","props":{"contentOrientation":"horizontal","customClass":"homepagebrands","config":{"type":"Widget","id":"LinkPanelWidget","hasConfigurable":true,"widgetConfig":{"masterWidgetKey":"2253","widgetKey":"2253","widgetCode":"LinkPanel","displayName":"Link Panel"}},"id":"LinkPanel-001"}}
      ],
      "Column-xxx:column-0": [
        {"type":"Image","props":{"image":"https://placehold.co/125x125","alt":"Icon","url":"","layout":"fixed","height":125,"width":125,"alignment":"center","borderRadius":"0px","target":"_self","id":"Image-xxx","locale":{"en-US":{"image":"https://placehold.co/125x125","alt":"Icon"}},"readOnly":{"width":false,"height":false,"alignment":false}}},
        {"type":"Heading","props":{"align":"center","text":"We Know Our Stuff","margin":{"top":"0","right":"0","bottom":"0","left":"0"},"padding":{"top":"0","right":"0","bottom":"0","left":"0"},"border":{"width":"0","color":"black","style":"solid","borderRadius":0},"size":"m","background":"transparent","textColor":"#6d0020","id":"Heading-xxx","level":"3"}},
        {"type":"RichTextWidget","props":{"text":"<p class=\\"ql-align-center\\">With decades of industry expertise...</p>","id":"RichTextWidget-xxx"}}
      ],
      "Column-xxx:column-1": [
        {"type":"Video","props":{"video":"/_next/static/media/no-image.610b4c69.png","autoPlay":false,"controlEnable":true,"id":"Video-xxx","locale":{"en-US":{"video":"/_next/static/media/no-image.610b4c69.png"}}}}
      ]
    }
  },
  "widgets": [
    {"widgetKey":"555","type":"BannerSlider"},
    {"widgetKey":"1992","type":"CategoryList"},
    {"widgetKey":"666","type":"ProductList"},
    {"widgetKey":"2253","type":"LinkPanel"}
  ],
  "cmsWidgetSuggestions": [
    {"componentType":"BannerSlider","reason":"Hero banner slider at top of page"},
    {"componentType":"ProductsCarousel","reason":"Featured products carousel section"},
    {"componentType":"CategoriesCarousel","reason":"Featured categories carousel section"},
    {"componentType":"LinkPanel","reason":"Trusted brands link panel at bottom"}
  ]
}

KEY PATTERNS FROM THE REFERENCE:
- A Container wraps the main page content; widgets go inside its zone "Container-{id}:Container"
- VerticalSpacing is used between sections (24px typical, 48px/96px for larger gaps)
- DynamicWidget is used for custom HTML/CSS blocks (horizontal rules <hr>, embedded CTAs, styled division cards with background images)
- Column widgets create multi-column layouts: "distribution" is "auto" (equal) or "manual" (custom spans); child widgets go in zones "Column-{id}:column-0", "Column-{id}:column-1", etc.
- CMS widgets (BannerSlider, ProductsCarousel, CategoriesCarousel, LinkPanel) have a "config" object with widgetConfig including masterWidgetKey, widgetKey, widgetCode, displayName
- Image widgets have: image (use https://placehold.co/{width}x{height} with dimensions matching the layout context, e.g. "https://placehold.co/600x400" for a content image, "https://placehold.co/1200x500" for a banner, "https://placehold.co/125x125" for an icon), alt, url, layout, height, width, alignment, borderRadius (string "0px"), target, locale {"en-US":{"image":"https://placehold.co/{width}x{height}","alt":"..."}}, readOnly {"width":false,"height":false,"alignment":false}
- Video widgets have: video (placeholder URL "/_next/static/media/no-image.610b4c69.png"), autoPlay, controlEnable, locale {"en-US":{"video":"..."}}
- ButtonGroup widgets support an "align" prop ("left"|"center"|"right"). Default to "center" so buttons appear centered within their parent section. Only use "left" or "right" when the design clearly shows non-centered buttons.
- RichTextWidget uses HTML string in "text" prop with Quill CSS classes

CRITICAL — MANDATORY PROPS (omitting these causes renderer crashes):
- **Heading** MUST always include: margin {top,right,bottom,left} (strings), padding {top,right,bottom,left} (strings), border {width,color,style,borderRadius}, background, textColor
- **Text** MUST always include: padding {top,right,bottom,left} (strings)
- **Column** MUST always include: margin {top,right,bottom,left} (numbers), hasDropZoneDisabled (boolean)
- **Container** MUST always include: margin {top,right,bottom,left} (strings — use "0" not "auto"), padding {top,right,bottom,left} (plain number strings like "48" not "48px"), border {width,color,style,borderRadius}, image.backgroundColor (hex color string e.g. "#1a1a1a" or "" for transparent — use this for solid background colors on sections)
- **Image** MUST always include: image (use "https://placehold.co/{width}x{height}" where width/height match your specified dimensions — e.g. "https://placehold.co/600x400"), alt, url, layout, height, width, alignment, borderRadius (string "0px"), target, locale, readOnly
- **ButtonGroup** MUST always include: align ("left"|"center"|"right" — default "center"), buttons array

RULES:
1. Analyze the image top-to-bottom. For each visual section, decide which widget best represents it. IMPORTANT: SKIP the site header (logo, navigation menu, search bar, account/cart icons) and the site footer (copyright, footer links, social icons). Only generate JSON for the MAIN BODY CONTENT between the header and footer.
2. For UI widgets (Heading, Text, ButtonGroup, Container, VerticalSpacing, Column, TextImage, Hero, Card, Logo, Image, Video, RichTextWidget, DynamicWidget): place them directly in the "data" object — in "content" for top-level, or inside a zone for nested widgets. Include correct props (extract text, colors, alignment from the image where possible).
3. For Znode CMS widgets that REQUIRE CMS PICKER (BannerSlider, ProductsCarousel, CategoriesCarousel, BrandsCarousel, HomePagePromo, AdSpace, OfferBanner, NewsLetter, LinkPanel, FormWidget, Ticker, TextEditor): place them in the data structure WITH their default config props, AND add an entry to the "cmsWidgetSuggestions" array with the componentType and a brief reason. Also add a corresponding entry in "widgets".
4. When you see spacing/gaps between sections, add VerticalSpacing widgets with appropriate size (e.g. "24px", "32px", "48px").
5. Extract visible text from the image for Heading.props.text and Text.props.text.
6. For buttons, extract the label text and set variant to "primary" for prominent buttons or "secondary" for less prominent ones.
7. If the image shows a complete page layout, try to reproduce the full structure.
8. For multi-column layouts, use Column widget with appropriate distribution and column count matching what you see. Place child widgets in zones named "Column-{id}:column-0", "Column-{id}:column-1", etc.
9. For custom HTML/styled content blocks (styled cards, embedded widgets, horizontal rules), use DynamicWidget.
10. Generate unique IDs for each widget (e.g. "Heading-001", "Container-001", "Column-001"). Use these IDs consistently when referencing zones. For CMS widgets, use "{ComponentType}-placeholder" format — real UUIDs will be injected automatically during post-processing.
11. EVERY widget MUST include ALL of its mandatory props as listed in the CRITICAL MANDATORY PROPS section above. Never omit margin, padding, or border from Heading/Text/Column/Container/Image. Missing props cause the renderer to crash.
12. For CMS widgets with config.widgetConfig, the widgetKey MUST be set to just the masterWidgetKey (e.g. "555" for BannerSlider). The system will automatically append a UUID. The widget "id" prop MUST follow the pattern "{ComponentType}-{placeholder}" (e.g. "BannerSlider-001"). The system will replace it with a real UUID.
13. The "widgets" array must contain one entry per CMS widget placed in data, with "widgetKey" matching config.widgetConfig.widgetKey and "type" matching config.widgetConfig.widgetCode (NOT the componentType).
14. For Image widgets, ALWAYS use the placeholder URL "/_next/static/media/no-image.610b4c69.png" as the "image" prop value. Also include a "locale" object: {"en-US":{"image":"/_next/static/media/no-image.610b4c69.png","alt":"<alt text>"}} and a "readOnly" object: {"width":false,"height":false,"alignment":false}.
15. For Video widgets, ALWAYS use the placeholder URL "/_next/static/media/no-image.610b4c69.png" as the "video" prop value. Also include a "locale" object: {"en-US":{"video":"/_next/static/media/no-image.610b4c69.png"}}.
16. DO NOT generate widgets for the site header or footer. The header and footer are managed separately and are NOT part of the page body content.

OUTPUT FORMAT — respond with ONLY this JSON (no markdown, no extra text):
{
  "description": "Brief description of what you see in the image",
  "data": {
    "content": [
      // Top-level content items (same structure as reference example data.content)
      // e.g. {"type":"Container","props":{...}}
    ],
    "root": { "props": {} },
    "zones": {
      // Zone contents keyed by "ParentId:zoneName"
      // e.g. "Container-001:Container": [{"type":"Heading","props":{...}}, ...]
    }
  },
  "widgets": [
    // CMS widget references — one entry per CMS widget placed in data
    // e.g. {"widgetKey":"555-uuid","type":"BannerSlider"}
  ],
  "cmsWidgetSuggestions": [
    // CMS widgets that need user configuration via picker flows
    // e.g. {"componentType":"BannerSlider","reason":"Hero banner slider at top of page"}
  ]
}`;

function parseVisionJson(content: string): VisionAnalysisResult {
  return parseAndPostProcess(content);
}

/* -------------------------------------------------------------------------- */
/*  OpenAI Vision (gpt-4o supports images natively)                           */
/* -------------------------------------------------------------------------- */

interface OpenAiVisionResponse {
  choices?: Array<{
    message?: { content?: string | null; refusal?: string | null };
    finish_reason?: string;
  }>;
}

/**
 * Analyze an uploaded image using OpenAI Vision (gpt-4o / gpt-4o-mini).
 * Returns page builder commands + CMS widget suggestions.
 */
export async function runOpenAiVisionCommands({
  page,
  imageBase64,
  imageMimeType,
  userMessage,
  apiKey,
  model = "gpt-4o",
}: RunOpenAiVisionOptions): Promise<VisionAnalysisResult> {
  const pageSnippet = JSON.stringify(page).slice(0, 3000);
  const userText = userMessage?.trim()
    ? `Additional context from user: ${userMessage}\n\nCurrent page JSON (for reference):\n${pageSnippet}`
    : `Current page JSON (for reference):\n${pageSnippet}`;

  console.log("[vision] OpenAI system prompt:\n", VISION_SYSTEM_PROMPT);

  const body = {
    model,
    messages: [
      { role: "system", content: VISION_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${imageMimeType};base64,${imageBase64}`,
              detail: "high",
            },
          },
          { type: "text", text: userText },
        ],
      },
    ],
    max_completion_tokens: 16384,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI vision call failed: ${res.status} ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as OpenAiVisionResponse;
  console.log("[vision] OpenAI raw response JSON:", JSON.stringify(data, null, 2));
  const choice = data.choices?.[0];
  const content = choice?.message?.content;
  const finishReason = choice?.finish_reason;
  const refusal = choice?.message?.refusal;

  console.log("[vision] OpenAI finish_reason:", finishReason, "content length:", content?.length ?? 0, "refusal:", refusal ?? "none");

  if (!content) {
    if (refusal) {
      throw new Error(`OpenAI vision refused the request: ${refusal}`);
    }
    if (finishReason === "content_filter") {
      throw new Error("OpenAI vision response was blocked by content filtering. Try a different image.");
    }
    if (finishReason === "length") {
      throw new Error("OpenAI vision response was truncated (max tokens reached). The image may be too complex.");
    }
    throw new Error(
      `OpenAI vision returned no message content (finish_reason: ${finishReason ?? "unknown"}, choices: ${data.choices?.length ?? 0})`
    );
  }

  return parseVisionJson(content);
}

/* -------------------------------------------------------------------------- */
/*  Claude / Anthropic Vision (claude-sonnet-4-20250514, etc.)                    */
/* -------------------------------------------------------------------------- */

interface ClaudeVisionResponse {
  content?: Array<{ type: string; text?: string }>;
  stop_reason?: string;
  error?: { type?: string; message?: string };
}

/**
 * Analyze an uploaded image using Anthropic Claude (claude-sonnet-4-20250514, etc.).
 * Claude Messages API uses a different format from OpenAI:
 *   - system is a top-level field, not a message
 *   - images use source.type="base64" with media_type + data
 */
export async function runClaudeVisionCommands({
  page,
  imageBase64,
  imageMimeType,
  userMessage,
  apiKey,
  model = "claude-sonnet-4-20250514",
}: RunClaudeVisionOptions): Promise<VisionAnalysisResult> {
  const pageSnippet = JSON.stringify(page).slice(0, 3000);
  const userText = userMessage?.trim()
    ? `Additional context from user: ${userMessage}\n\nCurrent page JSON (for reference):\n${pageSnippet}`
    : `Current page JSON (for reference):\n${pageSnippet}`;

  console.log("[vision] Claude model:", model);

  const body = {
    model,
    max_tokens: 16384,
    system: VISION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: imageMimeType,
              data: imageBase64,
            },
          },
          { type: "text", text: userText },
        ],
      },
    ],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude vision call failed: ${res.status} ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as ClaudeVisionResponse;
  console.log("[vision] Claude raw response JSON:", JSON.stringify(data, null, 2));
  const stopReason = data.stop_reason;

  // Claude returns content as an array of content blocks
  const textBlock = data.content?.find((b) => b.type === "text");
  const content = textBlock?.text;

  console.log("[vision] Claude stop_reason:", stopReason, "content length:", content?.length ?? 0);

  if (!content) {
    if (data.error) {
      throw new Error(`Claude vision error: ${data.error.message ?? data.error.type ?? "unknown"}`);
    }
    if (stopReason === "max_tokens") {
      throw new Error("Claude vision response was truncated (max tokens reached). The image may be too complex.");
    }
    throw new Error(
      `Claude vision returned no text content (stop_reason: ${stopReason ?? "unknown"}, content blocks: ${data.content?.length ?? 0})`
    );
  }

  return parseVisionJson(content);
}

/* -------------------------------------------------------------------------- */
/*  Ollama Vision (llava, llava-llama3, etc.)                                 */
/* -------------------------------------------------------------------------- */

/**
 * Analyze an uploaded image using a local Ollama vision model (e.g. llava, llava-llama3).
 * Ollama accepts images via the `images` field (array of base64 strings, no data: prefix).
 */
export async function runOllamaVisionCommands({
  page,
  imageBase64,
  userMessage,
  baseUrl,
  model,
  numCtx = 8192,
  numPredict = 2048,
  numGpu,
}: RunOllamaVisionOptions): Promise<VisionAnalysisResult> {
  const pageSnippet = JSON.stringify(page).slice(0, 2000);
  const userText = userMessage?.trim()
    ? `${userMessage}\n\nCurrent page JSON:\n${pageSnippet}`
    : `Analyze this image and map it to page builder widgets.\n\nCurrent page JSON:\n${pageSnippet}`;

  const options: Record<string, number> = { num_ctx: numCtx, num_predict: numPredict };
  if (numGpu !== undefined) {
    options.num_gpu = numGpu;
  }

  const base = baseUrl.replace(/\/$/, "");

  console.log("[vision] Ollama system prompt:\n", VISION_SYSTEM_PROMPT);
  console.log("[vision] Ollama user text:\n", userText);

  const payload = {
    model,
    messages: [
      { role: "system", content: VISION_SYSTEM_PROMPT },
      {
        role: "user",
        content: userText,
        images: [imageBase64],
      },
    ],
    stream: false,
    options,
  };

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama vision call failed: ${res.status} ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  console.log("[vision] Ollama raw response JSON:", JSON.stringify(data, null, 2));
  const content = data.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Ollama vision returned no message content");
  }

  return parseVisionJson(content);
}

/* -------------------------------------------------------------------------- */
/*  Format suggestions for chat display                                       */
/* -------------------------------------------------------------------------- */

/**
 * Build a human-readable assistant message describing the CMS widget suggestions.
 * These widgets need user interaction (picker flows) to complete.
 */
export function formatCmsWidgetSuggestions(suggestions: CmsWidgetSuggestion[]): string {
  if (suggestions.length === 0) return "";

  const lines = suggestions.map((s) => {
    const catalog = WIDGET_CATALOG.find((w) => w.componentType === s.componentType);
    const pickerHint = catalog?.requiresCmsPicker
      ? ` → type **\`${getChatCommandForWidget(s.componentType)}\`** in chat to add it`
      : "";
    return `- **${s.componentType}**: ${s.reason}${pickerHint}`;
  });

  return (
    "\n\n**CMS widgets detected** (require additional setup):\n" +
    lines.join("\n") +
    "\n\nUse the chat commands above to add these widgets with the proper CMS configuration."
  );
}

/** Map componentType to the chat command the user should type. */
function getChatCommandForWidget(componentType: string): string {
  switch (componentType) {
    case "BannerSlider":
      return "add banner slider";
    case "ProductsCarousel":
      return "add product carousel";
    case "HomePagePromo":
      return "add home page promo";
    case "AdSpace":
      return "add ad space";
    default:
      return `add ${componentType.replace(/([A-Z])/g, " $1").trim()
.toLowerCase()}`;
  }
}
