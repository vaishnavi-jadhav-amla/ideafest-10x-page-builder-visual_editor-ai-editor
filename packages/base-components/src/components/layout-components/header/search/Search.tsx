import { useEffect, useState } from "react";

import { LoaderComponent } from "../../../common/loader-component";
import { SearchBox } from "../search-box/SearchBox";
import dynamic from "next/dynamic";

export const DynamicVoiceSearch = dynamic(() => import("../voice-search/VoiceSearch"), {
  loading: () => (
    <div className="flex justify-start mr-3">
      <LoaderComponent isLoading={true} width="22px" height="22px" />
    </div>
  ),
  ssr: false,
});

export function Search(props: { barcode: boolean; voiceSearch: boolean; isTypeahead: boolean; isHydratedSearch: boolean; dataTestSelector?: string }) {
  const { barcode, voiceSearch, dataTestSelector, isTypeahead, isHydratedSearch } = props;
  const [loader, setLoader] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [voiceSearchMessage, setVoiceSearchMessage] = useState<string>("");
  const [voiceTranscriptValue, setVoiceTranscriptValue] = useState<string>("");
  const [finalTranscriptValue, setFinalTranscriptValue] = useState<string>("");
  const [isVoiceSearchStarted, setIsVoiceSearchStarted] = useState<boolean>(false);

  const handleAfterRedirectVoiceEvent = () => {
    setFinalTranscriptValue("");
    setVoiceTranscriptValue("");
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth < 640);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    if (loader)
      setTimeout(() => {
        setLoader(false);
      }, 5000);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1" data-test-selector={`div${dataTestSelector || "SearchText"}`}>
      <div className="flex w-full">
        <SearchBox
          finalTranscriptValue={finalTranscriptValue}
          voiceSearchMessage={voiceSearchMessage}
          transcript={voiceTranscriptValue}
          handleAfterRedirectVoiceEvent={handleAfterRedirectVoiceEvent}
          isVoiceSearchStarted={isVoiceSearchStarted}
          isMobile={isMobile}
          hasBarcode={barcode}
          hasVoiceSearch={voiceSearch}
          setVoiceSearchMessage={setVoiceSearchMessage}
          setVoiceTranscriptValue={setVoiceTranscriptValue}
          setFinalTranscriptValue={setFinalTranscriptValue}
          setIsVoiceSearchStarted={setIsVoiceSearchStarted}
          dataTestSelector={dataTestSelector}
          isTypeaheadSearch={isTypeahead}
          isHydratedSearch={isHydratedSearch}
        />
      </div>
    </div>
  );
}
