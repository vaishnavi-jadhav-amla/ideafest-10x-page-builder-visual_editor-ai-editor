import {
  applyPageBuilderCommands,
  type PageBuilderCommand,
} from "@znode/agents/page-builder-config/commands";
import {
  interpretPlainTextPageCommands,
  isPlainTextHelpRequest,
  PLAIN_TEXT_COMMANDS_HELP,
} from "@znode/agents/page-builder-config/plain-text-commands";
import { runOllamaPageCommands } from "@znode/agents/page-builder-config/ollama-commands";
import { parsePageBuilderCommands } from "@znode/agents/page-builder-config/parse";
import { runPageBuilderLlmWorkflow } from "@znode/agents/page-builder-config/workflow";
import type { IPageStructure } from "@znode/types/visual-editor";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import {
  getLlmProviderPreference,
  getOllamaConfig,
  getOllamaRequestTuning,
  isOpenAiChatReady,
  isPageBuilderChatAiEnabled,
} from "../../../lib/chat-flags";
import {
  type BannerSliderChoice,
  buildAdSpaceAppendCommand,
  buildBannerSliderAppendCommand,
  buildHomePagePromoAppendCommand,
  extractBannerSliderWidgetKeyFromProps,
  extractCmsWidgetSliderBannerIdFromBannerProps,
  fetchBannerSliderChoicesFromGateway,
  isAddAdSpaceChatIntent,
  isAddBannerSliderChatIntent,
  isUpdateBannerSliderChatIntent,
  isAddHomePagePromoChatIntent,
  saveCmsContainerDetailsToGateway,
  saveCmsWidgetSliderBannerToGateway,
} from "../../../lib/fetch-slider-list";
import {
  associateProductsWithWidget,
  buildProductsCarouselAppendCommand,
  fetchUnassociatedProductPage,
  findLastProductsCarouselWidgetKeyOnPage,
  instanceIdFromProductCarouselWidgetsKey,
  isAddProductsCarouselChatIntent,
  isUpdateProductsCarouselChatIntent,
  newWidgetsKeyForProductCarouselAdd,
  resolveWidgetsKeyForProductCarouselReuse,
  splitProductCarouselWidgetsKey,
  widgetKeyFromProductsCarouselProps,
  type ProductCarouselPickerPayload,
} from "../../../lib/product-carousel-gateway";
import {
  findLastBannerSliderComponentIdOnPage,
  findPuckComponentById,
  parseUpdateWidgetByInstanceId,
} from "../../../lib/puck-update-by-instance-id";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ChatBody = {
  page: IPageStructure;
  message?: string;
  useCommandsOnly?: boolean;
  commandsText?: string;
  /** After banner-slider picker: CMS master key for Puck (e.g. `"8"`). */
  selectBannerSliderKey?: string;
  selectBannerSliderLabel?: string;
  /** Gateway `CMSSliderId` for SaveCMSWidgetSliderBanner (from slider list row). */
  selectBannerSliderCmsSliderId?: number;
  /** When set with selectBannerSliderKey: merge props on this BannerSlider id instead of appending a new block. */
  updateBannerSliderComponentId?: string;
  /** Load next page of unassociated products for the same `widgetsKey`. */
  productCarouselLoadMore?: { widgetsKey: string; pageIndex: number };
  /** After multi-select: associate SKUs then append ProductsCarousel. */
  productCarouselConfirm?: { widgetsKey: string; skus: string[]; updateComponentId?: string };
};

function jsonResult(
  body: {
    assistantContent: string;
    page: IPageStructure;
    errors: { commandIndex: number; message: string }[];
    applied: number;
    toolArgumentsParsed: { commands: unknown[] }[];
    source?: string;
    bannerSliderChoices?: BannerSliderChoice[];
    /** Client sends this back with the next slider pick to run merge instead of append. */
    bannerSliderUpdateComponentId?: string;
    productCarouselPicker?: ProductCarouselPickerPayload;
  },
  status = 200
) {
  return NextResponse.json(body, { status });
}

