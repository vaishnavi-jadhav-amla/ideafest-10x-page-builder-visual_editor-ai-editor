import Link from "next/link";
import { IBreadCrumb } from "@znode/types/breadcrumb";

export function SampleComponent({ isParentCategory, name, znodeCategoryIds, customPath, combinationErrorMessage, parentConfigurableProductName, breadCrumbsTitle }: IBreadCrumb) {
  const title = `<a href=${customPath?.routingPath}>${customPath?.routingLabel}</a> / ${customPath?.title}`;
  const breadCrumb = customPath && customPath?.title !== "" ? title : breadCrumbsTitle;

  return (
    <div className="flex items-center flex-wrap no-print text-xs border-b pb-2">
      <ul className="flex items-center flex-wrap mb-2 text-breadCrumbsTextColor">
        {!customPath && (
          <li className="inline-flex items-center">
            <Link href="/" className="hover:text-blue-500 uppercase hover:underline" data-test-selector="linkBreadcrumbPathHome">
              {"Home"}
            </Link>
            {breadCrumb && <span className="mx-1 h-auto font-medium">/</span>}
          </li>
        )}
        {znodeCategoryIds?.at(-1) !== 0 && (
          <li className="inline-flex items-center uppercase" data-test-selector="linkBreadcrumbPathCategory">
            <div className="breadcrumb-category">{breadCrumb && <span dangerouslySetInnerHTML={{ __html: breadCrumb }}></span>}</div>
            {isParentCategory && (
              <span className="mx-1 h-auto font-medium" data-test-selector="breadCrumbCategory">
                /
              </span>
            )}
          </li>
        )}
        {isParentCategory && (
          <li className="inline-flex items-center uppercase" data-test-selector={`breadCrumbCategory${name}`}>
            {!combinationErrorMessage ? name : parentConfigurableProductName}
          </li>
        )}
      </ul>
    </div>
  );
}
