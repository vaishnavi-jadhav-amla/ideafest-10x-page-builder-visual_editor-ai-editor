import { LoadingSpinner } from "../icons";
import { NoRecordFound } from "../no-record-found";
import React from "react";
import { useTranslationMessages } from "@znode/utils/component";

interface LoaderProps {
  isLoading: boolean;
  loaderText?: string;
}

const LoaderTableComponent: React.FC<LoaderProps> = ({ isLoading, loaderText }) => {
  const commonTranslations = useTranslationMessages("Common");

  return (
    <div className="flex items-center justify-center pt-5 mt-3" data-test-selector="divNoRecordsFoundLabel">
      {isLoading ? <LoadingSpinner width="40px" height="40px" /> : loaderText || <NoRecordFound text={commonTranslations("noRecordsFound")} />}
    </div>
  );
};

export default LoaderTableComponent;
