"use client";

import type { Data } from "@measured/puck";
import { PageEditor } from "@znode/page-builder";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { setPage } from "@znode/page-builder/utils/set-page";
import { SessionProvider } from "next-auth/react";
import { OverlayLoader } from "@znode/base-components/common/loader-component";
import { IPageStructure } from "@znode/types/visual-editor";
import { PAGE_CONSTANTS } from "@znode/page-builder/constants";
import { AiChatIframe } from "./ai-chat-iframe";

interface IClientProps {
  pageStructure: IPageStructure;
  themeName: string;
  url: string;
  storeCode?: string;
  pageCode?: string;
  contentPageCode?: string;
  mode?: string;
}
/** postMessage category emitted by PageEditor.onChangeDataToParentIframe */
const NOTIFY_VISUAL_EDITOR_CHANGES = "notify_visual_editor_changes";

function Client(props: Readonly<IClientProps>) {
  const { url, themeName, pageStructure } = props || {};
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /**
   * Mirrors the live page state so the AI chat always receives up-to-date data.
   * Updated via the `notify_visual_editor_changes` postMessage from PageEditor.
   */
  const [currentPageStructure, setCurrentPageStructure] = useState<IPageStructure>(pageStructure);
  /**
   * Bumping this key forces the Puck editor to remount with new data when the AI
   * chat pushes a page update.
   */
  const [editorKey, setEditorKey] = useState(0);

  /**
   * When the AI chat pushes a page update, Puck remounts (editorKey bump) and its
   * onChange fires immediately, broadcasting a NOTIFY_VISUAL_EDITOR_CHANGES message.
   * Without this guard the handler would call setCurrentPageStructure again (echo),
   * which triggers AiChatIframe to re-sync the page back to the chat iframe —
   * causing visible flickering / multiple re-renders.
   */
  const chatUpdateInProgressRef = useRef(false);

  /**
   * Debounce timer for streaming page updates. During streaming, we receive
   * many partial_page events in rapid succession. We debounce the editorKey
   * bump so Puck remounts at most once per interval (not per widget).
   */
  const streamingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * PageEditor broadcasts every Puck change to window.parent via postMessage
   * (category: "notify_visual_editor_changes"). In standalone mode window.parent
   * === window, so the event lands here. We capture it to keep currentPageStructure
   * in sync, which the AI chat iframe reads via the page prop on AiChatIframe.
   */
  useEffect(() => {
    function handleEditorChange(event: MessageEvent) {
      if (event.data?.category !== NOTIFY_VISUAL_EDITOR_CHANGES) return;
      // Skip the echo event that fires when Puck remounts after a chat-initiated update.
      if (chatUpdateInProgressRef.current) return;
      const pageJson = event.data?.data?.pageJson as IPageStructure | undefined;
      if (pageJson && typeof pageJson === "object") {
        setCurrentPageStructure(pageJson);
      }
    }
    window.addEventListener("message", handleEditorChange);
    return () => window.removeEventListener("message", handleEditorChange);
  }, []);

  /**
   * Called by AiChatIframe when the AI chat produces an updated page structure.
   * Applying the new structure requires remounting Puck (editorKey bump) because
   * the `data` prop in Puck is used only as initial state.
   */
  const handlePageUpdateFromChat = useCallback((updatedPage: IPageStructure) => {
    // Clear any pending streaming debounce — the final update supersedes partials.
    if (streamingDebounceRef.current) {
      clearTimeout(streamingDebounceRef.current);
      streamingDebounceRef.current = null;
    }
    chatUpdateInProgressRef.current = true;
    setCurrentPageStructure(updatedPage);
    setEditorKey((k) => k + 1);
    // Allow enough time for Puck to remount and fire its initial onChange before
    // resuming normal NOTIFY_VISUAL_EDITOR_CHANGES processing.
    setTimeout(() => {
      chatUpdateInProgressRef.current = false;
    }, 1000);
  }, []);

  /**
   * Called by AiChatIframe during LLM streaming — partial page updates arrive
   * as the AI generates widgets. We debounce the editorKey bump so Puck
   * remounts at most once every 800ms, giving a smooth "widgets appearing"
   * effect without excessive flicker.
   */
  const handleStreamingPageUpdate = useCallback((partialPage: IPageStructure) => {
    chatUpdateInProgressRef.current = true;
    setCurrentPageStructure(partialPage);

    // Debounce the key bump: clear any pending bump, schedule a new one
    if (streamingDebounceRef.current) {
      clearTimeout(streamingDebounceRef.current);
    }
    streamingDebounceRef.current = setTimeout(() => {
      setEditorKey((k) => k + 1);
      streamingDebounceRef.current = null;
      // Keep the guard active during streaming — the final CHAT_PAGE_UPDATE
      // will trigger handlePageUpdateFromChat which resets it after 1000ms.
      setTimeout(() => {
        chatUpdateInProgressRef.current = false;
      }, 1000);
    }, 800);
  }, []);

  // Prevent scroll events from changing input[type="number"] values
  useEffect(() => {
    const preventValueChangeOnScroll = (e: WheelEvent) => {
      if (document.activeElement instanceof HTMLInputElement && document.activeElement.type === "number" && document.activeElement.contains(e.target as Node)) {
        e.preventDefault(); // Prevent value change
      }
    };

    const allowScroll = () => {
      // Allow scrolling for the rest of the page
      if (document.activeElement instanceof HTMLInputElement) {
        document.activeElement.blur(); // Unfocus input when scrolling starts
      }
    };

    document.addEventListener("wheel", preventValueChangeOnScroll, { passive: false });
    window.addEventListener("wheel", allowScroll);

    return () => {
      document.removeEventListener("wheel", preventValueChangeOnScroll);
      window.removeEventListener("wheel", allowScroll);
    };
  }, []);

  async function publishHandler(data: Data) {
    setIsLoading(true);
    const cloneData = JSON.parse(JSON.stringify(data));
    setPage({
      url,
      data: cloneData,
      theme: themeName,
    }).finally(() => {
      setIsLoading(false);
    });
  }

  let configType = "common";
  if (props.url.startsWith("category") || props.pageCode?.startsWith("category")) {
    configType = "category";
  } else if (props.url.startsWith("product") || props.pageCode?.startsWith("product")) {
    configType = "product";
  } else if (props.url.startsWith("brand/list") || props.pageCode?.startsWith("brandlist")) {
    configType = "brand-list";
  } else if (props.url.startsWith("brand") || props.pageCode?.startsWith("BrandDetails")) {
    configType = "brand-details";
  } else if (props.url.startsWith("blog/list") || props.pageCode?.startsWith("BlogList")) {
    configType = "blog-list";
  } else if (props.url.startsWith("blog") || props.pageCode?.startsWith("BlogDetails")) {
    configType = "blog-details";
  } else if (props.url.startsWith("store-locator") || props.pageCode?.startsWith("StoreLocator")) {
    configType = "store-locator";
  } else if (props.url.startsWith("contactus") || props.pageCode?.startsWith("contactus")) {
    configType = "contact-us";
  } else if (props.url.startsWith("feedback") || props.pageCode?.startsWith("feedback")) {
    configType = "feedback";
  } else if (props.url.startsWith("maintenance") || props.pageCode?.startsWith("maintenance")) {
    configType = "maintenance";
  } else if (props.url.startsWith(PAGE_CONSTANTS.URLS.HEADER) || props.pageCode?.startsWith(PAGE_CONSTANTS.URLS.HEADER)) {
    configType = PAGE_CONSTANTS.URLS.HEADER;
  } else if (props.url.startsWith(PAGE_CONSTANTS.URLS.FOOTER) || props.pageCode?.startsWith(PAGE_CONSTANTS.PAGE_CODES.FOOTER)) {
    configType = PAGE_CONSTANTS.URLS.FOOTER;
  } else if (props.pageCode?.startsWith(PAGE_CONSTANTS.PAGE_CODES.CART)) {
    configType = PAGE_CONSTANTS.URLS.CART;
  } else if (props.pageCode?.startsWith(PAGE_CONSTANTS.PAGE_CODES.CHECKOUT)) {
    configType = PAGE_CONSTANTS.URLS.CHECKOUT;
  }

  return (
    <SessionProvider>
      <PageEditor
        key={editorKey}
        pageStructure={currentPageStructure}
        onPublish={publishHandler}
        configParams={{
          theme: props.themeName,
          configType: configType,
        }}
        mode={props?.mode}
      />

      <AiChatIframe
        page={currentPageStructure}
        onPageUpdate={handlePageUpdateFromChat}
        onStreamingPageUpdate={handleStreamingPageUpdate}
      />
      {isLoading && <OverlayLoader color="#fff" />}
    </SessionProvider>
  );
}

export default Client;
