import Link from "next/link";
import { ZIcons } from "../../common/icons";
import { SETTINGS } from "@znode/constants/settings";

interface ICartPageAdSpaceProps {
  cartAdSpaceList: Array<{
    title: string;
    ctaLink: string;
    text: string;
  }>;
}
export function CartPageAdSpace(props: Readonly<ICartPageAdSpaceProps>) {
  const { cartAdSpaceList } = props;
  return (
    <div className="mt-10">
      <div className="grid-cols-3 gap-2 md:grid" data-test-selector="divCartAdSpaceContainer">
        {cartAdSpaceList.map((item, index) => {
          const { ctaLink = "", title = "", text = "" } = item;
          const linkDataTestSelector = `linkCardAdSpace${index + 1}`;
          const titleDataTestSelector = `divCardAdSpaceTitle${index + 1}`;
          const textDataTestSelector = `paraCardAdSpaceText${index + 1}`;
          const id = textDataTestSelector;
          return (
            <div key={id} className="col-span-1 p-6 mb-3 rounded-cardBorderRadius bg-slate-200 hover:drop-shadow-md md:mb-0">
              <Link href={ctaLink} data-test-selector={linkDataTestSelector}>
                <div className="flex items-center pb-3">
                  <div className="text-xl font-medium" data-test-selector={titleDataTestSelector}>
                    {title} <ZIcons name="chevron-right" color={`${SETTINGS.ARROW_COLOR}`} />
                  </div>
                </div>
                <p data-test-selector={textDataTestSelector}>{text}</p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
