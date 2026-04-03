"use client";

import { BlogDetails } from "@znode/base-components/page-widget/blog/blog-details";
import { BlogDetailsPageRenderProps } from "./BlogDetailsPageConfig";

export function BlogDetailsPageRender(props: BlogDetailsPageRenderProps) {
  if (!props.response) {
    return null;
  }

  const { title, body, mediaPath, createdDate, blogId, allowGuestComment, blogNewsCode = "", tags } = props?.response?.data ?? {};

  return (
    <BlogDetails
      mediaPath={mediaPath}
      imageAlt={title}
      body={body}
      title={title}
      createdDate={createdDate}
      blogId={blogId}
      allowGuestComment={allowGuestComment}
      blogNewsCode={blogNewsCode}
      tags={tags}
    />
  );
}
