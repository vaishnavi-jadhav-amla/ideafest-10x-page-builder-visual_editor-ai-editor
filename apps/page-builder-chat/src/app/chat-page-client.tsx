"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Same shape as sampleEmptyPageStructure — kept local so the client bundle does not pull agents/server code. */
const INITIAL_PAGE = {
  key: "category/{}",
  data: {
    content: [] as unknown[],
    root: { props: {} } as Record<string, unknown>,
  },
};

/** Puck keys from base-components-config (Container = Flex). */
const DEFAULT_SAMPLE_NDJSON = [
  JSON.stringify({
    kind: "merge_root_props",
    target: "main",
    props: { title: "Default sample page" },
  }),
  JSON.stringify({
    kind: "append_component",
    target: "main",
    componentType: "Heading",
    props: {
      align: "left",
      text: "Section heading",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      padding: { top: "0", right: "0", bottom: "0", left: "0" },
      border: { width: "0", color: "black", style: "solid" as const, borderRadius: 0 },
      size: "xl",
      background: "transparent",
      textColor: "black",
      level: "2",
    },
    id: "heading-default-sample",
  }),
  JSON.stringify({
    kind: "append_component",
    target: "main",
    componentType: "Text",
    props: {
      align: "left",
      text: "Paragraph text — matches base Text widget defaults.",
      padding: { top: "0", right: "0", bottom: "0", left: "0" },
      size: "m",
      color: "default",
      weight: "normal",
    },
    id: "text-default-sample",
  }),
  JSON.stringify({
    kind: "append_component",
    target: "main",
    componentType: "VerticalSpacing",
    props: { size: "32px" },
    id: "vsp-default-sample",
  }),
  JSON.stringify({
    kind: "append_component",
    target: "main",
    componentType: "ButtonGroup",
    props: {
      align: "left",
      buttons: [
        { label: "Primary", href: "#", variant: "primary" as const, target: "_self" as const },
        { label: "Secondary", href: "#", variant: "secondary" as const, target: "_self" as const },
      ],
    },
    id: "bg-default-sample",
  }),
  JSON.stringify({
    kind: "append_component",
    target: "main",
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
      padding: { top: "24", right: "24", bottom: "24", left: "24" },
      border: { width: "0", color: "black", borderClass: "solid" as const, borderRadius: 0 },
      height: "auto",
      image: {
        src: "",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      },
    },
    id: "container-default-sample",
  }),
].join("\n");

const SAMPLE_NDJSON = `{"kind":"set_page_key","key":"category/{}"}
{"kind":"merge_root_props","target":"main","props":{"title":"Category listing"}}
{"kind":"append_component","target":"main","componentType":"ProductListPage","props":{"config":{"id":"category"}},"id":"ProductListPage-demo-001"}`;

const SAMPLE_JSON_ARRAY = `[
  {"kind":"set_page_key","key":"product/{}"},
  {"kind":"merge_root_props","target":"main","props":{"title":"Product details"}},
  {"kind":"append_component","target":"main","componentType":"ProductDetailsPage","props":{"config":{"id":"product"}},"id":"ProductDetailsPage-demo-001"}
]`;

const SAMPLE_APPEND_EMPTY = `{"kind":"append_component","target":"main","componentType":"EmptyBox","props":{},"id":"EmptyBox-demo-001"}`;

/** Defaults for visual-editor pages-publish-preview (override via request body if needed). */
const PUBLISH_PREVIEW_DEFAULTS = {
  pageCode: "Home",
  portalCode: "MaxwellsHardware",
  profileCode: ["AllProfiles"],
} as const;

function newWidgetId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Append one command; keeps JSON array valid, or appends an NDJSON line. */
function appendCommandLine(prev: string, cmd: Record<string, unknown>): string {
  const line = JSON.stringify(cmd);
  const t = prev.trim();
  if (!t) {
    return line;
  }
  if (t.startsWith("[")) {
    try {
      const arr = JSON.parse(t) as Record<string, unknown>[];
      if (!Array.isArray(arr)) {
        return `${t}\n${line}`;
      }
      return JSON.stringify([...arr, cmd], null, 2);
    } catch {
      return `${t}\n${line}`;
    }
  }
  return `${t}\n${line}`;
}

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

type BannerSliderChoice = { masterWidgetKey: string; cmsSliderId: number; label: string };

type ProductCarouselPickerPayload = {
  widgetsKey: string;
  masterWidgetKey: string;
  displayName: string;
  products: { sku: string; name: string }[];
  pageIndex: number;
  pageSize: number;
  hasMore: boolean;
  updateComponentId?: string;
};

type ProductCarouselUiState = ProductCarouselPickerPayload & { selectedSkus: string[] };

type LinkPanelUiState = {
  url: string;
  displayName: string;
  /** After CMS **Submit**: show "Add more?" + **Finalise** (page JSON), not before. */
  afterCmsSave: boolean;
  /**
   * First successful **Submit** sets this `WidgetsKey`; every later **Submit** in the session reuses it so the gateway
   * payload stays the same except `Title` / `Url`. **Finalise** writes this key into the page JSON.
   */
  sessionWidgetsKey: string | null;
};

function mergeProductCarouselPicker(prev: ProductCarouselUiState | null, incoming: ProductCarouselPickerPayload): ProductCarouselUiState {
  const updateId = incoming.updateComponentId ?? prev?.updateComponentId;
  if (prev && prev.widgetsKey === incoming.widgetsKey && incoming.pageIndex > 1) {
    const seen = new Set(prev.products.map((x) => x.sku));
    const add = incoming.products.filter((x) => !seen.has(x.sku));
    return {
      ...incoming,
      products: [...prev.products, ...add],
      selectedSkus: prev.selectedSkus,
      ...(updateId ? { updateComponentId: updateId } : {}),
    };
  }
  return { ...incoming, selectedSkus: [], ...(updateId ? { updateComponentId: updateId } : {}) };
}

type ChatApiJson = {
  error?: string;
  assistantContent?: string | null;
  page?: typeof INITIAL_PAGE;
  errors?: { commandIndex: number; message: string }[];
  applied?: number;
  toolArgumentsParsed?: { commands: unknown[] }[];
  bannerSliderChoices?: BannerSliderChoice[];
  /** Next slider chip click updates this BannerSlider id instead of appending. */
  bannerSliderUpdateComponentId?: string;
  productCarouselPicker?: ProductCarouselPickerPayload;
  showLinkPanelForm?: boolean;
  source?: string;
  linkPanelSessionWidgetsKey?: string;
};

/** Deep-clone page from API JSON so React always sees a new reference and nested updates are plain objects. */
function pageFromApiPayload(raw: unknown): typeof INITIAL_PAGE | null {
  if (raw === null || raw === undefined || typeof raw !== "object") {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(raw)) as typeof INITIAL_PAGE;
  } catch {
    return null;
  }
}

function commandsToNdjson(commands: unknown[] | undefined): string | null {
  if (!commands?.length) {
    return null;
  }
  return commands.map((c) => JSON.stringify(c)).join("\n");
}

