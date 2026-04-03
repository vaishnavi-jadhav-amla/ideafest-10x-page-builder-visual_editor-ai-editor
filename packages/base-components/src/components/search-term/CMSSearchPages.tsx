import { ICMSPages, ISearchCMSPages } from "@znode/types/keyword-search";

import { DynamicPagination } from "../common/pagination";
import { IPageList } from "@znode/types/portal";
import Link from "next/link";
import { useTranslationMessages } from "@znode/utils/component";
import { Separator } from "../common/separator";

export function CMSSearchPages({
  searchCMSPagesData,
  searchTerm,
  pageList,
  pageSize,
}: {
  searchCMSPagesData: ISearchCMSPages;
  searchTerm: string;
  pageList: IPageList[];
  pageSize: number | null;
}) {
  const SearchTranslations = useTranslationMessages("CMSSearch");
  const { cmsPages, totalCMSPageCount } = searchCMSPagesData;
  const renderCMSSearchPagesData = (cmsPagesData: ICMSPages[]) => {
    return (
      cmsPagesData &&
      cmsPagesData.map((cmsPageData: ICMSPages, index: number) => {
        const { seoTitle, seoDescription, seoUrl, pageTitle, contentPageId } = cmsPageData;

        return (
          <>
            <div className="px-3 py-2" key={contentPageId} data-test-selector={`divCMSPageWrapper${contentPageId}`}>
              <div className="font-semibold text-2xl pb-2">
              <Link data-test-selector={`lnkCMSPageTitle${contentPageId}`} href={`/${seoUrl ? seoUrl || contentPageId : `content/${contentPageId}`}`}>
                {seoTitle ? seoTitle : pageTitle}
                </Link>
              </div>
              {seoDescription && (
                <p data-test-selector={`paraCMSPageDescription${contentPageId}`} className="pb-2">
                  {seoDescription}
                </p>
              )}
              {/* <p className="pb-2">
              <Link
                data-test-selector={`lnkCMSPageUrl${contentPageId}`}
                className="text-linkColor hover:text-hoverColor"
                href={`/${seoUrl ? seoUrl : `contentpage/${contentPageId}`}`}
              >
                {`${seoUrl ? seoUrl : `contentpage/${contentPageId}`}`}
              </Link>
            </p> */}
            </div>
            {totalCMSPageCount - 1 !== index ? <Separator /> : null}
          </>
        );
      })
    );
  };
  return (
    <div className="mb-5">
      {totalCMSPageCount > 0 ? (
        <>
          <p className="text-xl font-semibold px-3 py-2 mb-3" data-test-selector="paraShowingResultsForPages">
            {SearchTranslations("showing")} {cmsPages.length} {SearchTranslations("results")} <span className="lowercase">{SearchTranslations("for")}</span> &quot;{searchTerm}
            &quot;
          </p>
          {renderCMSSearchPagesData(cmsPages)}
          <DynamicPagination totalProducts={totalCMSPageCount} pageList={pageList} pageSize={pageSize} />
        </>
      ) : (
        <div className="w-full lg:w-[70%] text-sm pb-4">
          <p className="pb-2" data-test-selector="paraNoPagesMatch">
            {SearchTranslations("noPagesMatch")}
          </p>
          <p className="font-semibold" data-test-selector="paraTrySomethingLike">
            {SearchTranslations("trySomethingLike")}:
          </p>
          <ul className="pl-3 ml-3 list-disc">
            <li data-test-selector="listUsingGeneralTerms">{SearchTranslations("usingGeneralTerms")}</li>
            <li data-test-selector="listCheckSpelling">{SearchTranslations("checkSpelling")}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
