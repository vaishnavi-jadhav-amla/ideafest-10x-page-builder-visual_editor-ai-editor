import Heading from "../heading/Heading";
import { formatTestSelector } from "@znode/utils/common";
interface IHeadingProps {
  name: string;
}

export function HeadingBar(props: Readonly<IHeadingProps>) {
  const { name } = props || {};
  return (
    <Heading name={name} level="h2" customClass="uppercase bg-primaryColor xs:text-secondaryColor text-center" dataTestSelector={formatTestSelector("hdg", `${name}`)} />
  );
}