async function tryHandleHomePagePromoAdd(
  page: IPageStructure,
  message: string
): Promise<ReturnType<typeof jsonResult> | null> {
  if (!isAddHomePagePromoChatIntent(message)) {
    return null;
  }
  const skipSave =
    process.env.PAGE_BUILDER_SKIP_SAVE_CMS_CONTAINER_DETAILS === "true" ||
    process.env.PAGE_BUILDER_SKIP_SAVE_CMS_CONTAINER_DETAILS === "1";
  const master =
    process.env.PAGE_BUILDER_HOME_PAGE_PROMO_MASTER_KEY?.trim() || "1788";
  const displayName =
    process.env.PAGE_BUILDER_HOME_PAGE_PROMO_DISPLAY_NAME?.trim() || "Home Page Promo";
  const widgetName =
    process.env.PAGE_BUILDER_HOME_PAGE_PROMO_WIDGET_NAME?.trim() || displayName;
  const widgetCode =
    process.env.PAGE_BUILDER_HOME_PAGE_PROMO_WIDGET_CODE?.trim() || "HomePagePromo";
  const containerKey =
    process.env.PAGE_BUILDER_HOME_PAGE_PROMO_CONTAINER_KEY?.trim() || "HomePagePromo";
  const fileName = process.env.PAGE_BUILDER_HOME_PAGE_PROMO_FILE_NAME?.trim() ?? "";
  const instanceId = `HomePagePromo-${randomUUID()}`;
  const uuidPart = instanceId.startsWith("HomePagePromo-")
    ? instanceId.slice("HomePagePromo-".length)
    : instanceId;
  const widgetKey = `${master}-${uuidPart}`;

  if (!skipSave) {
    const saveRes = await saveCmsContainerDetailsToGateway({
      widgetKey,
      displayName,
      widgetName,
      widgetCode,
      containerKey,
      fileName,
    });
    if (!saveRes.ok) {
      const authHint =
        saveRes.status === 401
          ? " Set **PAGE_BUILDER_SLIDER_AUTHORIZATION** or **PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION**."
          : "";
      return jsonResult({
        assistantContent:
          `**SaveCmsContainerDetails** failed (${saveRes.status}): ${saveRes.body.slice(0, 400)}${authHint}` +
          "\n\nPage was not updated.",
        page,
        applied: 0,
        errors: [],
        toolArgumentsParsed: [],
        source: "home-page-promo-save-error",
      });
    }
  }

  const cmd = buildHomePagePromoAppendCommand({
    masterWidgetKey: master,
    displayName,
    instanceId,
  });
  const result = applyPageBuilderCommands(page, [cmd]);
  const lines = result.errors.map((e) => `#${e.commandIndex}: ${e.message}`).join("\n");
  const assistantContent =
    result.errors.length === 0
      ? ""
      : `Home Page Promo: ${result.applied} applied, ${result.errors.length} error(s):\n${lines}`;
  return jsonResult({
    assistantContent,
    page: result.page,
    errors: result.errors,
    applied: result.applied,
    toolArgumentsParsed: [{ commands: [cmd] }],
    source: "home-page-promo-add",
  });
}

async function respondProductCarouselPickerFirstPage(
  page: IPageStructure,
  widgetsKey: string,
  assistantContent: string,
  sourcePicker: string,
  productCarouselUpdateComponentId?: string
) {
  const pageSize = Math.max(
    1,
    Math.min(
      100,
      parseInt(process.env.PAGE_BUILDER_PRODUCT_LIST_PAGE_SIZE?.trim() ?? "10", 10) || 10
    )
  );
  const split = splitProductCarouselWidgetsKey(widgetsKey);
  const masterFromKey =
    split?.masterWidgetKey ??
    (process.env.PAGE_BUILDER_PRODUCT_CAROUSEL_MASTER_KEY?.trim() || "666");
  const displayName =
    process.env.PAGE_BUILDER_PRODUCT_CAROUSEL_DISPLAY_NAME?.trim() || "Product List";
  const listed = await fetchUnassociatedProductPage({
    widgetsKey,
    pageIndex: 1,
    pageSize,
  });
  if (!listed.ok) {
    const authHint =
      listed.error === "missing_auth"
        ? "Set **PAGE_BUILDER_SLIDER_AUTHORIZATION** or **PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION**."
        : "";
    const detail = "detail" in listed ? listed.detail ?? "" : "";
    return jsonResult({
      assistantContent:
        `Could not load unassociated products (**${listed.error}**). ${authHint}\n` +
        (detail ? `\n${detail.slice(0, 500)}` : "") +
        `\n\nCheck **PAGE_BUILDER_GET_UNASSOCIATED_PRODUCT_LIST_URL** and filter env (mapping, locale, widgetcode).`,
      page,
      applied: 0,
      errors: [],
      toolArgumentsParsed: [],
      source: "product-carousel-list-error",
    });
  }
  return jsonResult({
    assistantContent,
    page,
    applied: 0,
    errors: [],
    toolArgumentsParsed: [],
    source: sourcePicker,
    productCarouselPicker: {
      widgetsKey,
      masterWidgetKey: masterFromKey,
      displayName,
      products: listed.items,
      pageIndex: 1,
      pageSize,
      hasMore: listed.hasMore,
      ...(productCarouselUpdateComponentId
        ? { updateComponentId: productCarouselUpdateComponentId }
        : {}),
    },
  });
}

