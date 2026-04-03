import Image from "next/image";
import Link from "next/link";
import dataUrls from "./../../../../constants/dataUrls.json";

interface IHomePagePromoProps {
  title: string;
  ctaText: string;
  ctaLink: string;
  largeImageUrl: string;
  smallImageUrl: string;
}

export function HomePagePromo(props: Readonly<IHomePagePromoProps>) {
  const { largeImageUrl = "", smallImageUrl = "", ctaLink = "", ctaText = "", title = "" } = props || {};
  return (
    <div data-test-selector="divHomePagePromoContainer">
      <div className="relative">
        <picture>
          <source srcSet={largeImageUrl} media="(min-width: 768px)" />
          <source srcSet={smallImageUrl} media="(max-width: 767px)" />
          <Image
            className="object-cover w-full max-h-96 min-h-24"
            src={largeImageUrl as string}
            alt={"Homepage Promo Imag"}
            width={500}
            height={500}
            data-test-selector={"imgHomePagePromo"}
            loading={"lazy"}
            placeholder={"blur"}
            blurDataURL={dataUrls.smallPlaceholder}
          />
        </picture>
        <div className="mt-5 text-center md:absolute top-1/4 lg:top-2/4 left-32 md:text-left md:mt-0" data-test-selector="divPromoText">
          <DynamicText text={title} />
          {ctaText && (
            <div className="pb-4">
              <Link
                href={ctaLink ? ctaLink : "#"}
                data-test-selector="linkPromoCTA"
                className="w-auto px-3 py-2 text-sm font-semibold tracking-wider uppercase md:text-white xs:rounded-none xs:border-2 xs:border-black md:border-white xs:hover:bg-transparent"
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface IDynamicTextProps {
  text?: string;
}
export function DynamicText(props: Readonly<IDynamicTextProps>) {
  const { text = "" } = props || {};
  if (!text) return null;

  const unescapeHtml = (htmlString: string) => {
    return {
      __html: htmlString.replace(/&lt;/g, "<").replace(/&gt;/g, ">") || "",
    };
  };

  return <div className="mb-4 text-2xl font-medium uppercase md:text-white" data-test-selector="divPromoTitle" dangerouslySetInnerHTML={unescapeHtml(text)} />;
}
