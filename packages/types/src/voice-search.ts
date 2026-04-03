export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (_event: ISpeechRecognitionEvent) => void;
  onerror: (_event: ISpeechRecognitionErrorEvent) => void;
}

export interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionResultList {
  [index: number]: ISpeechRecognitionResult;
  readonly length: number;
}

interface ISpeechRecognitionResult {
  [index: number]: ISpeechRecognitionAlternative;
  readonly isFinal: boolean;
  readonly length: number;
}

interface ISpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
