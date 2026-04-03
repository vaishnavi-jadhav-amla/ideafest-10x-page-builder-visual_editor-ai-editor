import { ICategoryProps } from "@znode/types/category";
import Categories from "./Categories";
import { useCategoryDetails } from "../../../../../stores";

const MobileCategory = ({ setShowNavBar }: ICategoryProps) => {
  const { category } = useCategoryDetails();

  return (
    <div className="z-20 ml-6 category" data-test-selector="divCategoryMenus">
      {category.map((categoryValue, index) => (
        <Categories key={index} category={categoryValue} setShowNavBar={setShowNavBar} breadcrumbTrail={[categoryValue]} />
      ))}
    </div>
  );
};

export default MobileCategory;
