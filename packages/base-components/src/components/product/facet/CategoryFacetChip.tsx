"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ZIcons } from "../../common/icons";
import { useTranslationMessages } from "@znode/utils/component";

export function CategoryFacetChip({ activeCategory }: { activeCategory: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const facetTranslations = useTranslationMessages("Facet");

  const handleRemoveParam = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("categoryCode");
    params.delete("searchCategory");
    params.delete("activeCategory");
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    router.replace(newUrl);
  };

  return (
    <div className="flex items-center">
      <span className="capitalize font-semibold px-1 text-sm mr-2" data-test-selector="spnCategoryName">
        {facetTranslations("category")} :
      </span>
      <div className="flex px-1 items-center mx-1  whitespace-nowrap text-sm shadow-md rounded py-1">
        {" "}
        <span className="px-1" data-test-selector={`spn${activeCategory}`}>
          {activeCategory}
        </span>
        <div
          onClick={handleRemoveParam}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleRemoveParam();
          }}
          role="button"
          tabIndex={0}
          data-test-selector={`div${activeCategory}Clear`}
          className="rounded-full flex items-center justify-center mx-1 bg-primaryColor text-white w-4 h-4 cursor-pointer"
        >
          <ZIcons name="x" />
        </div>
      </div>
    </div>
  );
}
