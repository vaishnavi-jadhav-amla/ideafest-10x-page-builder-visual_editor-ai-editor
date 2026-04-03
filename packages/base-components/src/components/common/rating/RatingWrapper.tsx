import { ProductReadReview } from "../../product/product-review";
import Rating from "./Rating";

interface IRatingWrapper {
  ratingCount: number;
  showReview: boolean;
  productUrl?: string;
  totalReviews?: number;
  id: number;
  productSku?: string;
}

export default function RatingWrapper({ ratingCount, showReview = false, productUrl, productSku, totalReviews, id }: Readonly<IRatingWrapper>) {
  return (
    <>
      <div className={`mt-1.5 ${totalReviews && totalReviews > 0 ? "mr-1" : ""}`} data-test-selector={`divRating${id}`}>
        <span data-test-selector={`spnStarRating${id}`}>
          <Rating isVisible disableActions ratingValue={Number(ratingCount.toFixed(2))} dataTestSelector={`Rating${id}`} />
        </span>
      </div>
      {totalReviews && totalReviews > 0 ? (
        <span className="heading-4 text-zinc-700 whitespace-nowrap contents ml-1" data-test-selector={`spnRatingCount${id}`}>
          {Number(ratingCount.toFixed(2))} | {`(${totalReviews})`}
        </span>
      ) : null}
      {showReview && <ProductReadReview redirectionUrl={productUrl} id={id} productSku={productSku} />}
    </>
  );
}
