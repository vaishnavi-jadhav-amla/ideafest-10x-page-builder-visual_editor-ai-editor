import { NavLink } from "../../common/nav-link";
import Image from "next/image";

interface ProductCardProps {
  imageUrl: string;
  skuId: string;
  name: string;
  salesPrice: number;
  retailPrice: number;
  discountPrice?: number;
}

export function ProductCard(props: Readonly<ProductCardProps>) {
  const { imageUrl, name, skuId, salesPrice, retailPrice, discountPrice } = props;

  const isSalesPriceShow = salesPrice !== 0 && salesPrice !== null;

  return (
    <div className="relative block w-full p-4 bg-white product-card card hover:shadow-lg">
      <div>
        <div className="relative flex-none w-auto">
          <NavLink url="#" className="flex items-center justify-center w-auto" dataTestSelector="linkProductImage" ariaLabel={`${name}-${skuId}`}>
            <div className="relative flex h-52 w-52">
              <Image alt={name ?? ""} className="object-contain w-auto m-auto h-full" src={imageUrl} width={250} height={500} />
            </div>
          </NavLink>
        </div>
      </div>

      <div className="flex-none pb-2 mt-4">
        <h3 className="mb-2 font-medium leading-tight break-words text-md">{name ?? ""}</h3>

        <p className="w-24 mb-1 text-xs break-words">
          <span>SKU: </span>
          <span>{skuId ?? "NA"}</span>
          <span>{skuId ?? "NA"}</span>
        </p>

        <div className="text-xl font-semibold price text-linkColor">
          {isSalesPriceShow && <span className="pr-3 text-gray-600 line-through">${salesPrice}</span>}

          {!isSalesPriceShow && <span className="pr-3">{retailPrice ?? "$0.00"}</span>}

          {isSalesPriceShow && retailPrice && <span className="line-through text-stone-400">{retailPrice}</span>}

          {discountPrice && <span className="ml-1 line-through cut-price text-slate-300">{discountPrice}</span>}
        </div>
      </div>
    </div>
  );
}
