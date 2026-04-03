import type { IPageStructure } from "@znode/types/visual-editor";

import { buildWidgetCatalogPrompt, WIDGET_CATALOG } from "./widget-catalog";

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

const VISION_SYSTEM_PROMPT = `You are a Znode page builder assistant with computer vision. The user uploads a screenshot or mockup of a web page (or a section of one). Your job is to analyze the image and output a JSON object that maps visual elements to Puck page builder widgets.

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
        "image":{"src":"","backgroundSize":"cover","backgroundPosition":"center","backgroundRepeat":"no-repeat"},
        "id":"Container-xxx","layout":"custom",
        "flexProperties":{"flexDirection":"column","rowAlignment":{},"columnAlignment":{},"flexWrap":"nowrap"},
        "rigidView":"no"}},
      {"type":"VerticalSpacing","props":{"size":"96px","id":"VerticalSpacing-xxx"}}
    ],
    "root": {"props": {}},
    "zones": {
      "Container-xxx:Container": [
        {"type":"BannerSlider","props":{"axis":"horizontal","showThumbs":false,"showArrows":true,"infiniteLoop":true,"interval":2000,"transitionTime":2000,"showIndicators":true,"autoPlay":false,"config":{"type":"Widget","id":"BannerSliderWidget","hasConfigurable":true,"widgetConfig":{"masterWidgetKey":"555","widgetKey":"555-uuid","widgetCode":"BannerSlider","displayName":"Banner Slider"}},"id":"BannerSlider-uuid"}},
        {"type":"VerticalSpacing","props":{"size":"24px","id":"VerticalSpacing-xxx"}},
        {"type":"Heading","props":{"align":"left","text":"Your Trusted Partner for Wholesale Plumbing Supplies, HVAC, Municipal & More","size":"xl","background":"transparent","textColor":"black","id":"Heading-xxx","level":"2"}},
        {"type":"RichTextWidget","props":{"text":"<p>At Etna Supply, we're committed to being more than just a supplier...</p>","config":{"type":"Widget","id":"RichTextWidget","hasConfigurable":true,"hasPostMessage":true},"id":"RichTextWidget-xxx"}},
        {"type":"Column","props":{"distribution":"manual","columns":[{"span":1},{"span":5},{"span":5},{"span":1}],"gap":2,"id":"Column-xxx"}},
        {"type":"Heading","props":{"align":"left","text":"Industries We Serve","size":"xl","textColor":"black","id":"Heading-xxx","level":"2"}},
        {"type":"Column","props":{"distribution":"auto","columns":[{},{},{},{},{}],"gap":2,"id":"Column-xxx"}},
        {"type":"Heading","props":{"align":"left","text":"The Etna Supply Advantage","size":"xl","textColor":"black","id":"Heading-xxx","level":"2"}},
        {"type":"Text","props":{"align":"left","text":"We believe in providing more than products...","size":"s","weight":"normal","color":"default","id":"Text-xxx"}},
        {"type":"Column","props":{"distribution":"auto","columns":[{},{},{}],"gap":20,"id":"Column-xxx"}},
        {"type":"Heading","props":{"align":"center","text":"Featured Categories","size":"xl","textColor":"#6d0020","id":"Heading-xxx","level":"2"}},
        {"type":"CategoriesCarousel","props":{"spaceBetween":10,"slidesPerView":5,"hasNavigationEnable":true,"hasPaginationEnable":true,"hasGrid":false,"config":{"type":"Widget","id":"CategoriesWidget","hasConfigurable":true,"widgetConfig":{"masterWidgetKey":"1992","widgetKey":"1992-uuid","widgetCode":"CategoryList","displayName":"category List"}},"id":"CategoriesCarousel-uuid"}},
        {"type":"Column","props":{"distribution":"manual","columns":[{"span":5},{"span":7}],"gap":20,"id":"Column-xxx"}},
        {"type":"Heading","props":{"align":"center","text":"Featured Products","size":"xl","textColor":"#710d20","id":"Heading-xxx","level":"2"}},
        {"type":"ProductsCarousel","props":{"spaceBetween":10,"slidesPerView":5,"hasNavigationEnable":true,"hasPaginationEnable":true,"hasGrid":false,"config":{"type":"Widget","id":"ProductsCarouselWidget","hasConfigurable":true,"widgetConfig":{"masterWidgetKey":"666","widgetKey":"666-uuid","widgetCode":"ProductList","displayName":"Product List"}},"id":"ProductsCarousel-uuid"}},
        {"type":"Heading","props":{"align":"left","text":"Trusted Brands","size":"xl","textColor":"black","id":"Heading-xxx","level":"2"}},
        {"type":"LinkPanel","props":{"contentOrientation":"horizontal","customClass":"homepagebrands","config":{"type":"Widget","id":"LinkPanelWidget","hasConfigurable":true,"widgetConfig":{"masterWidgetKey":"2253","widgetKey":"2253-uuid","widgetCode":"LinkPanel","displayName":"Link Panel"}},"id":"LinkPanel-uuid"}}
      ],
      "Column-xxx:column-0": [
        {"type":"Image","props":{"image":"https://example.com/icon.png","layout":"fixed","height":125,"width":125,"alignment":"center","id":"Image-xxx"}},
        {"type":"Heading","props":{"align":"center","text":"We Know Our Stuff","size":"m","textColor":"#6d0020","id":"Heading-xxx","level":"3"}},
        {"type":"RichTextWidget","props":{"text":"<p class=\\"ql-align-center\\">With decades of industry expertise...</p>","id":"RichTextWidget-xxx"}}
      ],
      "Column-xxx:column-1": [
        {"type":"Video","props":{"video":"https://example.com/video.mp4","autoPlay":false,"controlEnable":true,"id":"Video-xxx"}}
      ]
    }
  },
  "widgets": [
    {"widgetKey":"555-uuid","type":"BannerSlider"},
    {"widgetKey":"1992-uuid","type":"CategoryList"},
    {"widgetKey":"666-uuid","type":"ProductList"},
    {"widgetKey":"2253-uuid","type":"LinkPanel"}
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
- Image widgets have: image (URL), layout, height, width, alignment, borderRadius, target
- Video widgets have: video (URL), autoPlay, controlEnable
- RichTextWidget uses HTML string in "text" prop with Quill CSS classes

RULES:
1. Analyze the image top-to-bottom. For each visual section, decide which widget best represents it.
2. For UI widgets (Heading, Text, ButtonGroup, Container, VerticalSpacing, Column, TextImage, Hero, Card, Logo, Image, Video, RichTextWidget, DynamicWidget): place them directly in the "data" object — in "content" for top-level, or inside a zone for nested widgets. Include correct props (extract text, colors, alignment from the image where possible).
3. For Znode CMS widgets that REQUIRE CMS PICKER (BannerSlider, ProductsCarousel, CategoriesCarousel, BrandsCarousel, HomePagePromo, AdSpace, OfferBanner, NewsLetter, LinkPanel, FormWidget, Ticker, TextEditor): place them in the data structure WITH their default config props, AND add an entry to the "cmsWidgetSuggestions" array with the componentType and a brief reason. Also add a corresponding entry in "widgets".
4. When you see spacing/gaps between sections, add VerticalSpacing widgets with appropriate size (e.g. "24px", "32px", "48px").
5. Extract visible text from the image for Heading.props.text and Text.props.text.
6. For buttons, extract the label text and set variant to "primary" for prominent buttons or "secondary" for less prominent ones.
7. If the image shows a complete page layout, try to reproduce the full structure.
8. For multi-column layouts, use Column widget with appropriate distribution and column count matching what you see. Place child widgets in zones named "Column-{id}:column-0", "Column-{id}:column-1", etc.
9. For custom HTML/styled content blocks (styled cards, embedded widgets, horizontal rules), use DynamicWidget.
10. Generate unique IDs for each widget (e.g. "Heading-001", "Container-001", "Column-001"). Use these IDs consistently when referencing zones.

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

/* -------------------------------------------------------------------------- */
/*  JSON parsing helper                                                       */
/* -------------------------------------------------------------------------- */

function parseVisionJson(content: string): VisionAnalysisResult {
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
  const rawData = typeof parsed.data === "object" && parsed.data !== null
    ? (parsed.data as Record<string, unknown>)
    : {};
  const data = {
    content: Array.isArray(rawData.content) ? rawData.content : [],
    root: typeof rawData.root === "object" && rawData.root !== null
      ? (rawData.root as { props: Record<string, unknown> })
      : { props: {} },
    zones: typeof rawData.zones === "object" && rawData.zones !== null
      ? (rawData.zones as Record<string, unknown[]>)
      : {},
  };

  const widgets = Array.isArray(parsed.widgets)
    ? (parsed.widgets as { widgetKey: string; type: string }[]).filter(
        (w) => typeof w === "object" && w !== null && typeof w.widgetKey === "string" && typeof w.type === "string"
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

  return { data, widgets, cmsWidgetSuggestions, description };
}

/* -------------------------------------------------------------------------- */
/*  OpenAI Vision (gpt-4o supports images natively)                           */
/* -------------------------------------------------------------------------- */

interface OpenAiVisionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
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
    max_tokens: 4096,
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
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI vision returned no message content");
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
