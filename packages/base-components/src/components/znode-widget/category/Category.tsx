import { CustomImage } from "../../common/image";
import { NavLink } from "../../common/nav-link";

interface ICategoryProps {
  seoUrl: string;
  name: string;
  imgSrc: string;
  categoryId: number;
}

export function Category(props: Readonly<ICategoryProps>) {
  return (
    <NavLink
      className="link-wrapper flex items-center justify-center product-card card h-full min-h-[220px]"
      url={props.seoUrl || `/category/${props.categoryId}`}
      title={props.name}
      dataTestSelector={`link${props.categoryId}`}
      ariaLabel={`${props.name}`}
    >
      <div className="col-span-1 max-w-[9.4rem] min-w-[9.4rem] sm:w-full px-0 mx-0 my-3 pl-1 min-h-[3.125rem] " data-test-selector={`divCategory${props.categoryId}`}>
        <div className="relative h-full overflow-hidden rounded-md">
          <CustomImage src={props.imgSrc} alt="It's a Category Photograph" dataTestSelector={`imgCategory${props.categoryId}`} />
        </div>
        <p
          className={`px-1 pt-2 text-sm font-semibold text-center uppercase ${props.name.includes(" ") ? "line-clamp-2" : "truncate"}`}
          title={props.name}
          data-test-selector={`txtCategoryName${props.categoryId}`}
        >
          {props.name}
        </p>
      </div>
    </NavLink>
  );
}
