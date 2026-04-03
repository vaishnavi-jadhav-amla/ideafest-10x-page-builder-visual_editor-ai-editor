"use client";
import React from "react";
import { ICategoryProps } from "@znode/types/category";
import MobileCategory from "./mobile-menu/MobileCategory";
import DesktopCategory from "./desktop-menu/DesktopCategory";
import LoaderComponent from "../../../common/loader-component/LoaderComponent";
import "./mega-menu.scss";
import { useCategoryDetails } from "../../../../stores";

const Category: React.FC<ICategoryProps> = ({ type, setShowNavBar }) => {
  const { category, loading } = useCategoryDetails();
  const renderMobileCategory = () => {
    if (loading) return <LoaderComponent isLoading={true} color="#fff" height="25px" width="25px" />;
    else if (category && category.length > 0) {
      return <MobileCategory setShowNavBar={setShowNavBar} />;
    } else {
      return null;
    }
  };

  const renderDesktopCategory = () => {
    return <DesktopCategory />;
  };

  return (
    <>
      {type === "mobile" && <div>{renderMobileCategory()}</div>}
      {type === "desktop" && <div className="flex text-sm">{renderDesktopCategory()}</div>}
    </>
  );
};

export default Category;
