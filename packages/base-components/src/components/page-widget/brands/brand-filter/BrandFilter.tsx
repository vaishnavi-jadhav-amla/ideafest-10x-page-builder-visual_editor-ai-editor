import Link from "next/link";
import { useSearchParams } from "next/navigation";

const alphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export function BrandFilter({ pageSize }: { pageSize: number }) {
  const searchParams = useSearchParams();
  const selectedBrandName = searchParams.get("brandName");

  const getHrefLink = (brandName: string) => {
    return `/brand/list?brandName=${brandName}&pageNumber=1&pageSize=${pageSize}`;
  };

  return (
    <ul className="flex flex-wrap justify-center py-5 space-x-4 tracking-wider" data-test-selector="listBrandFilterContainer">
      <li className="mr-2" data-test-selector="listBrandFilter-#">
        <Link href={getHrefLink("num")} className={`text-lg font-semibold ${selectedBrandName === "num" ? "text-linkColor" : "text-gray-700 "} hover:text-linkColor`}>
          #
        </Link>
      </li>
      {alphabets.map((alphabet) => (
        <li key={alphabet} className="mr-2" data-test-selector={`listBrandFilter-${alphabet}`}>
          <Link href={getHrefLink(alphabet)} className={`text-lg font-semibold ${selectedBrandName === alphabet ? "text-linkColor" : "text-gray-700"} hover:text-linkColor`}>
            {alphabet}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default BrandFilter;
