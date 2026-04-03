export const dynamic = "force-dynamic";

import {
  getOllamaConfig,
  isChatPanelEnabled,
  isOpenAiChatReady,
  isPlainTextCommandsEnabled,
} from "../../lib/chat-flags";
import { ChatPageClientUI } from "../chat-page-client-ui";

export default function PageBuilderChatUIPage() {
  return (
    <ChatPageClientUI
      chatPanelEnabled={isChatPanelEnabled()}
      plainTextEnabled={isPlainTextCommandsEnabled()}
      openAiReady={isOpenAiChatReady()}
      ollamaConfigured={getOllamaConfig() !== null}
    />
  );
}
