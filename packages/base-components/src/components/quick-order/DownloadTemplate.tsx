"use client";
import Link from "next/link";
import { errorStack, logServer } from "@znode/logger/server";
import { downloadTemplate } from "../../http-request";
import { useTranslationMessages } from "@znode/utils/component";
import { ZIcons } from "../common/icons";

export function DownloadTemplate() {
  const quickOrderTranslations = useTranslationMessages("QuickOrder");

  const downloadFile = async (filePath: string) => {
    try {
      const response = await downloadTemplate(filePath);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filePath.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      logServer.error("There was an error downloading the file:", errorStack(error));
    }
  };

  return (
    <div className="flex flex-col gap-3 my-3">
      <p className="text-base font-semibold text-zinc-700" data-test-selector="paraSpreadsheetGuide">
        {quickOrderTranslations("templateGuideHeading")}
      </p>
      <div className="flex bg-indigo-50 w-fit p-3 rounded-sm" data-test-selector="divDownloadSpreadsheetTemplate">
        <span className="icon-file-upload"></span>
        <div>
          <ZIcons name="file-check" color="#5db043" />
        </div>
        <span className="flex flex-col px-2">
          <p className="text-xs font-semibold">{quickOrderTranslations("templateGuideDownloadOptionHeading")}</p>
          <div className="flex gap-2 font-semibold text-blue-500">
            <Link data-test-selector="linkCSVFile" href="javascript:void(0)" onClick={() => downloadFile("QuickOrderCSVTemplate.csv")}>
              {quickOrderTranslations("csv")}
            </Link>
            <Link data-test-selector="linkXLSXFile" href="javascript:void(0)" onClick={() => downloadFile("QuickOrderExcelTemplate.xlsx")}>
              {quickOrderTranslations("xlsx")}
            </Link>
          </div>
        </span>
      </div>
      <p className="text-base text-zinc-700" data-test-selector="paraTemplateGuideSubHeading">
        {quickOrderTranslations("templateGuideSubHeading")}
      </p>
    </div>
  );
}
