"use client";
import { CustomImage } from "../image";

// You need to import NavLink if you're using it
import { NavLink } from "../nav-link"; // <-- adjust the path if needed

interface IBrandCardProps {
  name: string;
  img: string;
  code: string;
  brandId: number;
  seoUrl: string;
  seoTitle: string;
}

export function BrandCard(props: Readonly<IBrandCardProps>) {
  const { name, img, code, brandId, seoUrl } = props;

  const brandUrl = seoUrl ? `/${seoUrl}` : `/brand/${code}`;

  return (
    <NavLink url={brandUrl} title={name} dataTestSelector={`linkBrand${brandId}`} ariaLabel={`View brand ${name}`}>
      <div
        className="relative flex flex-col justify-between h-full p-4 mt-4 mb-4 bg-white xl:mb-0 product-card card hover:shadow-lg focus:shadow-lg focus:ring-2 focus:ring-blue-500 first-line:border-solid hover:z-auto md:mt-0"
        data-test-selector={`divBrand${brandId}`}
      >
        <div className="relative w-[160px] h-[160px] overflow-hidden flex items-center justify-center m-auto">
          <CustomImage src={img} alt={`${name} logo`} width={160} height={160} className="object-contain w-[160px] h-[160px]" dataTestSelector={`imgBrand${brandId}`} />
        </div>
        <p className="px-1 py-2 text-sm font-semibold text-center uppercase" data-test-selector={`txtBrandName${brandId}`}>
          {name}
        </p>
      </div>
    </NavLink>
  );
}
