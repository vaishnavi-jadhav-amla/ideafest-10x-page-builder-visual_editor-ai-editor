"use client";

import { useEffect, useState } from "react";

import { IClientBreadCrumb } from "@znode/types/breadcrumb";
import Link from "next/link";
import { getBreadcrumbs } from "../../../http-request/breadcrumb/breadcrumb";

export function ClientBreadCrumbs(clientBreadcrumbProps: IClientBreadCrumb) {
  const [breadCrumb, setBreadcrumb] = useState<string>("");

  const { isParentCategory, name, znodeCategoryIds, customPath } = clientBreadcrumbProps;

  const fetchBreadcrumbs = async () => {
    if (customPath && customPath.title !== "") {
      if (customPath.nestedRouting) {
        return (
          <>
            <Link href={customPath.routingPath} prefetch={false}>{customPath.routingLabel}</Link> / <Link href={customPath.nestedRoutingPath} prefetch={false}>{customPath.title}</Link> /{" "}
            <span>{customPath.nestedRoutingTitle}</span>
          </>
        );
      }
      return (
        <>
          <Link href={customPath.routingPath} prefetch={false}>{customPath.routingLabel}</Link> / <span>{customPath?.title}</span>
        </>
      );
    } else {
      const id = Array.isArray(znodeCategoryIds) ? znodeCategoryIds.at(-1) : znodeCategoryIds;
      const breadcrumbsReq = {
        id: Number(id),
        isParentCategory: isParentCategory ? 1 : 0,
      };
      const breadCrumbsResponse = await getBreadcrumbs(breadcrumbsReq);
      return breadCrumbsResponse || "";
    }
  };

  useEffect(() => {
    fetchBreadcrumbs().then((breadCrumb) => {
      setBreadcrumb(breadCrumb);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientBreadcrumbProps.customPath]);

  return (
    <div className="flex items-center flex-wrap no-print text-xs separator-xs my-0">
      <ul className="flex items-center flex-wrap mb-2 text-breadCrumbsTextColor bg-bodyColor">
        {!customPath && (
          <li className="inline-flex items-center">
            <Link href="/" className="hover:text-hoverColor uppercase hover:underline bg-bodyColor text-breadCrumbsTextColor" data-test-selector="linkBreadcrumbPathHome" prefetch={false}>
              {"Home"}
            </Link>
            {breadCrumb && <span className="mx-1 h-auto font-medium bg-bodyColor text-breadCrumbsTextColor">/</span>}
          </li>
        )}
        {znodeCategoryIds?.at(-1) !== 0 && (
          <li className="inline-flex items-center uppercase" data-test-selector="linkBreadcrumbPathCategory">
            <div className="breadcrumb-category">{breadCrumb}</div>
            {isParentCategory && (
              <span className="mx-1 h-auto font-medium" data-test-selector="breadCrumbCategory">
                /
              </span>
            )}
          </li>
        )}
        {isParentCategory && (
          <li className="inline-flex items-center uppercase" data-test-selector={`breadCrumbCategory${name}`}>
            {name}
          </li>
        )}
      </ul>
    </div>
  );
}
