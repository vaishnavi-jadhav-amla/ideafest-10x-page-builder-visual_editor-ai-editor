"use client";

import { Controller, useForm } from "react-hook-form";
import { IReviewRequest, IWriteReviewResponse } from "@znode/types/review";
import { sanitizeFields, validateField } from "@znode/utils/common";
import Button from "../common/button/Button";
import { Heading } from "../common/heading/Heading";
import { INPUT_REGEX } from "@znode/constants/regex";
import { REVIEW } from "@znode/constants/review";
import Rating from "../common/rating/Rating";
import { ValidationMessage } from "../common/validation-message";
import { useState } from "react";
import { useToast } from "../../stores/toast";
import { useTranslationMessages } from "@znode/utils/component";
import { writeReview } from "../../http-request/write-review/write-review";

export const WriteReview = ({ publishProductId, productName, seoUrl, sku }: { publishProductId: number; productName: string; seoUrl: string; sku: string }) => {
  const reviewTranslation = useTranslationMessages("Review");
  const commonTranslation = useTranslationMessages("Common");
  const productUrl = seoUrl || `product/${publishProductId}`;

  const maxTextCount = 500;
  const maxHeadlineTextCount = 200;
  const maxUserNameTextCount = 200;
  const maxUserLocationTextCount = 200;
  const defaultValues = {
    headline: "",
    comments: "",
    userName: "",
    userLocation: "",
  };

  const [ratingNumber, setRatingNumber] = useState<number>(0);
  const [ratingError, setRatingError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(false);
  const { error, success } = useToast();

  const {
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    control,
    trigger,
  } = useForm<IReviewRequest>({
    defaultValues,
  });

  const getRatingValue = (rating: number) => {
    setRatingNumber(rating);
    setRatingError("");
  };

  const showWriteReviewMessage = (message: string) => {
    success(reviewTranslation(message));
    reset();
    setRatingError("");
  };

  const onSubmit = async () => {
    try {
      const reviewModel: IReviewRequest = getValues();
      const newFieldErrors: Record<string, string> = {};
      if (ratingNumber === 0) {
        setRatingError(reviewTranslation("ratingIsRequired"));
      } else {
        if (reviewModel) {
          // Validate each field
          validateField(reviewModel.headline, "reviewHeadlineRequired", reviewTranslation, newFieldErrors);
          validateField(reviewModel.comments, "commentRequired", reviewTranslation, newFieldErrors);
          validateField(reviewModel.userName, "nameRequired", reviewTranslation, newFieldErrors);
          validateField(reviewModel.userLocation, "yourStateCountryRequired", reviewTranslation, newFieldErrors);

          // Update state with errors if any
          setFieldErrors(newFieldErrors);
          if (Object.keys(newFieldErrors).length > 0) return;
          setIsLoading(true);
          reviewModel.productName = productName ?? "";
          reviewModel.rating = ratingNumber;
          reviewModel.sku = sku as string;

          // Sanitize inputs before sending them
          sanitizeFields(reviewModel);

          const reviewData: IWriteReviewResponse = await writeReview({
            ...reviewModel,
            productName: reviewModel.productName ?? "",
            rating: reviewModel.rating,
            sku: reviewModel.sku,
          });
          if (!reviewData?.hasError) {
            const message = reviewData.status !== REVIEW.REVIEW_STATUS ? "successWriteReviewWhenApproverRequired" : "successWriteReview";
            showWriteReviewMessage(message);
            setRatingNumber(0);
          } else {
            error(reviewTranslation("errorWriteReview"));
          }
        } else {
          error(reviewTranslation("errorWriteReview"));
        }
      }
    } catch (err) {
      error(reviewTranslation("errorWriteReview"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Heading level="h1" dataTestSelector="hdgProductReview" name={reviewTranslation("productReview")} showSeparator={true} />
      <div className="mb-3 md:w-2/4 sm:w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5 pb-2" data-test-selector="divReviewFor">
            <label className="mb-3 font-semibold" data-test-selector="lblReviewFor">
              {reviewTranslation("reviewFor")}
            </label>
            <p className="text-lg font-semibold" data-test-selector="paraProductName">
              {productName}
            </p>
          </div>
          <div className="space-y-1.5 pb-2" data-test-selector="divRating">
            <label className="mb-3 font-semibold" data-test-selector="lblRating">
              {reviewTranslation("rating")} <strong className="text-errorColor">*</strong>
            </label>
            <Rating ratingValue={ratingNumber} isVisible disableActions={false} handleRatingClick={getRatingValue} dataTestSelector={`Rating${ratingNumber}`} />
            {ratingError && <ValidationMessage message={ratingError} dataTestSelector="ratingError" customClass="text-sm text-errorColor" />}
          </div>
          <div className="pb-2 space-y-2">
            <label className="mb-1 font-semibold" data-test-selector="lblReviewHeadline">
              {reviewTranslation("reviewHeadline")} <strong className=" text-errorColor">*</strong>
              <Controller
                name="headline"
                control={control}
                rules={{ required: true, maxLength: maxHeadlineTextCount }}
                render={({ field, field: { onChange } }) => {
                  return (
                    <input
                      {...field}
                      className="w-full h-10 px-2 py-1 mt-2 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
                      placeholder=""
                      data-test-selector="txtReviewHeadline"
                      onChange={(e) => {
                        onChange(e);
                        trigger("headline");
                        setFieldErrors((prev) => ({ ...prev, reviewHeadlineRequired: "" }));
                      }}
                    />
                  );
                }}
              />
            </label>
            {errors.headline ? (
              <div>
                {errors.headline.type === "maxLength" && (
                  <ValidationMessage message={reviewTranslation("productReviewHeadlineMaxLength")} dataTestSelector="headlineRequiredErrorMax" />
                )}
                {errors.headline.type === "required" && <ValidationMessage message={reviewTranslation("reviewHeadlineRequired")} dataTestSelector="headlineRequiredErrorMin" />}
              </div>
            ) : (
              <div>{fieldErrors.reviewHeadlineRequired && <ValidationMessage message={fieldErrors.reviewHeadlineRequired} dataTestSelector="headlineRequiredErrorMin" />}</div>
            )}
          </div>
          <div className="pb-2 space-y-2">
            <label className="font-semibold" data-test-selector="lblReview">
              {reviewTranslation("review")} <strong className="text-errorColor">*</strong>
              <Controller
                name="comments"
                control={control}
                data-test-selector="txtReview"
                rules={{ required: true, maxLength: maxTextCount }}
                render={({ field, field: { onChange } }) => (
                  <textarea
                    {...field}
                    className="w-full h-40 px-2 py-1 mt-2 border resize-none border-inputColor hover:border-black active:border-black "
                    data-test-selector="txtReviewComments"
                    onChange={(e) => {
                      onChange(e);
                      trigger("comments");
                      setFieldErrors((prev) => ({ ...prev, commentRequired: "" }));
                    }}
                  />
                )}
              />
            </label>
            {errors.comments ? (
              <div>
                {errors.comments.type === "maxLength" && <ValidationMessage message={reviewTranslation("productReviewMaxLength")} dataTestSelector="commentRequiredErrorMax" />}
                {errors.comments.type === "required" && <ValidationMessage message={reviewTranslation("commentRequired")} dataTestSelector="commentRequiredErrorMin" />}
              </div>
            ) : (
              <div>{fieldErrors.commentRequired && <ValidationMessage message={fieldErrors.commentRequired} dataTestSelector="commentRequiredErrorMin" />}</div>
            )}
          </div>
          <div className="pb-2 space-y-2">
            <label className="font-semibold" data-test-selector="lblYourName">
              {reviewTranslation("yourName")} <strong className="text-errorColor">*</strong>
              <Controller
                name="userName"
                control={control}
                rules={{ required: true, maxLength: maxUserNameTextCount }}
                render={({ field, field: { onChange } }) => {
                  return (
                    <input
                      {...field}
                      className="w-full h-10 px-2 py-1 mt-2 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
                      onChange={(e) => {
                        onChange(e);
                        trigger("userName");
                        setFieldErrors((prev) => ({ ...prev, nameRequired: "" }));
                      }}
                      placeholder=""
                      data-test-selector="txtYourName"
                    />
                  );
                }}
              />
            </label>
            {errors.userName ? (
              <div>
                {errors.userName.type === "maxLength" && (
                  <ValidationMessage message={reviewTranslation("productReviewUserNameMaxLength")} dataTestSelector="nameRequiredErrorMax" />
                )}
                {errors.userName.type === "required" && <ValidationMessage message={reviewTranslation("nameRequired")} dataTestSelector="nameRequiredErrorMin" />}
              </div>
            ) : (
              <div>{fieldErrors.nameRequired && <ValidationMessage message={fieldErrors.nameRequired} dataTestSelector="nameRequiredErrorMin" />}</div>
            )}
          </div>
          <div className="pb-2 space-y-2">
            <label className="font-semibold" data-test-selector="lblStateCountry">
              {reviewTranslation("yourState")}/<span className="mr-1">{reviewTranslation("country")}</span>
              <strong className=" text-errorColor">*</strong>
              <Controller
                name="userLocation"
                control={control}
                rules={{ required: true, maxLength: maxUserLocationTextCount, pattern: INPUT_REGEX.NO_NUMERIC_ALLOWED_REGEX }}
                render={({ field, field: { onChange } }) => {
                  return (
                    <input
                      {...field}
                      className="w-full h-10 px-2 py-1 mt-2 border rounded-inputBorderRadius border-inputColor hover:border-black active:border-black "
                      placeholder=""
                      data-test-selector="txtStateCountry"
                      onChange={(e) => {
                        onChange(e);
                        trigger("userLocation");
                        setFieldErrors((prev) => ({ ...prev, yourStateCountryRequired: "" }));
                      }}
                    />
                  );
                }}
              />
            </label>
            {errors.userLocation ? (
              <div>
                {errors.userLocation.type === "maxLength" && (
                  <ValidationMessage message={reviewTranslation("productReviewLocationMaxLength")} dataTestSelector="stateCountryRequiredErrorMax" />
                )}
                {errors.userLocation.type === "required" && (
                  <ValidationMessage message={`${reviewTranslation("yourState")}/${reviewTranslation("countryRequired")}`} dataTestSelector="stateCountryRequiredErrorMin" />
                )}
                {errors.userLocation.type === "pattern" && (
                  <ValidationMessage message={reviewTranslation("userLocationPatternError")} dataTestSelector="stateCountryPatternError" />
                )}
              </div>
            ) : (
              <div>
                {fieldErrors.yourStateCountryRequired && <ValidationMessage message={fieldErrors.yourStateCountryRequired} dataTestSelector="stateCountryRequiredErrorMin" />}
              </div>
            )}
          </div>
          <p className="pb-4 text-sm" data-test-selector="paraReviewSubmissionAndApproval">
            {reviewTranslation("reviewSubmissionAndApproval")}
          </p>
          <div className="flex items-center">
            <Button
              htmlType="submit"
              dataTestSelector="btnSubmitReview"
              type="primary"
              size="small"
              ariaLabel="submit review button"
              loading={isLoading}
              loaderColor="currentColor"
              loaderWidth="20px"
              loaderHeight="20px"
              showLoadingText={true}
              onClick={() => {
                if (ratingNumber === 0) {
                  setRatingError(reviewTranslation("ratingIsRequired"));
                }
              }}
            >
              {reviewTranslation("submitReview")}
            </Button>
            <Button
              type="secondary"
              size="small"
              className="px-5 py-2 ml-3 text-sm tracking-wider uppercase"
              dataTestSelector="btnCancelReview"
              ariaLabel="cancel review button"
              onClick={() => (window.location.href = `/${productUrl}`)}
            >
              {commonTranslation("cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
