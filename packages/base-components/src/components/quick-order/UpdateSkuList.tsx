"use client";
import React, { ForwardedRef, forwardRef } from "react";
import { useTranslationMessages } from "@znode/utils/component";
import Button from "../common/button/Button";

interface IUpdateSKUList {
  submitData: () => void;
  loading: boolean;
}

export const UpdateSkuList = forwardRef((props: IUpdateSKUList, ref: ForwardedRef<HTMLTextAreaElement>) => {
  const { loading, submitData } = props;
  const quickOrderTranslations = useTranslationMessages("QuickOrder");

  return (
    <>
      <p className="text-base font-semibold text-zinc-700" data-test-selector="paraSkuListHeading">
        {quickOrderTranslations("skuListHeading")}
      </p>
      <textarea
        data-test-selector="txtSkuList"
        className="border border-slate-400 rounded-sm
               h-40 resize-none px-2 py-1 w-full"
        placeholder=""
        ref={ref}
      />
      <div className="lg:flex flex-row-reverse gap justify-between">
        <div>
          <Button
            className="uppercase tracking-wider text-sm lg:ml-4 xs:px-12 w-full lg:w-auto my-3 lg:my-0"
            dataTestSelector="btnSkuListAddAllToQuickList"
            value={quickOrderTranslations("skuListAddAllToQuickList")}
            loading={loading}
            type="primary"
            showLoadingText={true}
            loaderColor="currentColor"
            loaderWidth="20px"
            loaderHeight="20px"
            onClick={() => {
              submitData();
            }}
            ariaLabel="SKU list button"
          >
            {quickOrderTranslations("skuListAddAllToQuickList")}
          </Button>
        </div>
        <div className="w-full lg:w-2/4">
          <p className="font-semibold text-zinc-700" data-test-selector="paraFormattedExample">
            {quickOrderTranslations("skuListFormattedExample")}
          </p>
          <ul className=" list-disc text-zinc-700 pl-6" data-test-selector="listFormattedSkuList">
            <li data-test-selector="listSkuFormatRoleOne">{quickOrderTranslations("skuListFormatRoleOne")}</li>
            <li data-test-selector="listSkuFormatRoleTwo">{quickOrderTranslations("skuListFormatRoleTwo")}</li>
          </ul>
        </div>
      </div>
    </>
  );
});
