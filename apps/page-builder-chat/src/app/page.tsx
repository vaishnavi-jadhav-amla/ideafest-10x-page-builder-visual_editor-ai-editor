import { ChatPageClient } from "./chat-page-client";
import {
  getOllamaConfig,
  isChatPanelEnabled,
  isOpenAiChatReady,
  isPlainTextCommandsEnabled,
} from "../lib/chat-flags";

/** Env must be read at request time; otherwise PAGE_BUILDER_CHAT_OLLAMA_URL from .env can look "unset" in the UI. */
export const dynamic = "force-dynamic";

export default function PageBuilderChatPage() {
  return (
    <ChatPageClient
      chatPanelEnabled={isChatPanelEnabled()}
      plainTextEnabled={isPlainTextCommandsEnabled()}
      openAiReady={isOpenAiChatReady()}
      ollamaConfigured={getOllamaConfig() !== null}
    />
  );
}
