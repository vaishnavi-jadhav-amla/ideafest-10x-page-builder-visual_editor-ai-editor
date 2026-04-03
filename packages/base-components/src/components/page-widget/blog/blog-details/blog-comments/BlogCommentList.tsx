import { IBlogComment } from "@znode/types/blog";
import { LoadingSpinner } from "../../../../common/icons";
import type { PropsWithChildren } from "react";
import { useTranslations } from "next-intl";

interface ICommentListProps extends PropsWithChildren {
  comments: IBlogComment[];
  loading: boolean;
}
export function BlogCommentList(props: Readonly<ICommentListProps>) {
  const { comments, loading } = props || {};
  const blogMessage = useTranslations("Blog");

  const renderComments = () => {
    if (loading) {
      return <LoadingSpinner width="50px" height="50px" />;
    }

    return comments.map((comment: IBlogComment, i: number) => {
      if (!comment?.blogComment) return null;

      const isLastComment = comments.length === 1 || i + 1 === comments.length;
      return (
        <p key={comment.blogId} className={`${!isLastComment ? "border-b" : ""} py-3 break-words`} data-test-selector={`paraBlogComment${comment.blogId}`}>
          {comment.blogComment}
        </p>
      );
    });
  };

  return (
    <div data-test-selector="divBlogCommentsSection">
      <h3 className="mb-2 text-lg font-bold" data-test-selector="hdgBlogComments">
        {blogMessage("comments")}
      </h3>
      {renderComments()}
      <hr className="h-2 mb-4 font-bold border-t-2 border-black mt-7" />
    </div>
  );
}