function formatChatAssistantReply(
  assistantContent: string | null | undefined,
  applied: number | undefined,
  errors: { commandIndex: number; message: string }[] | undefined
): string {
  const extra = errors && errors.length > 0 ? `\n\nCommand issues:\n${errors.map((e) => `- #${e.commandIndex}: ${e.message}`).join("\n")}` : "";
  const main = (assistantContent ?? "").trim();
  const appliedCount = applied ?? 0;
  const changesLine = appliedCount > 0 ? "\n\nChanges applied" : "";
  if (main) {
    return main + changesLine + extra;
  }
  if (appliedCount > 0) {
    return "Changes applied" + extra;
  }
  return "(no text)" + extra;
}

export interface ChatPageClientProps {
  chatPanelEnabled: boolean;
  plainTextEnabled: boolean;
  openAiReady: boolean;
  ollamaConfigured: boolean;
}

/* ── SVG Logo component ─────────────────────────────── */

function ZnodeLogo({ size = 44 }: { size?: number }) {
  const aspectRatio = 1536 / 1024;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: "#f0fdf4",
        border: "1.5px solid #bbf7d0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {/* <span style={{ fontSize: size * 0.38, fontWeight: 800, color: "#16a34a", letterSpacing: -0.5 }}>Z</span> */}

      <svg width={size * aspectRatio} height={size} viewBox="0 0 1536 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path
          d="M0 0 C1 3 1 3 -0.40625 6.37109375 C-1.09231423 7.73259993 -1.79107406 9.08775661 -2.5 10.4375 C-2.87020264 11.15397705 -3.24040527 11.8704541 -3.62182617 12.60864258 C-4.73523636 14.74603721 -5.86580616 16.87357804 -7 19 C-7.56332031 20.07765625 -8.12664062 21.1553125 -8.70703125 22.265625 C-13.1695774 30.38724184 -18.79624107 37.17722565 -25 44 C-25.7425 44.82628906 -26.485 45.65257812 -27.25 46.50390625 C-40.71449642 60.73568096 -58.0005044 69.15879763 -77 73 C-77.89589844 73.19335938 -78.79179688 73.38671875 -79.71484375 73.5859375 C-93.1619488 75.28081638 -108.06030139 75.32180789 -121 71 C-112.85095671 52.45085393 -88.15957282 38.38982405 -71 29 C-78.27276348 30.81843064 -84.23609499 33.50827667 -90.5625 37.5 C-91.36751953 37.98597656 -92.17253906 38.47195313 -93.00195312 38.97265625 C-97.5934848 41.55056813 -97.5934848 41.55056813 -100 46 C-100.556875 46.12375 -101.11375 46.2475 -101.6875 46.375 C-104.20212772 47.05462911 -105.18954123 47.87311423 -107.125 49.5625 C-110 52 -110 52 -112 52 C-112 52.66 -112 53.32 -112 54 C-113.3203125 55.19140625 -113.3203125 55.19140625 -115.125 56.5625 C-118.80151735 59.58673201 -121.08437048 62.91392377 -123.609375 66.9140625 C-125.424425 69.63663749 -127.66083888 71.71653319 -130 74 C-131.20377341 75.46595357 -132.38908166 76.94713774 -133.5625 78.4375 C-137.48108456 83.40650362 -141.56554367 88.21229022 -145.69946289 93.00170898 C-146.18406982 93.56317627 -146.66867676 94.12464355 -147.16796875 94.703125 C-147.80641724 95.44030762 -147.80641724 95.44030762 -148.45776367 96.19238281 C-150.66179313 98.77567142 -152.82901373 101.38888419 -155 104 C-153.70453751 103.99333817 -153.70453751 103.99333817 -152.38290405 103.98654175 C-144.23204134 103.94641809 -136.08121194 103.91599173 -127.93027306 103.89637566 C-123.7400935 103.88595173 -119.54999576 103.87181799 -115.35986328 103.84912109 C-111.31390202 103.82734303 -107.26801931 103.81542091 -103.22200394 103.81024551 C-101.68068837 103.80655866 -100.13937695 103.79935916 -98.59809494 103.78853989 C-96.43428099 103.77395884 -94.270789 103.77202479 -92.10693359 103.77294922 C-90.26160538 103.76628738 -90.26160538 103.76628738 -88.3789978 103.75949097 C-84.88282675 104.00834011 -82.2081038 104.59591364 -79 106 C-74.11997767 113.32003349 -75.80624885 125.41440207 -76 134 C-75.938125 135.16982422 -75.938125 135.16982422 -75.875 136.36328125 C-75.875 143.13577002 -79.67262922 146.51378902 -84.2421875 151.16796875 C-86.8960529 153.89325546 -89.2611252 156.71000613 -91.625 159.6875 C-94.91053925 163.75971767 -98.36119908 167.47230777 -102.109375 171.1171875 C-104.57057931 173.56822155 -106.82131473 176.1690621 -109.0859375 178.80078125 C-111.35154569 181.40391882 -113.67303552 183.95158724 -116 186.5 C-121.06736177 192.06118263 -126.02440307 197.70545426 -130.93359375 203.40625 C-137.04465307 210.49354029 -143.22761995 217.48968546 -149.578125 224.36328125 C-152.190649 227.20756142 -154.73762848 230.10029717 -157.265625 233.01953125 C-159.27264538 235.31133155 -161.32402851 237.55996752 -163.375 239.8125 C-166.51980389 243.28721563 -169.51069275 246.84020046 -172.4375 250.5 C-175.44670072 254.2261755 -178.57408946 257.65351551 -182 261 C-185.32485702 264.24836491 -188.35166573 267.55384759 -191.25 271.1875 C-194.96232064 275.84106506 -198.91073094 280.18140582 -203 284.5 C-207.94057467 289.71852728 -212.57351598 295.03957803 -217.05859375 300.65625 C-218.78418053 302.73945335 -220.55652647 304.62293217 -222.5 306.5 C-225.24476807 309.15119643 -227.62239455 311.9521857 -230 314.9375 C-233.94687537 319.85081917 -238.15947447 324.4324382 -242.5 329 C-247.45715907 334.21953603 -252.14518998 339.52372654 -256.62890625 345.16015625 C-259.61778558 348.73991782 -262.79599696 352.11320122 -266 355.5 C-270.81035241 360.5865449 -275.38710033 365.76300657 -279.74804688 371.24609375 C-282.0118167 374.0144506 -284.36023309 376.6748378 -286.76171875 379.32421875 C-287.55924561 380.20553467 -288.35677246 381.08685059 -289.1784668 381.99487305 C-289.77957275 382.65656494 -290.38067871 383.31825684 -291 384 C-289.44394987 384.00358253 -289.44394987 384.00358253 -287.85646439 384.00723743 C-262.63579582 384.06598547 -237.41522314 384.14183908 -212.19466019 384.23571491 C-199.99827182 384.28071463 -187.80191292 384.32011964 -175.60546875 384.34643555 C-164.9772606 384.36938182 -154.3491454 384.402742 -143.72101092 384.44870156 C-138.09149204 384.47267928 -132.46206546 384.49137822 -126.83249664 384.49761391 C-121.53673064 384.5036442 -116.24120097 384.52356938 -110.94552231 384.55427551 C-108.99924991 384.5630888 -107.05294667 384.56677155 -105.10665512 384.56500816 C-102.45406758 384.56336328 -99.80220728 384.57998714 -97.14971924 384.60127258 C-95.98823895 384.59400122 -95.98823895 384.59400122 -94.80329442 384.58658296 C-91.63331639 384.62870859 -89.36044688 384.80298442 -86.55314255 386.33742046 C-82.40511437 390.77772556 -83.77583147 398.05094155 -83.75976562 403.76904297 C-83.75006605 405.86075706 -83.71903238 407.95148537 -83.6875 410.04296875 C-83.6809686 411.38020253 -83.67571867 412.7174433 -83.671875 414.0546875 C-83.6625293 415.26624512 -83.65318359 416.47780273 -83.64355469 417.72607422 C-84.04593357 421.42189671 -84.5499717 423.1998785 -87 426 C-93.11203488 428.35977083 -98.98539734 428.28363118 -105.47598267 428.26069641 C-107.2008797 428.26643473 -107.2008797 428.26643473 -108.96062315 428.27228898 C-112.13904497 428.28080224 -115.31731855 428.28039298 -118.49574423 428.27610838 C-121.92861737 428.27363717 -125.36146357 428.28266005 -128.79432678 428.29014587 C-135.51344169 428.30288239 -142.23251662 428.304688 -148.95164157 428.30234561 C-154.41196291 428.30056168 -159.87227212 428.30231369 -165.33259201 428.30657005 C-166.11007648 428.30716524 -166.88756094 428.30776043 -167.68860554 428.30837366 C-169.26808315 428.30958541 -170.84756075 428.31079955 -172.42703836 428.31201603 C-187.23141748 428.32288683 -202.03577381 428.32073083 -216.84015422 428.31463119 C-230.38696623 428.30945833 -243.93370642 428.320728 -257.48050423 428.33972941 C-271.39233946 428.35909328 -285.30414067 428.36736662 -299.21598947 428.36360615 C-307.02576778 428.36169243 -314.8354849 428.36419865 -322.64525223 428.37832069 C-329.29113295 428.39021673 -335.93691479 428.39165917 -342.58279683 428.37953053 C-345.97382542 428.37363025 -349.36467295 428.37257401 -352.75568962 428.38453293 C-356.42995755 428.39493091 -360.10373479 428.38695534 -363.77798462 428.3742218 C-364.85200204 428.38159609 -365.92601947 428.38897037 -367.03258288 428.39656812 C-375.92810881 428.33145102 -375.92810881 428.33145102 -380 425 C-380.58612061 424.54713623 -381.17224121 424.09427246 -381.77612305 423.62768555 C-383.46097925 421.38692426 -383.46119067 419.74236902 -383.58203125 416.95703125 C-383.62650391 415.96509766 -383.67097656 414.97316406 -383.71679688 413.95117188 C-383.74837891 412.91541016 -383.77996094 411.87964844 -383.8125 410.8125 C-383.88887695 409.28786133 -383.88887695 409.28786133 -383.96679688 407.73242188 C-384.25154817 400.25649375 -384.31613517 394.07281615 -379.64453125 387.875 C-378.71514501 386.90247769 -377.77080426 385.94403993 -376.8125 385 C-375.39580832 383.54534338 -373.98364008 382.08734019 -372.58276367 380.61743164 C-371.43083346 379.4402702 -370.23712522 378.30356035 -369.02075195 377.19311523 C-365.22255853 373.55126113 -365.22255853 373.55126113 -363.82006836 368.66845703 C-364.21709356 366.05346792 -364.83299064 363.60457226 -365.5625 361.0625 C-366.00701899 359.20861843 -366.43918505 357.35173433 -366.859375 355.4921875 C-367.06755859 354.57147461 -367.27574219 353.65076172 -367.49023438 352.70214844 C-368.96481547 344.88573871 -368.61004976 336.57652441 -367.29296875 328.76953125 C-366.63095326 325.11083687 -366.63095326 325.11083687 -368.35546875 322.8515625 C-369.16951172 321.93503906 -369.16951172 321.93503906 -370 321 C-373.27791703 310.09492967 -371.62875202 301.14276266 -366.3671875 291.2734375 C-364.49480883 288.15993925 -362.53684686 285.60541029 -360 283 C-359.34 283 -358.68 283 -358 283 C-358 282.34 -358 281.68 -358 281 C-348.01557781 273.05648174 -334.94604858 267.22916657 -322 268 C-319.02196715 269.12457185 -318.15895294 269.77040131 -316.3125 272.4375 C-312.3699689 283.13865583 -314.03134926 294.50440344 -318.17578125 304.96875 C-319.35323876 307.38928185 -320.60990366 309.69604403 -322 312 C-322.37640625 312.64066406 -322.7528125 313.28132813 -323.140625 313.94140625 C-324.1875 315.625 -324.1875 315.625 -326 318 C-326.66 318 -327.32 318 -328 318 C-328.33 318.99 -328.66 319.98 -329 321 C-335.45715525 326.73969355 -343.20712567 331 -352 331 C-352.05425013 333.87525669 -352.09379277 336.74947646 -352.125 339.625 C-352.14175781 340.43324219 -352.15851562 341.24148438 -352.17578125 342.07421875 C-352.21420986 346.80093815 -351.82737094 350.55387702 -350 355 C-342.62503786 347.05587001 -335.32239768 339.08089441 -328.296875 330.82421875 C-327.28155186 329.63255524 -326.2659167 328.44115753 -325.25 327.25 C-324.73598633 326.64712158 -324.22197266 326.04424316 -323.69238281 325.4230957 C-320.29170627 321.45405064 -316.80919051 317.57711343 -313.25 313.75 C-309.08786416 309.26862654 -305.24723574 304.64291461 -301.55859375 299.765625 C-301.04425781 299.18296875 -300.52992188 298.6003125 -300 298 C-299.34 298 -298.68 298 -298 298 C-297.72760498 297.40541992 -297.45520996 296.81083984 -297.17456055 296.19824219 C-296.02970512 294.05559444 -294.87355302 292.57993363 -293.20703125 290.828125 C-292.66272461 290.25030273 -292.11841797 289.67248047 -291.55761719 289.07714844 C-290.98172852 288.47418945 -290.40583984 287.87123047 -289.8125 287.25 C-288.62547304 285.99036407 -287.43926755 284.7299535 -286.25390625 283.46875 C-285.68687988 282.86675781 -285.11985352 282.26476562 -284.53564453 281.64453125 C-282.17612136 279.11770326 -279.91052196 276.51549489 -277.65234375 273.8984375 C-275.73552575 271.69613597 -273.77489305 269.53678058 -271.8125 267.375 C-268.17716172 263.35082248 -264.63848304 259.25503175 -261.125 255.125 C-257.27572513 250.60051041 -253.35627847 246.16394178 -249.3125 241.8125 C-245.11287544 237.29154391 -241.18966366 232.59845326 -237.3203125 227.79296875 C-233.87875568 223.65035406 -230.21895232 219.72204368 -226.55859375 215.7734375 C-223.91989021 212.91316343 -221.35737646 209.99855654 -218.80859375 207.05859375 C-216.5698875 204.5104335 -214.28589788 202.00589407 -212 199.5 C-207.01424271 194.02764478 -202.11572853 188.49471106 -197.32421875 182.8515625 C-191.7666631 176.31558334 -186.13831395 169.87688713 -180.27270508 163.61450195 C-176.41058916 159.48570479 -172.73125919 155.26429622 -169 151 C-275.425 150.505 -275.425 150.505 -384 150 C-384 110.5 -384 110.5 -381.25 106.375 C-376.7048912 103.59743351 -371.84709275 103.87607675 -366.64115906 103.87974548 C-365.91001461 103.87889106 -365.17887017 103.87803663 -364.42556983 103.87715632 C-361.98119788 103.87551218 -359.5368949 103.88100542 -357.0925293 103.88647461 C-355.33811952 103.88675674 -353.58370963 103.88659825 -351.82929993 103.8860321 C-347.06940689 103.88574513 -342.30953904 103.89162579 -337.54965186 103.89860606 C-332.57418429 103.90485616 -327.59871614 103.90544471 -322.62324524 103.90663147 C-313.20275888 103.90973989 -303.78228412 103.91794671 -294.36180288 103.92798096 C-283.63637866 103.93915726 -272.91095389 103.94465637 -262.1855253 103.94967639 C-240.12367706 103.96012971 -218.06183926 103.97771972 -196 104 C-196.13654638 106.23226407 -196.27966547 108.46412669 -196.42553711 110.69580078 C-196.50452744 111.9387088 -196.58351776 113.18161682 -196.66490173 114.46218872 C-197.08099498 118.85510721 -198.08837596 122.73754262 -199.5625 126.875 C-199.79646484 127.57496094 -200.03042969 128.27492188 -200.27148438 128.99609375 C-200.83296147 130.66906633 -201.41414942 132.33540609 -202 134 C-193.88770097 127.79890362 -188.69280703 120.16536781 -187 110 C-186.78811467 106.27259869 -186.81490986 102.54537844 -186.8125 98.8125 C-186.80025391 97.80251953 -186.78800781 96.79253906 -186.77539062 95.75195312 C-186.77345703 94.78837891 -186.77152344 93.82480469 -186.76953125 92.83203125 C-186.76542236 91.95264893 -186.76131348 91.0732666 -186.75708008 90.16723633 C-186.79549901 87.78853982 -186.79549901 87.78853982 -189 86 C-190.46724869 85.58078609 -191.94946125 85.2130824 -193.4375 84.875 C-202.95677538 82.1335589 -211.10903684 75.60031749 -216 67 C-221.43695187 56.70386499 -223.44247891 46.24607921 -220.765625 34.8046875 C-219.81898006 32.57331013 -218.93311007 31.47160181 -217 30 C-209.64951273 27.75401778 -201.92366053 30.61411118 -195.23046875 33.80078125 C-189.11485098 37.08886296 -183.65890826 40.80864508 -179 46 C-178.319375 46.7425 -177.63875 47.485 -176.9375 48.25 C-172.05994443 55.1729821 -169.58276648 62.45975142 -170 71 C-170.7734375 72.7634375 -170.7734375 72.7634375 -171.5625 74.5625 C-173.63540006 79.51943493 -172.27617315 82.93906189 -171 88 C-170.6102845 90.03890892 -170.23499749 92.08063467 -169.875 94.125 C-169.70742188 95.05570312 -169.53984375 95.98640625 -169.3671875 96.9453125 C-169.24601563 97.62335938 -169.12484375 98.30140625 -169 99 C-168.65710938 98.54753906 -168.31421875 98.09507812 -167.9609375 97.62890625 C-164.89126673 93.62926133 -161.75930541 89.69449213 -158.5234375 85.828125 C-157.9042041 85.08618896 -157.2849707 84.34425293 -156.64697266 83.57983398 C-155.39899787 82.08820697 -154.14618788 80.60060979 -152.88818359 79.11743164 C-149.64389249 75.23416747 -147.15053913 71.61713194 -145 67 C-143.33333333 65.33333333 -141.66666667 63.66666667 -140 62 C-138.37760884 59.6343459 -136.84045246 57.2327107 -135.33203125 54.79296875 C-134.67267578 53.90544922 -134.67267578 53.90544922 -134 53 C-133.34 53 -132.68 53 -132 53 C-131.67 52.34 -131.34 51.68 -131 51 C-128.9375 49.875 -128.9375 49.875 -127 49 C-127.33 49.99 -127.66 50.98 -128 52 C-123.47151637 48.84595088 -121.24473112 45.51710781 -118.625 40.8125 C-115.16257103 34.81501371 -111.43626721 29.33215573 -107 24 C-106.06220703 22.77603516 -106.06220703 22.77603516 -105.10546875 21.52734375 C-97.21997009 12.06181939 -84.66496278 3.98853538 -73 0 C-72.01 0 -71.02 0 -70 0 C-69.67 -0.66 -69.34 -1.32 -69 -2 C-66.7421875 -2.59765625 -66.7421875 -2.59765625 -63.875 -3.0625 C-62.94429687 -3.21847656 -62.01359375 -3.37445313 -61.0546875 -3.53515625 C-60.04664063 -3.68855469 -59.03859375 -3.84195312 -58 -4 C-56.96875 -4.17660156 -55.9375 -4.35320312 -54.875 -4.53515625 C-36.13660278 -6.78300834 -18.21587879 -4.44174476 0 0 Z M-68 26 C-68 26.66 -68 27.32 -68 28 C-67.34 27.67 -66.68 27.34 -66 27 C-66.66 26.67 -67.32 26.34 -68 26 Z "
          fill="#54576E"
          transform="translate(998,282)"
        />
        <path
          d="M0 0 C1 3 1 3 -0.40625 6.37109375 C-1.09231423 7.73259993 -1.79107406 9.08775661 -2.5 10.4375 C-2.87020264 11.15397705 -3.24040527 11.8704541 -3.62182617 12.60864258 C-4.73523636 14.74603721 -5.86580616 16.87357804 -7 19 C-7.56332031 20.07765625 -8.12664062 21.1553125 -8.70703125 22.265625 C-13.1695774 30.38724184 -18.79624107 37.17722565 -25 44 C-25.7425 44.82628906 -26.485 45.65257812 -27.25 46.50390625 C-40.71449642 60.73568096 -58.0005044 69.15879763 -77 73 C-77.89589844 73.19335938 -78.79179688 73.38671875 -79.71484375 73.5859375 C-93.1619488 75.28081638 -108.06030139 75.32180789 -121 71 C-112.85095671 52.45085393 -88.15957282 38.38982405 -71 29 C-78.27276348 30.81843064 -84.23609499 33.50827667 -90.5625 37.5 C-91.36751953 37.98597656 -92.17253906 38.47195313 -93.00195312 38.97265625 C-97.5934848 41.55056813 -97.5934848 41.55056813 -100 46 C-100.556875 46.12375 -101.11375 46.2475 -101.6875 46.375 C-104.20212772 47.05462911 -105.18954123 47.87311423 -107.125 49.5625 C-110 52 -110 52 -112 52 C-112 52.66 -112 53.32 -112 54 C-113.96147874 55.38938077 -115.96166576 56.7260411 -118 58 C-118.33 57.34 -118.66 56.68 -119 56 C-123.20816079 53.83215959 -127.35542174 53.47232999 -132 53 C-130.74458443 50.48916886 -129.49936512 50.12874554 -127 49 C-127.33 49.99 -127.66 50.98 -128 52 C-123.47151637 48.84595088 -121.24473112 45.51710781 -118.625 40.8125 C-115.16257103 34.81501371 -111.43626721 29.33215573 -107 24 C-106.37480469 23.18402344 -105.74960937 22.36804688 -105.10546875 21.52734375 C-97.21997009 12.06181939 -84.66496278 3.98853538 -73 0 C-72.01 0 -71.02 0 -70 0 C-69.67 -0.66 -69.34 -1.32 -69 -2 C-66.7421875 -2.59765625 -66.7421875 -2.59765625 -63.875 -3.0625 C-62.94429687 -3.21847656 -62.01359375 -3.37445313 -61.0546875 -3.53515625 C-59.54261719 -3.76525391 -59.54261719 -3.76525391 -58 -4 C-56.96875 -4.17660156 -55.9375 -4.35320312 -54.875 -4.53515625 C-36.13660278 -6.78300834 -18.21587879 -4.44174476 0 0 Z M-68 26 C-68 26.66 -68 27.32 -68 28 C-67.34 27.67 -66.68 27.34 -66 27 C-66.66 26.67 -67.32 26.34 -68 26 Z "
          fill="#90D941"
          transform="translate(998,282)"
        />
      </svg>
    </div>
  );
}

