export {
  applyPageBuilderCommands,
  PAGE_BUILDER_COMMAND_KINDS,
  type ApplyPageBuilderCommandError,
  type ApplyPageBuilderCommandsResult,
  type PageBuilderCommand,
  type PageBuilderCommandTarget,
} from "./commands";

export { parsePageBuilderCommands } from "./parse";

export {
  sampleAppendEmptyBoxCommands,
  sampleCategoryPageCommands,
  sampleCategoryPageNdjson,
  sampleEmptyPageStructure,
  sampleToolArgumentsJson,
} from "./sample-commands";

export {
  applyPageBuilderToolArgumentsToPage,
  getPageBuilderOpenAiTools,
  runPageBuilderLlmWorkflow,
  type PageBuilderLlmWorkflowOptions,
  type PageBuilderLlmWorkflowResult,
} from "./workflow";

export {
  interpretPlainTextPageCommands,
  isPlainTextHelpRequest,
  PLAIN_TEXT_COMMANDS_HELP,
} from "./plain-text-commands";

export { runOllamaPageCommands, type RunOllamaPageCommandsOptions } from "./ollama-commands";

export {
  runOpenAiVisionCommands,
  runOllamaVisionCommands,
  formatCmsWidgetSuggestions,
  type VisionAnalysisResult,
  type CmsWidgetSuggestion,
  type RunOpenAiVisionOptions,
  type RunOllamaVisionOptions,
} from "./vision-commands";

export { WIDGET_CATALOG, buildWidgetCatalogPrompt, type WidgetCatalogEntry } from "./widget-catalog";