export async function POST(req: Request) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.page || typeof body.page !== "object") {
    return NextResponse.json({ error: "Missing page (IPageStructure)." }, { status: 400 });
  }

  try {
    if (body.useCommandsOnly) {
      const text = (body.commandsText ?? "").trim();
      if (!text) {
        return NextResponse.json({ error: "commandsText is empty." }, { status: 400 });
      }
      let commands;
      try {
        commands = parsePageBuilderCommands(text);
      } catch (parseErr) {
        const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
        return NextResponse.json({ error: `Could not parse commands: ${msg}` }, { status: 400 });
      }
      const result = applyPageBuilderCommands(body.page, commands);
      const lines = result.errors.map((e) => `#${e.commandIndex}: ${e.message}`).join("\n");
      const assistantContent =
        result.errors.length === 0
          ? `Applied ${result.applied} command(s) successfully.`
          : `Applied ${result.applied} command(s) with ${result.errors.length} error(s):\n${lines}`;

      return jsonResult({
        assistantContent,
        page: result.page,
        errors: result.errors,
        applied: result.applied,
        toolArgumentsParsed: [{ commands }],
        source: "json-commands",
      });
    }

    const pickKey = body.selectBannerSliderKey?.trim();
    if (pickKey) {
      const label = body.selectBannerSliderLabel?.trim() || "Banner Slider";
      const skipSave =
        process.env.PAGE_BUILDER_SKIP_SAVE_CMS_WIDGET_SLIDER_BANNER === "true" ||
        process.env.PAGE_BUILDER_SKIP_SAVE_CMS_WIDGET_SLIDER_BANNER === "1";
      const cmsSliderId = body.selectBannerSliderCmsSliderId;
      const updateBannerId = body.updateBannerSliderComponentId?.trim();

      if (updateBannerId) {
        const located = findPuckComponentById(body.page, updateBannerId);
        if (!located || located.type !== "BannerSlider") {
          return NextResponse.json(
            {
              error:
                "updateBannerSliderComponentId must refer to an existing BannerSlider on this page (main/header/footer).",
            },
            { status: 400 }
          );
        }
        const uuidPart = updateBannerId.startsWith("BannerSlider-")
          ? updateBannerId.slice("BannerSlider-".length)
          : updateBannerId;
        const compositeWk = `${pickKey}-${uuidPart}`;
        /** On update, keep CMS + page `widgetKey` stable; only **add** uses `{master}-{uuid}` from the pick. */
        const widgetKeyForUpdate =
          extractBannerSliderWidgetKeyFromProps(located.props)?.trim() || compositeWk;
        const storedBannerId = extractCmsWidgetSliderBannerIdFromBannerProps(located.props);
        let bannerIdAfterSave: number | undefined;

        if (!skipSave) {
          if (typeof cmsSliderId !== "number" || !Number.isFinite(cmsSliderId)) {
            return jsonResult({
              assistantContent:
                "Could not update the banner slider: **selectBannerSliderCmsSliderId** is missing. Pick a row from the list again.",
              page: body.page,
              applied: 0,
              errors: [],
              toolArgumentsParsed: [],
              source: "banner-slider-update-save-missing-id",
            });
          }
          const saveRes = await saveCmsWidgetSliderBannerToGateway({
            cmsSliderId,
            widgetsKey: widgetKeyForUpdate,
            cmsWidgetSliderBannerId: storedBannerId,
          });
          if (!saveRes.ok) {
            const authHint =
              saveRes.status === 401
                ? " Set **PAGE_BUILDER_SLIDER_AUTHORIZATION** or **PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION**."
                : "";
            return jsonResult({
              assistantContent:
                `**SaveCMSWidgetSliderBanner** failed (${saveRes.status}): ${saveRes.body.slice(0, 400)}${authHint}` +
                "\n\nPage was not updated.",
              page: body.page,
              applied: 0,
              errors: [],
              toolArgumentsParsed: [],
              source: "banner-slider-update-save-error",
            });
          }
          bannerIdAfterSave = saveRes.cmsWidgetSliderBannerId;
        }

        const persistedBannerId = bannerIdAfterSave ?? storedBannerId;

        const mergeCmd: PageBuilderCommand = {
          kind: "merge_component_props",
          target: located.target,
          componentId: updateBannerId,
          props: {
            config: {
              type: "Widget",
              id: "BannerSliderWidget",
              hasConfigurable: true,
              widgetConfig: {
                masterWidgetKey: pickKey,
                widgetKey: widgetKeyForUpdate,
                widgetCode: "BannerSlider",
                displayName: label || "Banner Slider",
                ...(persistedBannerId !== undefined && Number.isFinite(persistedBannerId)
                  ? { cmsWidgetSliderBannerId: Math.trunc(persistedBannerId) }
                  : {}),
              },
            },
          },
        };
        const result = applyPageBuilderCommands(body.page, [mergeCmd]);
        const lines = result.errors.map((e) => `#${e.commandIndex}: ${e.message}`).join("\n");
        const assistantContent =
          result.errors.length === 0
            ? `Updated **Banner Slider** \`${updateBannerId}\` (${label}). \`masterWidgetKey\`=\`${pickKey}\`; \`widgetKey\` unchanged (\`${widgetKeyForUpdate}\`).` +
              (skipSave ? "\n\n(SaveCMSWidgetSliderBanner skipped: **PAGE_BUILDER_SKIP_SAVE_CMS_WIDGET_SLIDER_BANNER**.)" : "")
            : `Banner Slider update: ${result.applied} applied, ${result.errors.length} error(s):\n${lines}`;
        return jsonResult({
          assistantContent,
          page: result.page,
          errors: result.errors,
          applied: result.applied,
          toolArgumentsParsed: [{ commands: [mergeCmd] }],
          source: "banner-slider-update",
        });
      }

      const instanceId = `BannerSlider-${randomUUID()}`;
      const uuidPart = instanceId.startsWith("BannerSlider-")
        ? instanceId.slice("BannerSlider-".length)
        : instanceId;
      const compositeWk = `${pickKey}-${uuidPart}`;
      let newBannerCmsId: number | undefined;

      if (!skipSave) {
        if (typeof cmsSliderId !== "number" || !Number.isFinite(cmsSliderId)) {
          return jsonResult({
            assistantContent:
              "Could not add the banner slider: **selectBannerSliderCmsSliderId** is missing. " +
              "Open **add banner slider** again and pick from the list so the gateway slider id is sent.",
            page: body.page,
            applied: 0,
            errors: [],
            toolArgumentsParsed: [],
            source: "banner-slider-save-missing-id",
          });
        }
        const saveRes = await saveCmsWidgetSliderBannerToGateway({
          cmsSliderId,
          widgetsKey: compositeWk,
        });
        if (!saveRes.ok) {
          const authHint =
            saveRes.status === 401
              ? " Set **PAGE_BUILDER_SLIDER_AUTHORIZATION** or **PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION**."
              : "";
          return jsonResult({
            assistantContent:
              `**SaveCMSWidgetSliderBanner** failed (${saveRes.status}): ${saveRes.body.slice(0, 400)}${authHint}` +
              "\n\nPage was not updated.",
            page: body.page,
            applied: 0,
            errors: [],
            toolArgumentsParsed: [],
            source: "banner-slider-save-error",
          });
        }
        newBannerCmsId = saveRes.cmsWidgetSliderBannerId;
      }

      const cmd = buildBannerSliderAppendCommand({
        masterWidgetKey: pickKey,
        displayName: label,
        instanceId,
        cmsWidgetSliderBannerId: newBannerCmsId,
      });
      const result = applyPageBuilderCommands(body.page, [cmd]);
      const lines = result.errors.map((e) => `#${e.commandIndex}: ${e.message}`).join("\n");
      const assistantContent =
        result.errors.length === 0
          ? `Added **Banner Slider** (${label}). \`masterWidgetKey\`=\`${pickKey}\`, \`widgetKey\`=\`${compositeWk}\` (matches your saved JSON shape).` +
            (skipSave ? "\n\n(SaveCMSWidgetSliderBanner skipped: **PAGE_BUILDER_SKIP_SAVE_CMS_WIDGET_SLIDER_BANNER**.)" : "")
          : `Banner Slider: ${result.applied} applied, ${result.errors.length} error(s):\n${lines}`;
      return jsonResult({
        assistantContent,
        page: result.page,
        errors: result.errors,
        applied: result.applied,
        toolArgumentsParsed: [{ commands: [cmd] }],
        source: "banner-slider-add",
      });
    }

    if (body.productCarouselConfirm?.widgetsKey?.trim() && Array.isArray(body.productCarouselConfirm.skus)) {
      const wk = body.productCarouselConfirm.widgetsKey.trim();
      const skus = body.productCarouselConfirm.skus
        .filter((s): s is string => typeof s === "string" && s.trim() !== "")
        .map((s) => s.trim());
      const updateCompId = body.productCarouselConfirm.updateComponentId?.trim();
      if (skus.length === 0) {
        return NextResponse.json(
          { error: "Select at least one product, or start again with add product carousel." },
          { status: 400 }
        );
      }
      const split = splitProductCarouselWidgetsKey(wk);
      const instanceId = instanceIdFromProductCarouselWidgetsKey(wk);
      if (!split || !instanceId) {
        return NextResponse.json({ error: "Invalid product carousel widgetsKey." }, { status: 400 });
      }

      if (updateCompId) {
        const located = findPuckComponentById(body.page, updateCompId);
        if (!located || located.type !== "ProductsCarousel") {
          return NextResponse.json(
            { error: "updateComponentId must refer to an existing ProductsCarousel on this page." },
            { status: 400 }
          );
        }
        const existingWk = widgetKeyFromProductsCarouselProps(located.props);
        if (!existingWk || existingWk !== wk) {
          return NextResponse.json(
            { error: "Product carousel widgetsKey does not match the block being updated." },
            { status: 400 }
          );
        }
        if (instanceId !== updateCompId) {
          return NextResponse.json(
            {
              error:
                "updateComponentId must be the ProductsCarousel instance id for this widgetsKey (e.g. ProductsCarousel-… suffix matches widget key).",
            },
            { status: 400 }
          );
        }
      }

      const displayName =
        process.env.PAGE_BUILDER_PRODUCT_CAROUSEL_DISPLAY_NAME?.trim() || "Product List";
      const skipAssoc =
        process.env.PAGE_BUILDER_SKIP_ASSOCIATE_PRODUCT === "true" ||
        process.env.PAGE_BUILDER_SKIP_ASSOCIATE_PRODUCT === "1";
      if (!skipAssoc) {
        const ass = await associateProductsWithWidget({ widgetsKey: wk, skus });
        if (!ass.ok) {
          const authHint =
            ass.status === 401
              ? " Set **PAGE_BUILDER_SLIDER_AUTHORIZATION** or **PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION**."
              : "";
          return jsonResult({
            assistantContent:
              `**AssociateProduct** failed (${ass.status}): ${ass.body.slice(0, 400)}${authHint}` +
              "\n\nPage was not updated.",
            page: body.page,
            applied: 0,
            errors: [],
            toolArgumentsParsed: [],
            source: "product-carousel-associate-error",
          });
        }
      }
      const associateNote = skipAssoc
        ? "\n\n(**AssociateProduct** was not called — **PAGE_BUILDER_SKIP_ASSOCIATE_PRODUCT** is enabled. Set it to `false` or remove it to sync SKUs to CMS.)"
        : `\n\nCalled **AssociateProduct** for **${skus.length}** SKU(s) with \`widgetsKey\`=\`${wk}\`.`;

      if (updateCompId) {
        return jsonResult({
          assistantContent: `Updated **Products carousel** \`${updateCompId}\` (${skus.length} product(s)).${associateNote}`,
          page: body.page,
          applied: 0,
          errors: [],
          toolArgumentsParsed: [],
          source: "product-carousel-update",
        });
      }

      const cmd = buildProductsCarouselAppendCommand({
        masterWidgetKey: split.masterWidgetKey,
        displayName,
        instanceId,
      });
      const result = applyPageBuilderCommands(body.page, [cmd]);
      const lines = result.errors.map((e) => `#${e.commandIndex}: ${e.message}`).join("\n");
      const assistantContent =
        result.errors.length === 0
          ? `Added **Products carousel** (${skus.length} product(s)).${associateNote}`
          : `Products carousel: ${result.applied} applied, ${result.errors.length} error(s):\n${lines}${associateNote}`;
      return jsonResult({
        assistantContent,
        page: result.page,
        errors: result.errors,
        applied: result.applied,
        toolArgumentsParsed: [{ commands: [cmd] }],
        source: "product-carousel-add",
      });
    }

    if (
      body.productCarouselLoadMore?.widgetsKey?.trim() &&
      typeof body.productCarouselLoadMore.pageIndex === "number" &&
      Number.isFinite(body.productCarouselLoadMore.pageIndex) &&
      body.productCarouselLoadMore.pageIndex >= 1
    ) {
      const wk = body.productCarouselLoadMore.widgetsKey.trim();
      const pageIndex = Math.trunc(body.productCarouselLoadMore.pageIndex);
      const pageSize = Math.max(
        1,
        Math.min(
          100,
          parseInt(process.env.PAGE_BUILDER_PRODUCT_LIST_PAGE_SIZE?.trim() ?? "10", 10) || 10
        )
      );
      const splitLm = splitProductCarouselWidgetsKey(wk);
      const master =
        splitLm?.masterWidgetKey ??
        (process.env.PAGE_BUILDER_PRODUCT_CAROUSEL_MASTER_KEY?.trim() || "666");
      const displayName =
        process.env.PAGE_BUILDER_PRODUCT_CAROUSEL_DISPLAY_NAME?.trim() || "Product List";
      const listed = await fetchUnassociatedProductPage({ widgetsKey: wk, pageIndex, pageSize });
      if (!listed.ok) {
        const authHint =
          listed.error === "missing_auth"
            ? "Set **PAGE_BUILDER_SLIDER_AUTHORIZATION** or **PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION**."
            : "";
        const detail = "detail" in listed ? listed.detail ?? "" : "";
        return jsonResult({
          assistantContent:
            `Could not load products (**${listed.error}**). ${authHint}\n` + (detail ? detail.slice(0, 400) : ""),
          page: body.page,
          applied: 0,
          errors: [],
          toolArgumentsParsed: [],
          source: "product-carousel-list-error",
        });
      }
      return jsonResult({
        assistantContent: "",
        page: body.page,
        applied: 0,
        errors: [],
        toolArgumentsParsed: [],
        source: "product-carousel-more",
        productCarouselPicker: {
          widgetsKey: wk,
          masterWidgetKey: master,
          displayName,
          products: listed.items,
          pageIndex,
          pageSize,
          hasMore: listed.hasMore,
        },
      });
    }

    const message = (body.message ?? "").trim();
    if (!message) {
      return NextResponse.json({ error: "message is empty (or enable commands-only mode)." }, { status: 400 });
    }

    if (isPlainTextHelpRequest(message)) {
      return jsonResult({
        assistantContent: PLAIN_TEXT_COMMANDS_HELP,
        page: body.page,
        applied: 0,
        errors: [],
        toolArgumentsParsed: [],
        source: "help",
      });
    }

    const homePagePromoEarly = await tryHandleHomePagePromoAdd(body.page, message);
    if (homePagePromoEarly) {
      return homePagePromoEarly;
    }

    /**
     * Local keyword parser (add heading, set title, …). Always runs before any LLM so matching
     * shortcuts stay instant. PAGE_BUILDER_CHAT_PLAIN_TEXT only affects UI labeling / docs.
     */
    const plainCommands = interpretPlainTextPageCommands(message);
    if (plainCommands.length > 0) {
      const result = applyPageBuilderCommands(body.page, plainCommands);
      const lines = result.errors.map((e) => `#${e.commandIndex}: ${e.message}`).join("\n");
      const assistantContent =
        result.errors.length === 0
          ? ""
          : `Applied ${result.applied} with ${result.errors.length} error(s):\n${lines}`;
      return jsonResult({
        assistantContent,
        page: result.page,
        errors: result.errors,
        applied: result.applied,
        toolArgumentsParsed: [{ commands: plainCommands }],
        source: "plain-text",
      });
    }

    const instanceUpdate = parseUpdateWidgetByInstanceId(message);
    if (instanceUpdate) {
      const found = findPuckComponentById(body.page, instanceUpdate.componentId);
      if (!found) {
        return jsonResult({
          assistantContent:
            `No component with id \`${instanceUpdate.componentId}\` on this page (searched main, header, footer).`,
          page: body.page,
          applied: 0,
          errors: [],
          toolArgumentsParsed: [],
          source: "update-by-id-not-found",
        });
      }
      if (found.type !== instanceUpdate.componentType) {
        return jsonResult({
          assistantContent:
            `**${instanceUpdate.componentId}** is a **${found.type}** block, not **${instanceUpdate.componentType}**.`,
          page: body.page,
          applied: 0,
          errors: [],
          toolArgumentsParsed: [],
          source: "update-by-id-type-mismatch",
        });
      }
      if (found.type === "ProductsCarousel") {
        const wk = widgetKeyFromProductsCarouselProps(found.props);
        if (!wk) {
          return jsonResult({
            assistantContent:
              `Products Carousel \`${instanceUpdate.componentId}\` has no **widgetKey** in config — open widget settings or re-add the block.`,
            page: body.page,
            applied: 0,
            errors: [],
            toolArgumentsParsed: [],
            source: "update-by-id-no-widget-key",
          });
        }
        return respondProductCarouselPickerFirstPage(
          body.page,
          wk,
          `pick products below — **widgetsKey** from \`${instanceUpdate.componentId}\`.`,
          "product-carousel-picker-by-instance",
          instanceUpdate.componentId
        );
      }
      const listed = await fetchBannerSliderChoicesFromGateway();
      if (!listed.ok) {
        const authHint =
          listed.error === "missing_auth"
            ? "Set **PAGE_BUILDER_SLIDER_AUTHORIZATION** or reuse **PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION** (Basic …)."
            : "";
        const detail = "detail" in listed ? listed.detail ?? "" : "";
        return jsonResult({
          assistantContent:
            `Could not load sliders (**${listed.error}**). ${authHint}\n` +
            (detail ? `\n${detail.slice(0, 500)}` : "") +
            `\n\nCheck **PAGE_BUILDER_SLIDER_LIST_URL**.`,
          page: body.page,
          applied: 0,
          errors: [],
          toolArgumentsParsed: [],
          source: "banner-slider-list-error-by-instance",
        });
      }
      return jsonResult({
        assistantContent: `Pick a slider to bind to **${instanceUpdate.componentId}** (SaveCMSWidgetSliderBanner + update that block).`,
        page: body.page,
        applied: 0,
        errors: [],
        toolArgumentsParsed: [],
        source: "banner-slider-picker-by-instance",
        bannerSliderChoices: listed.items,
        bannerSliderUpdateComponentId: instanceUpdate.componentId,
      });
    }

    if (isUpdateProductsCarouselChatIntent(message)) {
      const wk = resolveWidgetsKeyForProductCarouselReuse(body.page);
      const fromPage = findLastProductsCarouselWidgetKeyOnPage(body.page);
      const intro = fromPage
        ? "pick products below — reusing the **widgetsKey** from the Products Carousel on this page."
        : "pick products below — no Products Carousel on the page yet; using env/default **widgetsKey**.";
      return respondProductCarouselPickerFirstPage(
        body.page,
        wk,
        intro,
        "product-carousel-picker-reuse"
      );
    }

    if (isUpdateBannerSliderChatIntent(message)) {
      const lastId = findLastBannerSliderComponentIdOnPage(body.page);
      if (!lastId) {
        return jsonResult({
          assistantContent:
            "No **Banner Slider** on this page yet. Add one with **add banner slider**, or use **Update BannerSlider-{uuid}** with a block id.",
          page: body.page,
          applied: 0,
          errors: [],
          toolArgumentsParsed: [],
          source: "banner-slider-update-no-block",
        });
      }
      const listed = await fetchBannerSliderChoicesFromGateway();
      if (!listed.ok) {
        const authHint =
          listed.error === "missing_auth"
            ? "Set **PAGE_BUILDER_SLIDER_AUTHORIZATION** or reuse **PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION** (Basic …)."
            : "";
        const detail = "detail" in listed ? listed.detail ?? "" : "";
        return jsonResult({
          assistantContent:
            `Could not load sliders (**${listed.error}**). ${authHint}\n` +
            (detail ? `\n${detail.slice(0, 500)}` : "") +
            `\n\nCheck **PAGE_BUILDER_SLIDER_LIST_URL**.`,
          page: body.page,
          applied: 0,
          errors: [],
          toolArgumentsParsed: [],
          source: "banner-slider-list-error-update-intent",
        });
      }
      return jsonResult({
        assistantContent: `Pick a slider to bind to **${lastId}** (GetCMSWidgetSliderBanner → SaveCMSWidgetSliderBanner + merge that block).`,
        page: body.page,
        applied: 0,
        errors: [],
        toolArgumentsParsed: [],
        source: "banner-slider-picker-update-intent",
        bannerSliderChoices: listed.items,
        bannerSliderUpdateComponentId: lastId,
      });
    }

    if (isAddProductsCarouselChatIntent(message)) {
      const wk = newWidgetsKeyForProductCarouselAdd();
      return respondProductCarouselPickerFirstPage(
        body.page,
        wk,
        "pick products below — new **widgetsKey** for this carousel.",
        "product-carousel-picker-new"
      );
    }

    if (isAddAdSpaceChatIntent(message)) {
      const skipSave =
        process.env.PAGE_BUILDER_SKIP_SAVE_CMS_CONTAINER_DETAILS === "true" ||
        process.env.PAGE_BUILDER_SKIP_SAVE_CMS_CONTAINER_DETAILS === "1";
      const master = process.env.PAGE_BUILDER_AD_SPACE_MASTER_KEY?.trim() || "1787";
      const displayName = process.env.PAGE_BUILDER_AD_SPACE_DISPLAY_NAME?.trim() || "AdSpace";
      const widgetName = process.env.PAGE_BUILDER_AD_SPACE_WIDGET_NAME?.trim() || displayName;
      const widgetCode = process.env.PAGE_BUILDER_AD_SPACE_WIDGET_CODE?.trim() || "AdSpace";
      const containerKey = process.env.PAGE_BUILDER_AD_SPACE_CONTAINER_KEY?.trim() || "AdSpace";
      const fileName = process.env.PAGE_BUILDER_AD_SPACE_FILE_NAME?.trim() ?? "";
      const instanceId = `AdSpace-${randomUUID()}`;
      const uuidPart = instanceId.startsWith("AdSpace-")
        ? instanceId.slice("AdSpace-".length)
        : instanceId;
      const widgetKey = `${master}-${uuidPart}`;

      if (!skipSave) {
        const saveRes = await saveCmsContainerDetailsToGateway({
          widgetKey,
          displayName,
          widgetName,
          widgetCode,
          containerKey,
          fileName,
        });
        if (!saveRes.ok) {
          const authHint =
            saveRes.status === 401
              ? " Set **PAGE_BUILDER_SLIDER_AUTHORIZATION** or **PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION**."
              : "";
          return jsonResult({
            assistantContent:
              `**SaveCmsContainerDetails** failed (${saveRes.status}): ${saveRes.body.slice(0, 400)}${authHint}` +
              "\n\nPage was not updated.",
            page: body.page,
            applied: 0,
            errors: [],
            toolArgumentsParsed: [],
            source: "ad-space-save-error",
          });
        }
      }

      const cmd = buildAdSpaceAppendCommand({
        masterWidgetKey: master,
        displayName,
        instanceId,
      });
      const result = applyPageBuilderCommands(body.page, [cmd]);
      const lines = result.errors.map((e) => `#${e.commandIndex}: ${e.message}`).join("\n");
      const assistantContent =
        result.errors.length === 0
          ? ""
          : `AdSpace: ${result.applied} applied, ${result.errors.length} error(s):\n${lines}`;
      return jsonResult({
        assistantContent,
        page: result.page,
        errors: result.errors,
        applied: result.applied,
        toolArgumentsParsed: [{ commands: [cmd] }],
        source: "ad-space-add",
      });
    }

    if (isAddBannerSliderChatIntent(message)) {
      const listed = await fetchBannerSliderChoicesFromGateway();
      if (!listed.ok) {
        const authHint =
          listed.error === "missing_auth"
            ? "Set **PAGE_BUILDER_SLIDER_AUTHORIZATION** or reuse **PAGE_BUILDER_PUBLISH_PREVIEW_AUTHORIZATION** (Basic …)."
            : "";
        const detail = "detail" in listed ? listed.detail ?? "" : "";
        return jsonResult({
          assistantContent:
            `Could not load sliders from the gateway (**${listed.error}**). ${authHint}\n` +
            (detail ? `\n${detail.slice(0, 500)}` : "") +
            `\n\nCheck **GET /api/slider-list** and **PAGE_BUILDER_SLIDER_LIST_URL**.`,
          page: body.page,
          applied: 0,
          errors: [],
          toolArgumentsParsed: [],
          source: "banner-slider-list-error",
        });
      }
      return jsonResult({
        assistantContent: "pick any slider from below",
        page: body.page,
        applied: 0,
        errors: [],
        toolArgumentsParsed: [],
        source: "banner-slider-picker",
        bannerSliderChoices: listed.items,
      });
    }

    const llmPref = getLlmProviderPreference();
    const ollama = getOllamaConfig();
    const useOllama =
      ollama !== null && (llmPref === "auto" || llmPref === "ollama");

    if (llmPref === "ollama" && !ollama) {
      return jsonResult({
        assistantContent:
          "**Provider is `ollama`** but `PAGE_BUILDER_CHAT_OLLAMA_URL` (or `OLLAMA_HOST`) is not set. " +
          "Set the URL, or switch with **`PAGE_BUILDER_CHAT_LLM_PROVIDER=openai`** (or `auto`).",
        page: body.page,
        applied: 0,
        errors: [],
        toolArgumentsParsed: [],
        source: "ollama-not-configured",
      });
    }

    if (useOllama && ollama) {
      try {
        const tuning = getOllamaRequestTuning();
        const oc = await runOllamaPageCommands({
          page: body.page,
          userRequest: message,
          baseUrl: ollama.url,
          model: ollama.model,
          pageJsonMaxChars: tuning.pageJsonMaxChars,
          formatJson: tuning.formatJson,
          numCtx: tuning.numCtx,
          numPredict: tuning.numPredict,
          numGpu: tuning.numGpu,
        });
        if (oc.length > 0) {
          const result = applyPageBuilderCommands(body.page, oc);
          const lines = result.errors.map((e) => `#${e.commandIndex}: ${e.message}`).join("\n");
          const assistantContent =
            result.errors.length === 0 ? "" : `Ollama path: ${result.applied} applied, ${result.errors.length} error(s):\n${lines}`;
          return jsonResult({
            assistantContent,
            page: result.page,
            errors: result.errors,
            applied: result.applied,
            toolArgumentsParsed: [{ commands: oc }],
            source: "ollama",
          });
        }
        const homePagePromoAfterOllama = await tryHandleHomePagePromoAdd(body.page, message);
        if (homePagePromoAfterOllama) {
          return homePagePromoAfterOllama;
        }
        return jsonResult({
          assistantContent:
            `Ollama (${ollama.model}) returned an empty \`commands\` list. ` +
            `Try a clearer request, or run \`ollama pull ${ollama.model}\` and confirm the model is listed on **GET /api/ollama-health**.`,
          page: body.page,
          applied: 0,
          errors: [],
          toolArgumentsParsed: [],
          source: "ollama-empty",
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const allowOpenAiFallback = llmPref === "auto" && isOpenAiChatReady();
        if (!allowOpenAiFallback) {
          return jsonResult({
            assistantContent:
              `**Ollama error:** ${msg}\n\n` +
              `Check that Ollama is running at \`${ollama.url}\`, the model is installed, and **GET /api/ollama-health** shows the server.` +
              (llmPref === "ollama" && isOpenAiChatReady()
                ? "\n\nTo allow OpenAI when Ollama fails, set **PAGE_BUILDER_CHAT_LLM_PROVIDER=auto**."
                : ""),
            page: body.page,
            applied: 0,
            errors: [],
            toolArgumentsParsed: [],
            source: "ollama-error",
          });
        }
        /* auto: Ollama failed; OpenAI is configured — continue below. */
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const useOpenAi =
      (llmPref === "openai" || llmPref === "auto") &&
      isPageBuilderChatAiEnabled() &&
      Boolean(apiKey?.trim());
    if (useOpenAi) {
      const result = await runPageBuilderLlmWorkflow({
        page: body.page,
        userRequest: message,
        apiKey,
        model: process.env.OPENAI_MODEL ?? "gpt-4o",
      });

      return jsonResult({
        assistantContent: result.assistantContent ?? "",
        page: result.page,
        errors: result.errors,
        applied: result.applied,
        toolArgumentsParsed: result.toolArgumentsParsed,
        source: "openai",
      });
    }

    return jsonResult({
      assistantContent:
        `No engine handled this message.\n\n${PLAIN_TEXT_COMMANDS_HELP}\n\n` +
        `Optional: **PAGE_BUILDER_CHAT_OLLAMA_URL** (Ollama), **OPENAI_API_KEY** (OpenAI), and **PAGE_BUILDER_CHAT_LLM_PROVIDER** = auto | ollama | openai.`,
      page: body.page,
      applied: 0,
      errors: [],
      toolArgumentsParsed: [],
      source: "none",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
