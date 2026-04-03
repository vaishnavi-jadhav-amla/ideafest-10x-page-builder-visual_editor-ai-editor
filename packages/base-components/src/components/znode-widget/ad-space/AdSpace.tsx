import { AdSpaceItem } from "./AdSpaceItem";
import { IAdSpaces } from "@znode/types/content-container";

interface IAdSpaceProps {
  adSpaces: IAdSpaces;
  customKey: string;
}
export function AdSpace(props: Readonly<IAdSpaceProps>) {
  const { adSpaces = [], customKey } = props || {};
  return (
    <div className="grid-cols-2 gap-4 md:grid">
      {Array.isArray(adSpaces) && adSpaces.length > 0 && adSpaces.map((adSpace, index) => {
        return <AdSpaceItem key={`${customKey}-${index + 1}`} id={adSpace.id} image={adSpace.image} title={adSpace.title} text={adSpace.text} ctaLink={adSpace.ctaLink} index={index}/>;
      })}
    </div>
  );
}
