import { IAdSpace } from "@znode/types/content-container";
import Image from "next/image";
import Link from "next/link";

export function AdSpaceItem({ image, title, text, index, ctaLink = "" }: Readonly<IAdSpace>) {
  return (
    <div className="relative col-span-1 bg-black min-h-fit xs:mb-4 md:mb-0">
      <Link href={ctaLink || "#"} data-test-selector={`linkAdSpace${index}`} className="flex">
        <div className="w-full h-auto">
          {image && (
            <Image
              src={image}
              alt="Home Page Ad"
              className="object-cover w-full max-h-96 min-h-24"
              data-test-selector={`imgAdSpace${index}`}
              width={200}
              height={0}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>

        <div className="absolute w-full p-5 text-center bottom-8">
          {title && (
            <p className="text-lg font-medium text-white" data-test-selector={`paraAdSpaceTitle${index}`}>
              {title}
            </p>
          )}
          {text && (
            <p className="text-white" data-test-selector={`paraAdSpaceText${index}`}>
              {text}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
