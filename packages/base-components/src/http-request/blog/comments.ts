import { IAddBlogComment } from "@znode/types/blog";

export const saveBlogComment = async (data: IAddBlogComment) => {
  const res = await fetch("/api/blogs/blog-save-comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(data),
  });
  const response = await res.json();
  return response;
};

export const getBlogCommentList = async (id: string) => {
  const res = await fetch(`/api/blogs/blog-user-comment-list?id=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const response = await res.json();
  return response;
};
