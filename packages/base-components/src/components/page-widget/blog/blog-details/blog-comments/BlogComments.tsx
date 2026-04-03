"use client";

import { useCallback, useEffect, useState } from "react";

import { BlogCommentForm } from "./BlogCommentForm";
import { BlogCommentList } from "./BlogCommentList";
import { IBlogComment } from "@znode/types/blog";
import { getBlogCommentList } from "../../../../../http-request";

interface IBlogCommentProps {
  // TODO: v2 API: Pass blogId strings because the API now requires blogId to be passed as strings.
  blogId: string;
  blogNewsCode: string;
}
export function BlogComments(props: Readonly<IBlogCommentProps>) {
  const { blogNewsCode, blogId } = props || {};
  const [comments, setComments] = useState<IBlogComment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchComments = useCallback(async () => {
    if (blogId) {
      setIsLoading(true);
      const updatedComments = await getBlogCommentList(blogId);
      setComments(updatedComments.data.blogList);
      setIsLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div className="mt-8">
      <BlogCommentList comments={comments} loading={isLoading} />
      <BlogCommentForm blogNewsCode={blogNewsCode} getComments={fetchComments} />
    </div>
  );
}
