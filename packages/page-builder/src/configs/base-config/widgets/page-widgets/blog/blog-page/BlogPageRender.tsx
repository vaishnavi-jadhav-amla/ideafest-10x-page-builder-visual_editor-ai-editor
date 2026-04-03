"use client";

import { Blog } from "@znode/base-components/page-widget/blog/blogs";
import { IBlogPageRenderProps } from "./BlogPageConfig";

export function BlogPageRender(props: IBlogPageRenderProps) {
  if (!props.response) {
    return null;
  }

  const { data } = props.response ?? {};

  return (
    <div>
      <Blog blogs={data || []} />
    </div>
  );
}
