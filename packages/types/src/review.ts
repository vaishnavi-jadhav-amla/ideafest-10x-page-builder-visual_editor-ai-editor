export interface IReview {
  portalId?: number;
  userId?: number;
  userName?: string;
  createdDate?: string;
  userLocation?: string;
  cMSCustomerReviewId?: number;
  productName?: string;
  sku?: string;
  storeName?: string;
  rating?: number;
  comments?: string;
  headline?: string;
  publishProductId?: number;
  seoUrl?: string;
}

export interface IReviewRequest extends IProductReviewRequest {
  portalId: number;
  userName: string;
  userId?: number;
}
export interface IProductReviewRequest {
  rating: number;
  comments: string;
  headline: string;
  userLocation: string;
  sku: string;
  productName?: string;
}

export interface IWriteReviewResponse {
  message?: string;
  status?: string;
  hasError?: boolean;
  errorMessage?: string;
}