/* ── Typing indicator ────────────────────────────────── */

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.5,
            animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes typingBounce { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-6px);opacity:1} }`}</style>
    </div>
  );
}

function buildWelcome(plainTextEnabled: boolean, openAiReady: boolean, ollamaConfigured: boolean): string {
  // @chat-page-client-ui.tsx (243-245) above message as welcome message
  const intro =
    "Hi! I'm your **Znode Smart Assistant**. I'll help you build pages faster. I can add and configure:\n\n" +
    "\u2022 Banner Slider\n\u2022 Text Widget\n\u2022 Homepage Banner\n\n" +
    "What would you like to build today?";

  return `${intro}`;
}

export function ChatPageClient({ chatPanelEnabled, plainTextEnabled, openAiReady, ollamaConfigured }: ChatPageClientProps) {
  const [page, setPage] = useState(INITIAL_PAGE);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [{ role: "assistant", content: buildWelcome(plainTextEnabled, openAiReady, ollamaConfigured) }]);
  const [chatInput, setChatInput] = useState("");
  const [commandsInput, setCommandsInput] = useState(DEFAULT_SAMPLE_NDJSON);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [bannerSliderChoices, setBannerSliderChoices] = useState<BannerSliderChoice[] | null>(null);
  const [bannerSliderUpdateComponentId, setBannerSliderUpdateComponentId] = useState<string | null>(null);
  const [productCarousel, setProductCarousel] = useState<ProductCarouselUiState | null>(null);
  const [linkPanel, setLinkPanel] = useState<LinkPanelUiState | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Receive page structure pushed by the page-builder (parent window).
   * Updates local page state so the AI chat always works on the latest editor data.
   */
  useEffect(() => {
    function handlePageSync(event: MessageEvent) {
      if (event.data?.type !== "PAGE_BUILDER_SYNC_PAGE") return;
      // Only accept messages originating from the direct parent window.
      if (event.source !== window.parent) return;
      const syncedPage = event.data?.page;
      if (syncedPage && typeof syncedPage === "object") {
        setPage(syncedPage);
      }
    }
    window.addEventListener("message", handlePageSync);
    return () => window.removeEventListener("message", handlePageSync);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const renderMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const pushAssistant = useCallback((content: string) => {
    setMessages((m) => [...m, { role: "assistant", content }]);
  }, []);

  const appendCmd = useCallback((cmd: Record<string, unknown>) => {
    setCommandsInput((prev) => appendCommandLine(prev, cmd));
  }, []);

  const publishToPreview = useCallback(async () => {
    setPublishLoading(true);
    setPublishStatus(null);
    try {
      const pageJson = JSON.stringify(page, null, 2);
      const res = await fetch("/api/publish-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageCode: PUBLISH_PREVIEW_DEFAULTS.pageCode,
          portalCode: PUBLISH_PREVIEW_DEFAULTS.portalCode,
          profileCode: [...PUBLISH_PREVIEW_DEFAULTS.profileCode],
          pageJson,
        }),
        cache: "no-store",
      });
      const text = await res.text();
      if (!res.ok) {
        setPublishStatus(`Failed (${res.status}): ${text.slice(0, 600)}`);
      } else {
        setPublishStatus(`Success (${res.status}). ${text.slice(0, 400)}`);
        // Transfer the latest page structure back to the page-builder iframe host.
        if (typeof window !== "undefined" && window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "CHAT_PAGE_UPDATE", page }, "*");
        }
        setTimeout(() => setPublishStatus(null), 2000);
      }
    } catch (e) {
      setPublishStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setPublishLoading(false);
    }
  }, [page]);

  const pickBannerSlider = async (c: BannerSliderChoice) => {
    if (loading) return;
    const updateTargetId = bannerSliderUpdateComponentId;
    setBannerSliderChoices(null);
    setBannerSliderUpdateComponentId(null);
    setProductCarousel(null);
    setLinkPanel(null);
    setLastError(null);
    setMessages((m) => [
      ...m,
      {
        role: "user",
        content: `[banner slider] ${c.label}`,
      },
    ]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          selectBannerSliderKey: c.masterWidgetKey,
          selectBannerSliderLabel: c.label,
          selectBannerSliderCmsSliderId: c.cmsSliderId,
          ...(updateTargetId ? { updateBannerSliderComponentId: updateTargetId } : {}),
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      const nextPage = pageFromApiPayload(data.page);
      if (nextPage !== null) {
        setPage(nextPage);
      }
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) {
        setCommandsInput(appliedNdjson);
      }
      if (data.bannerSliderChoices?.length) {
        setBannerSliderChoices(data.bannerSliderChoices);
        setBannerSliderUpdateComponentId(data.bannerSliderUpdateComponentId ?? null);
      } else {
        setBannerSliderChoices(null);
        setBannerSliderUpdateComponentId(null);
      }
      if (data.productCarouselPicker) {
        setProductCarousel((prev) => mergeProductCarouselPicker(prev, data.productCarouselPicker!));
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductCarouselSku = useCallback((sku: string) => {
    setProductCarousel((prev) => {
      if (!prev) {
        return prev;
      }
      const on = prev.selectedSkus.includes(sku);
      return {
        ...prev,
        selectedSkus: on ? prev.selectedSkus.filter((s) => s !== sku) : [...prev.selectedSkus, sku],
      };
    });
  }, []);

  const loadMoreProductCarousel = useCallback(async () => {
    if (loading || !productCarousel?.hasMore) {
      return;
    }
    setLastError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          productCarouselLoadMore: {
            widgetsKey: productCarousel.widgetsKey,
            pageIndex: productCarousel.pageIndex + 1,
          },
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      if (data.productCarouselPicker) {
        setProductCarousel((prev) => mergeProductCarouselPicker(prev, data.productCarouselPicker!));
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [loading, page, productCarousel, pushAssistant]);

  const confirmProductCarousel = useCallback(async () => {
    if (loading || !productCarousel || productCarousel.selectedSkus.length === 0) {
      return;
    }
    const { widgetsKey, selectedSkus, updateComponentId } = productCarousel;
    const count = selectedSkus.length;
    setLastError(null);
    setProductCarousel(null);
    setLinkPanel(null);
    setMessages((m) => [...m, { role: "user", content: `[products carousel] ${count} product(s)` }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          productCarouselConfirm: {
            widgetsKey,
            skus: selectedSkus,
            ...(updateComponentId ? { updateComponentId } : {}),
          },
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      const nextPage = pageFromApiPayload(data.page);
      if (nextPage !== null) {
        setPage(nextPage);
      }
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) {
        setCommandsInput(appliedNdjson);
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [loading, page, productCarousel, pushAssistant]);

  const submitLinkPanel = useCallback(async () => {
    if (loading || !linkPanel) {
      return;
    }
    const url = linkPanel.url.trim();
    const displayName = linkPanel.displayName.trim();
    if (!url || !displayName) {
      return;
    }
    setLastError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          linkWidgetSubmit: {
            url,
            displayName,
            ...(linkPanel.sessionWidgetsKey?.trim() ? { reuseWidgetsKey: linkPanel.sessionWidgetsKey.trim() } : {}),
          },
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      if (data.showLinkPanelForm) {
        if (data.source === "link-widget-save-ok") {
          setLinkPanel((prev) => ({
            url: "",
            displayName: "",
            afterCmsSave: true,
            sessionWidgetsKey: prev?.sessionWidgetsKey ?? data.linkPanelSessionWidgetsKey ?? null,
          }));
        } else if (data.source === "link-widget-save-error") {
          setLinkPanel((prev) => prev ?? { url, displayName, afterCmsSave: false, sessionWidgetsKey: null });
        } else {
          setLinkPanel({ url: "", displayName: "", afterCmsSave: false, sessionWidgetsKey: null });
        }
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [loading, page, linkPanel, pushAssistant]);

  const finaliseLinkPanelOnPage = useCallback(async () => {
    if (loading || !linkPanel?.sessionWidgetsKey?.trim()) {
      return;
    }
    const widgetsKey = linkPanel.sessionWidgetsKey.trim();
    setLastError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          applyLinkPanelPageUpdate: { widgetsKey },
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      const nextPage = pageFromApiPayload(data.page);
      if (nextPage !== null) {
        setPage(nextPage);
      }
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) {
        setCommandsInput(appliedNdjson);
      }
      if (data.showLinkPanelForm && data.source === "link-panel-page-update-ok") {
        setLinkPanel({ url: "", displayName: "", afterCmsSave: false, sessionWidgetsKey: null });
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [loading, page, linkPanel, pushAssistant]);

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || loading) return;
    setLastError(null);
    setBannerSliderChoices(null);
    setBannerSliderUpdateComponentId(null);
    setProductCarousel(null);
    setLinkPanel(null);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setChatInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, message: text, useCommandsOnly: false }),
        cache: "no-store",
      });
      const data = (await res.json()) as ChatApiJson;
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      const nextPage = pageFromApiPayload(data.page);
      if (nextPage !== null) {
        setPage(nextPage);
      }
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) {
        setCommandsInput(appliedNdjson);
      }
      if (data.bannerSliderChoices?.length) {
        setBannerSliderChoices(data.bannerSliderChoices);
        setBannerSliderUpdateComponentId(data.bannerSliderUpdateComponentId ?? null);
      } else {
        setBannerSliderChoices(null);
        setBannerSliderUpdateComponentId(null);
      }
      if (data.productCarouselPicker) {
        setProductCarousel((prev) => mergeProductCarouselPicker(prev, data.productCarouselPicker!));
      }
      if (data.showLinkPanelForm) {
        if (data.source === "link-widget-save-ok") {
          setLinkPanel((prev) => ({
            url: "",
            displayName: "",
            afterCmsSave: true,
            sessionWidgetsKey: prev?.sessionWidgetsKey ?? data.linkPanelSessionWidgetsKey ?? null,
          }));
        } else if (data.source === "link-widget-save-error") {
          setLinkPanel((prev) => prev ?? { url: "", displayName: "", afterCmsSave: false, sessionWidgetsKey: null });
        } else if (data.source === "link-panel-page-update-ok") {
          setLinkPanel({ url: "", displayName: "", afterCmsSave: false, sessionWidgetsKey: null });
        } else {
          setLinkPanel({ url: "", displayName: "", afterCmsSave: false, sessionWidgetsKey: null });
        }
      }
      pushAssistant(formatChatAssistantReply(data.assistantContent, data.applied, data.errors));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const applyCommands = async () => {
    if (loading) return;
    setLastError(null);
    const text = commandsInput.trim();
    setMessages((m) => [...m, { role: "user", content: `[commands]\n${text}` }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          useCommandsOnly: true,
          commandsText: text,
        }),
        cache: "no-store",
      });
      const data = (await res.json()) as {
        error?: string;
        assistantContent?: string;
        page?: typeof page;
        errors?: { commandIndex: number; message: string }[];
        applied?: number;
        toolArgumentsParsed?: { commands: unknown[] }[];
      };
      if (!res.ok) {
        setLastError(data.error ?? res.statusText);
        pushAssistant(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      const nextPage = pageFromApiPayload(data.page);
      if (nextPage !== null) {
        setPage(nextPage);
      }
      const appliedNdjson = commandsToNdjson(data.toolArgumentsParsed?.[0]?.commands);
      if (appliedNdjson) {
        setCommandsInput(appliedNdjson);
      }
      pushAssistant(data.assistantContent ?? "Done.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLastError(msg);
      pushAssistant(`Request failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.chatContainer}>
      {/* ── Header ──────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <ZnodeLogo size={40} />
          <div>
            <div style={styles.headerTitle}>Znode Smart Assistant</div>
          </div>
        </div>
        <div style={styles.headerActions} />
      </div>

      {publishStatus && (
        <div
          style={{
            padding: "8px 16px",
            fontSize: "0.78rem",
            background: publishStatus.startsWith("Success") ? "#f0fdf4" : "#fef2f2",
            color: publishStatus.startsWith("Success") ? "#166534" : "#991b1b",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {publishStatus.startsWith("Success") ? "Published to preview successfully" : "Failed to publish to preview"}
        </div>
      )}

      {/* ── Messages area ──────────────────────────── */}
      <div style={styles.messagesArea}>
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} style={styles.userRow}>
              <div style={styles.userBubble}>{msg.content}</div>
            </div>
          ) : (
            <div key={i} style={styles.assistantRow}>
              <ZnodeLogo size={32} />
              <div style={styles.assistantBubble}>
                <div style={styles.assistantLabel}>ZNODE Smart Assistant</div>
                <div style={styles.assistantText}>
                  {msg.content.split("\n").map((line, li) => (
                    <div key={li} style={{ marginTop: li > 0 && line.trim() === "" ? 8 : 0 }}>
                      {renderMarkdown(line)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}

        {loading && (
          <div style={styles.assistantRow}>
            <ZnodeLogo size={32} />
            <div style={styles.assistantBubble}>
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Error bar ──────────────────────────────── */}
      {lastError && (
        <div style={styles.errorBar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {lastError}
        </div>
      )}

      {/* ── Banner slider chips ────────────────────── */}
      {bannerSliderChoices && bannerSliderChoices.length > 0 && (
        <div style={styles.pickerPanel}>
          <div style={styles.pickerTitle}>Choose a Banner Slider</div>
          <div style={styles.chipRow}>
            {bannerSliderChoices.map((c, i) => (
              <button key={`${i}-${c.masterWidgetKey}-${c.cmsSliderId}`} type="button" disabled={loading} onClick={() => void pickBannerSlider(c)} style={styles.chip}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Link panel ─────────────────────────────── */}
      {linkPanel !== null && (
        <div style={styles.pickerPanel}>
          <div style={styles.pickerTitle}>Link Panel — CMS Link Configuration</div>
          {linkPanel.afterCmsSave ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                Link saved to CMS. <strong>Add more</strong> opens the form to save another link (same API). <strong>Finalise</strong> updates the page JSON (LinkPanel{" "}
                <code>widgetKey</code>) using the shared session key (same for every link you add here).
              </div>
              <div style={styles.chipRow}>
                <button type="button" disabled={loading} onClick={() => setLinkPanel((p) => (p ? { ...p, url: "", displayName: "", afterCmsSave: false } : p))} style={styles.chip}>
                  Add more
                </button>
                <button
                  type="button"
                  disabled={loading || !linkPanel.sessionWidgetsKey?.trim()}
                  onClick={() => void finaliseLinkPanelOnPage()}
                  style={{
                    ...styles.chip,
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    opacity: loading || !linkPanel.sessionWidgetsKey?.trim() ? 0.5 : 1,
                    cursor: loading || !linkPanel.sessionWidgetsKey?.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  Finalise
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
              <div style={{ color: "var(--muted)", fontSize: "0.78rem", lineHeight: 1.4 }}>
                <strong>Submit</strong> calls <code>CreateUpdateLinkWidgetConfiguration</code>. The first submit in this panel picks a <code>WidgetsKey</code>; after{" "}
                <strong>Add more</strong>, only <strong>Title</strong> and <strong>Url</strong> change — other gateway fields stay the same. Use <strong>Finalise</strong> when you
                want the page JSON updated.
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontWeight: 500, fontSize: "0.82rem" }}>URL</span>
                <input
                  type="text"
                  inputMode="url"
                  value={linkPanel.url}
                  onChange={(e) => setLinkPanel((p) => (p ? { ...p, url: e.target.value } : p))}
                  placeholder="https://…"
                  disabled={loading}
                  style={styles.linkInput}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontWeight: 500, fontSize: "0.82rem" }}>Display name (link title)</span>
                <input
                  type="text"
                  value={linkPanel.displayName}
                  onChange={(e) => setLinkPanel((p) => (p ? { ...p, displayName: e.target.value } : p))}
                  placeholder="Maps to CMS Title (visible link text)"
                  disabled={loading}
                  style={styles.linkInput}
                />
              </label>
              <div style={styles.chipRow}>
                <button
                  type="button"
                  disabled={loading || !linkPanel.url.trim() || !linkPanel.displayName.trim()}
                  onClick={() => void submitLinkPanel()}
                  style={{
                    ...styles.chip,
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    cursor: loading || !linkPanel.url.trim() || !linkPanel.displayName.trim() ? "not-allowed" : "pointer",
                    opacity: loading || !linkPanel.url.trim() || !linkPanel.displayName.trim() ? 0.5 : 1,
                  }}
                >
                  Submit
                </button>
                {linkPanel.sessionWidgetsKey?.trim() ? (
                  <button
                    type="button"
                    disabled={loading || !linkPanel.sessionWidgetsKey?.trim()}
                    onClick={() => void finaliseLinkPanelOnPage()}
                    style={{
                      ...styles.chip,
                      opacity: loading ? 0.5 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    Finalise
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Product carousel picker ────────────────── */}
      {productCarousel !== null && (
        <div style={{ ...styles.pickerPanel, maxHeight: 260, overflowY: "auto" }}>
          <div style={styles.pickerTitle}>Select Products for Carousel</div>
          {productCarousel.products.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>No unassociated products for this widget key.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {productCarousel.products.map((p) => (
                <label key={p.sku} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    disabled={loading}
                    checked={productCarousel.selectedSkus.includes(p.sku)}
                    onChange={() => toggleProductCarouselSku(p.sku)}
                    style={styles.checkbox}
                  />
                  <span>
                    {p.name}
                    <span style={{ display: "block", fontSize: "0.72rem", color: "var(--muted)" }}>{p.sku}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <div style={{ ...styles.chipRow, marginTop: 12 }}>
            <button type="button" disabled={loading || !productCarousel.hasMore} onClick={() => void loadMoreProductCarousel()} style={styles.chip}>
              Show more
            </button>
            <button
              type="button"
              disabled={loading || productCarousel.selectedSkus.length === 0}
              onClick={() => void confirmProductCarousel()}
              style={{ ...styles.chip, background: "var(--accent)", color: "#fff", border: "none" }}
            >
              Add carousel
            </button>
          </div>
        </div>
      )}

      {/* ── Commands panel (collapsible) ───────────── */}
      <details style={styles.commandsDetails}>
        <summary style={styles.commandsSummary}>Apply commands (no AI, no key) — NDJSON or JSON array</summary>
        <div style={styles.commandsBody}>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => {
                setCommandsInput(DEFAULT_SAMPLE_NDJSON);
                pushAssistant("Loaded **default** sample (Heading, Text, VerticalSpacing, ButtonGroup, Container + root title). Click Apply commands.");
              }}
              style={{ ...styles.chip }}
            >
              Load default sample
            </button>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 6 }}>Insert widget (appends one command — then Apply)</div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 8 }}>
            <button type="button" disabled={loading} onClick={() => appendCmd({ kind: "merge_root_props", target: "main", props: { title: "Page title" } })} style={styles.chip}>
              + Root title
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                appendCmd({
                  kind: "append_component",
                  target: "main",
                  componentType: "Text",
                  props: { align: "left", text: "New text block", padding: { top: "0", right: "0", bottom: "0", left: "0" }, size: "m", color: "default", weight: "normal" },
                  id: newWidgetId("Text"),
                })
              }
              style={styles.chip}
            >
              + Text
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                appendCmd({
                  kind: "append_component",
                  target: "main",
                  componentType: "Heading",
                  props: {
                    align: "left",
                    text: "New heading",
                    margin: { top: "0", right: "0", bottom: "0", left: "0" },
                    padding: { top: "0", right: "0", bottom: "0", left: "0" },
                    border: { width: "0", color: "black", style: "solid", borderRadius: 0 },
                    size: "l",
                    background: "transparent",
                    textColor: "black",
                    level: "2",
                  },
                  id: newWidgetId("Heading"),
                })
              }
              style={styles.chip}
            >
              + Heading
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                appendCmd({
                  kind: "append_component",
                  target: "main",
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
                    image: { src: "", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" },
                  },
                  id: newWidgetId("Container"),
                })
              }
              style={styles.chip}
            >
              + Container
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => appendCmd({ kind: "append_component", target: "main", componentType: "VerticalSpacing", props: { size: "24px" }, id: newWidgetId("VerticalSpacing") })}
              style={styles.chip}
            >
              + Vertical space
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                appendCmd({
                  kind: "append_component",
                  target: "main",
                  componentType: "ButtonGroup",
                  props: { align: "left", buttons: [{ label: "Button", href: "#", variant: "primary", target: "_self" }] },
                  id: newWidgetId("ButtonGroup"),
                })
              }
              style={styles.chip}
            >
              + Button group
            </button>
          </div>
          <textarea value={commandsInput} onChange={(e) => setCommandsInput(e.target.value)} rows={8} spellCheck={false} style={styles.commandsTextarea} disabled={loading} />
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setCommandsInput(SAMPLE_NDJSON)} style={styles.chip}>
              Load sample: category PLP
            </button>
            <button type="button" onClick={() => setCommandsInput(SAMPLE_JSON_ARRAY)} style={styles.chip}>
              Load sample: product PDP
            </button>
            <button type="button" onClick={() => setCommandsInput(SAMPLE_APPEND_EMPTY)} style={styles.chip}>
              Load sample: EmptyBox only
            </button>
            <button
              type="button"
              onClick={() => void applyCommands()}
              disabled={loading}
              style={{ ...styles.chip, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 600 }}
            >
              Apply commands
            </button>
            <button
              type="button"
              onClick={() => {
                setPage(INITIAL_PAGE);
                pushAssistant("Reset page JSON to empty template.");
              }}
              style={styles.chip}
            >
              Reset page
            </button>
          </div>
        </div>
      </details>

      {/* ── Input area ─────────────────────────────── */}
      {chatPanelEnabled ? (
        <div style={styles.inputArea}>
          <div style={styles.inputRow}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              style={styles.textInput}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendChat();
                }
              }}
            />
            <button
              type="button"
              onClick={() => void sendChat()}
              disabled={loading || !chatInput.trim()}
              style={{
                ...styles.sendBtn,
                opacity: loading || !chatInput.trim() ? 0.5 : 1,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => void publishToPreview()}
              disabled={publishLoading}
              style={{
                ...styles.headerBtn,
                opacity: publishLoading ? 0.6 : 1,
                cursor: publishLoading ? "wait" : "pointer",
              }}
              title="Publish to preview"
            >
              {publishLoading ? (
                <span style={{ fontSize: 14 }}>...</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              )}
            </button>
          </div>
          <div style={styles.inputHint}>
            Try: <strong>add banner slider</strong>, <strong>add text</strong>, <strong>set title</strong>, or ask anything
          </div>
        </div>
      ) : (
        <div style={styles.inputArea}>
          <div style={styles.disabledNotice}>
            Chat is currently off. Enable <strong>plain text</strong> mode, or configure <strong>Ollama</strong> / <strong>OpenAI</strong> to get started.
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles: Record<string, CSSProperties> = {
  chatContainer: {
    width: "100%",
    height: "100vh",
    background: "var(--panel)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    background: "#fafbfc",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "var(--text)",
    lineHeight: 1.2,
  },
  headerActions: {
    display: "flex",
    gap: 6,
  },
  headerBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "#fff",
    color: "var(--muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s",
  },

  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minHeight: 200,
  },

  userRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  userBubble: {
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: "14px 14px 4px 14px",
    background: "var(--user-bubble)",
    color: "var(--user-bubble-text)",
    fontSize: "0.88rem",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap" as const,
  },

  assistantRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  assistantBubble: {
    maxWidth: "85%",
    padding: "12px 14px",
    borderRadius: "14px 14px 14px 4px",
    background: "#f8fafc",
    border: "1px solid var(--border)",
    fontSize: "0.88rem",
    lineHeight: 1.6,
  },
  assistantLabel: {
    fontSize: "0.68rem",
    fontWeight: 700,
    color: "var(--accent)",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    marginBottom: 6,
  },
  assistantText: {
    color: "var(--text)",
    whiteSpace: "pre-wrap" as const,
  },

  errorBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    background: "#fef2f2",
    borderTop: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: "0.82rem",
  },

  pickerPanel: {
    padding: "12px 16px",
    borderTop: "1px solid var(--border)",
    background: "#fafbfc",
  },
  pickerTitle: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 10,
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 8,
  },
  chip: {
    padding: "7px 14px",
    borderRadius: 20,
    border: "1.5px solid var(--accent)",
    background: "#f0fdf4",
    color: "var(--accent-dark)",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },

  linkInput: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "#fff",
    color: "var(--text)",
    fontSize: "0.85rem",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  checkbox: {
    marginTop: 3,
    accentColor: "var(--accent)",
  },

  commandsDetails: {
    borderTop: "1px solid var(--border)",
    background: "#fafbfc",
  },
  commandsSummary: {
    padding: "10px 16px",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "var(--muted)",
    cursor: "pointer",
  },
  commandsBody: {
    padding: "0 16px 12px",
  },
  commandsTextarea: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "#fff",
    color: "var(--text)",
    fontFamily: "ui-monospace, monospace",
    fontSize: "0.8rem",
  },

  inputArea: {
    padding: "12px 16px 14px",
    borderTop: "1px solid var(--border)",
    background: "#fafbfc",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 24,
    border: "1.5px solid var(--border)",
    background: "#fff",
    color: "var(--text)",
    fontSize: "0.88rem",
    outline: "none",
    transition: "border-color 0.15s",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  inputHint: {
    fontSize: "0.72rem",
    color: "var(--muted)",
    marginTop: 8,
    paddingLeft: 4,
  },

  disabledNotice: {
    fontSize: "0.85rem",
    color: "var(--muted)",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px dashed var(--border)",
    background: "#fff",
    textAlign: "center" as const,
  },
};
