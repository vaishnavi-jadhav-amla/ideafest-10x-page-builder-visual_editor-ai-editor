export const dynamic = "force-dynamic";

import {
  getOllamaConfig,
  isChatPanelEnabled,
  isOpenAiChatReady,
  isPlainTextCommandsEnabled,
} from "../../lib/chat-flags";
import PuckEditorClient from "./puck-editor-client";

export default function PageBuilderChatUIPage() {
  return (
    <PuckEditorClient
      chatPanelEnabled={isChatPanelEnabled()}
      plainTextEnabled={isPlainTextCommandsEnabled()}
      openAiReady={isOpenAiChatReady()}
      ollamaConfigured={getOllamaConfig() !== null}
    />
  );
}
