import "./mega-menu.scss";

import { Dispatch, SetStateAction } from "react";

import Category from "./Category";

interface MegaMenuProps {
  customClass?: string;
  type: string;
  isVisible: boolean;
  setShowNavBar?: Dispatch<SetStateAction<boolean>>;
}

export default function MegaMenu(props: MegaMenuProps) {
  const { customClass, type, isVisible, setShowNavBar } = props;

  return isVisible ? (
    <div className={`w-full border-t-2 border-black ${customClass}`}><Category type={type} setShowNavBar={setShowNavBar} /></div>
  ) : null;
}