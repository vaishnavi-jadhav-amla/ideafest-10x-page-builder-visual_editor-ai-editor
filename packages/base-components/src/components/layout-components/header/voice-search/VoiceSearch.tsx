"use client";

import { AREA, errorStack, logServer } from "@znode/logger/server";
import { ISpeechRecognition, ISpeechRecognitionErrorEvent, ISpeechRecognitionEvent } from "@znode/types/voice-search";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getCookie, useTranslationMessages } from "@znode/utils/component";

import Button from "../../../common/button/Button";
import { SETTINGS } from "@znode/constants/settings";
import { Tooltip } from "../../../common/tooltip";
import { VoiceSearchIcon } from "../../../common/icons";
import { useToast } from "../../../../stores";

// TODO : Remove below debounce method and use from common
export const debounce = (callback: CallableFunction, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

interface Props {
  setVoiceSearchMessage: React.Dispatch<React.SetStateAction<string>>;
  setVoiceTranscriptValue: React.Dispatch<React.SetStateAction<string>>;
  setFinalTranscriptValue: React.Dispatch<React.SetStateAction<string>>;
  finalTranscriptValue: string;
  setIsVoiceSearchStarted: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function VoiceSearch({ setVoiceSearchMessage, setVoiceTranscriptValue, setFinalTranscriptValue, finalTranscriptValue, setIsVoiceSearchStarted }: Props) {
  const { error } = useToast();
  const voiceSearchTranslations = useTranslationMessages("VoiceSearch");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recorderStopped, setRecorderStopped] = useState<boolean>(false);
  const [isBrowserNotSupported, setIsBrowserNotSupported] = useState<boolean>(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetTranscript = useCallback(
    debounce((finalTranscript: string, interimTranscript: string) => {
      setVoiceTranscriptValue(trimString(finalTranscript + interimTranscript));
    }, 100),
    []
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetFinalTranscript = useCallback(
    debounce((finalTranscript: string) => {
      setFinalTranscriptValue(trimString(finalTranscript));
    }, 100),
    []
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const speechRecognition = window ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

    if (!speechRecognition) {
      setIsBrowserNotSupported(true);
      return;
    }

    recognitionRef.current = new speechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //This useEffect is for when my voice search get's redirected to it's result page and then I want to stop the voice search.
  useEffect(() => {
    return () => {
      stopRecording();
      setRecorderStopped(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalTranscriptValue]);

  const voiceTranscript = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = getCookie("NEXT_LOCALE") || SETTINGS.DEFAULT_LOCALE;

    recognitionRef.current.onresult = function (event: ISpeechRecognitionEvent) {
      setVoiceSearchMessage("");
      let finalTranscript = "";
      let interimTranscript = "";
      const currentIndex = event.resultIndex;
      for (let i = currentIndex; i < event.results.length; i++) {
        const result = event?.results[i];
        if (result) {
          if (result.isFinal) {
            finalTranscript += result[0]?.transcript;
          } else {
            interimTranscript += result[0]?.transcript;
          }
        }
      }

      debouncedSetTranscript(finalTranscript, interimTranscript);
      if (finalTranscript !== "") {
        debouncedSetFinalTranscript(finalTranscript);
        recognitionRef.current?.stop();
      }
    };

    recognitionRef.current.onerror = function (event: ISpeechRecognitionErrorEvent) {
      logServer.error(AREA.VOICE_SEARCH, errorStack(event.error));
      setIsListening(false);
      setVoiceSearchMessage("");
      setVoiceTranscriptValue("");
      setRecorderStopped(true);
      recognitionRef?.current?.stop();
    };
  };

  const voiceRecordAction = (recordStopped: boolean, searchMessage: string, isListening: boolean, voiceStarted: boolean, action: string) => {
    setRecorderStopped(recordStopped);
    setVoiceSearchMessage(searchMessage);
    setIsListening(isListening);
    setIsVoiceSearchStarted(voiceStarted);
    if (action === "start") {
      recognitionRef.current?.start();
    } else {
      recognitionRef.current?.stop();
    }
  };

  const startRecording = () => {
    if (isBrowserNotSupported) {
      error(voiceSearchTranslations("browserNotSupported"));
    } else if (recognitionRef.current) {
      voiceRecordAction(false, voiceSearchTranslations("voiceActive"), true, true, "start");
      voiceTranscript();
    }
  };

  const stopRecording = () => {
    if (isListening) {
      if (recognitionRef.current) {
        voiceRecordAction(true, "", false, false, "stop");
        setVoiceTranscriptValue("");
      }
    }
  };

  function trimString(textToTrim: string): string {
    if (!textToTrim) return "";
    return textToTrim.trim().replace(".", "");
  }

  return (
    <div>
      {!isListening || recorderStopped ? (
        <Tooltip message={voiceSearchTranslations("voiceSearchToolTipMessage")}>
          <Button
            type="text"
            size="small"
            dataTestSelector="btnVoiceSearchIcon"
            startIcon={<VoiceSearchIcon dataTestSelector="svgVoiceSearch" color="#757575" />}
            onClick={startRecording}
            className="py-2 icon-voice-search relative xs:px-0 mt-1 pt-1 xs:mr-3"
            ariaLabel="voice search icon"
          />
        </Tooltip>
      ) : (
        <Button
          type="text"
          size="small"
          dataTestSelector="btnVoiceClose"
          startIcon={<VoiceSearchIcon dataTestSelector="svgVoiceSearch" color="#FF0000" />}
          onClick={stopRecording}
          className="icon-voice-search-close relative xs:px-0 mt-1 pt-1 xs:mr-3 xs:mt-1"
          ariaLabel="voice search close"
        />
      )}
    </div>
  );
}
