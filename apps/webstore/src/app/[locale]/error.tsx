"use client";

import { useTranslationMessages } from "@znode/utils/component";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function Error({ reset, error }: ErrorProps) {
  const commonTranslations = useTranslationMessages("Common");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div
        className="bg-white rounded-lg p-6 h-96 overflow-y-auto flex-col justify-center items-center">
        <p className="text-base tracking-tight text-gray-900 p-5">{error ? JSON.stringify(error.stack) : commonTranslations("somethingWentWrong")}</p>
        <div className="flex justify-center">
        <button onClick={() => reset()} type="button" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
          {commonTranslations("tryAgain")}
        </button>
        </div>
      </div>
    </div>
  );
}
