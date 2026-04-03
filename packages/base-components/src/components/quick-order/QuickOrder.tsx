"use client";
import React, { Suspense, useState } from "react";
import { IDynamicFormDefault } from "@znode/types/quick-order";
import { QuickOrderUsingExcel } from "./QuickOrderUsingExcel";
import { useTranslationMessages } from "@znode/utils/component";
import { DynamicFormTemplate } from "../common/dynamic-form-template";

export function QuickOrder() {
  const [skuIdList, setSkuIdList] = useState<IDynamicFormDefault[]>([]);
  const [skuIdListForm, setSkuIdListForm] = useState<IDynamicFormDefault[]>([]);
  const [selectedTab, setSelectedTab] = useState(1);
  const quickOrderTranslations = useTranslationMessages("QuickOrder");
  const handleTabClick = (tabNumber: number) => {
    setSelectedTab(tabNumber);
  };

  return (
    <div className="flex gap-4 mt-8 xs:flex-col md:flex-row">
      <div className={"w-full md:w-1/2"} data-test-selector="divQuickOrderDetailsContainer">
        <div className={"flex flex-col gap-4 pb-4 pr-2"} data-test-selector="divQuickOrderHeading">
          <h2 className={"text-4xl font-semibold text-start"} data-test-selector="hdgQuickOrder">
            {quickOrderTranslations("quickOrder")}
          </h2>
          <p data-test-selector="paraNote">
            <strong className={"font-semibold"}>{quickOrderTranslations("note")}:</strong> {quickOrderTranslations("quickOrderLimit")}
          </p>
        </div>
        <div className={"flex border-b border-slate-300 font-semibold"}>
          <div
            onClick={() => handleTabClick(1)}
            className={selectedTab === 1 ? "text-blue-500 border-b border-blue-500 p-2 cursor-pointer" : "tab p-2 cursor-pointer"}
            data-test-selector="divSearchSkuStepsContainer"
          >
            {quickOrderTranslations("search")}
          </div>
          <div
            onClick={() => handleTabClick(2)}
            className={selectedTab === 2 ? "text-blue-500 border-b border-blue-500 p-2 cursor-pointer uppercase" : "tab p-2 cursor-pointer uppercase"}
            data-test-selector="divUploadLink"
          >
            {quickOrderTranslations("uploadMultiple")}
          </div>
        </div>
        {selectedTab === 1 && (
          <div className={"py-4 flex flex-col gap-3"}>
            <p className={"text-sm"} data-test-selector="paraQuickOrderInfoHeading">
              {quickOrderTranslations("quickOrderInfo")}{" "}
            </p>
            <div className={"flex flex-col gap-3"} data-test-selector="divQuickOrderInfoContainer">
              <p className={"text-sm"} data-test-selector="paraStep1">
                {" "}
                <strong className={"font-semibold text-base"}>{quickOrderTranslations("step") + " 1: "}</strong>
                {quickOrderTranslations("quickOrderInfoStepFirst")}
              </p>
              <p className={"text-sm"} data-test-selector="paraStep2">
                {" "}
                <strong className={"font-semibold text-base"}>{quickOrderTranslations("step") + " 2: "}</strong>
                {quickOrderTranslations("quickOrderInfoStepSecond")}
              </p>
            </div>
          </div>
        )}
        {selectedTab === 2 && (
          <div className={"py-4"} data-test-selector="divQuickOrderExcel">
            <QuickOrderUsingExcel setSkuIdList={setSkuIdList} skuIdList={skuIdList} skuIdListForm={skuIdListForm} />
          </div>
        )}
      </div>
      <div className={"w-full md:w-1/2"} data-test-selector="divQuickOrderTemplate">
        <Suspense>
          <DynamicFormTemplate
            defaultData={skuIdList}
            setDefaultData={setSkuIdList}
            buttonText={quickOrderTranslations("addToCart")}
            action={"AddToCart"}
            setSkuIdListForm={setSkuIdListForm}
          />
        </Suspense>
      </div>
    </div>
  );
}
