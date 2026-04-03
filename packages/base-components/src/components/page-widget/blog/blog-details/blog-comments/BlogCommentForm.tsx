import { PropsWithChildren, useState } from "react";

import Button from "../../../../common/button/Button";
import { IAddBlogComment } from "@znode/types/blog";
import { ValidationMessage } from "../../../../common/validation-message";
import { saveBlogComment } from "../../../../../http-request";
import { useForm } from "react-hook-form";
import { useToast } from "../../../../../stores/toast";
import { useTranslations } from "next-intl";

interface IBlogCommentFormProps extends PropsWithChildren {
  // TODO: v2 API: Pass blogId strings because the API now requires blogId to be passed as strings.
  blogNewsCode: string;

  getComments: () => void;
}
export function BlogCommentForm(props: Readonly<IBlogCommentFormProps>) {
  const { blogNewsCode, getComments } = props || {};
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IAddBlogComment>();

  const { error, success } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const blogMessage = useTranslations("Blog");

  const onSubmit = async (data: IAddBlogComment) => {
    setLoading(true);
    if (data) {
      const blogData = await saveBlogComment({
        blogComment: data.blogComment,
        blogNewsCode,
        localeCode: "en-US", // TODO: Add LocaleCode here instead of hardcoded value "en-US"
      });
      if (blogData?.data?.blogData) {
        setLoading(false);
        getComments();
        success(blogMessage("successWriteComment"));
        reset();
      }
    } else {
      setLoading(false);
      error(blogMessage("errorWriteReview"));
    }
  };

  return (
    <div data-test-selector="divLeaveCommentSection">
      <h3 className="mb-1 text-lg font-semibold" data-test-selector="hdgLeaveComment">
        {blogMessage("leaveComment")}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="pb-4 space-y-1">
          <textarea
            className="w-full px-2 py-1 border border-black resize-none hover:border-black active:border-black  h-28"
            {...register("blogComment", { required: true })}
            data-test-selector="txtBlogComment"
            aria-label="Blog comment"
          />
          {errors.blogComment && <ValidationMessage message={blogMessage("commentRequired")} dataTestSelector="requiredCommentError" />}
        </div>
        <div className="flex justify-end">
          <Button
            htmlType="submit"
            dataTestSelector="btnSubmitComment"
            type="primary"
            size="small"
            className="px-12"
            ariaLabel="submit review button"
            loading={loading}
            showLoadingText={true}
            loaderWidth="20px"
            loaderHeight="20px"
          >
            {blogMessage("submitComment")}
          </Button>
        </div>
      </form>
    </div>
  );
}
