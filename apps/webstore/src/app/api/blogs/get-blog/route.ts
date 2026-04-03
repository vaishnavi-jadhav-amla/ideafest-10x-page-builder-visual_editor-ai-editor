import { sendError, sendSuccess } from "@znode/utils/server";

import { IBlog } from "@znode/types/blog";
import { getBlogDetail } from "@znode/agents/blogs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const blogId = searchParams.get("id");
    const blog: IBlog | null = await getBlogDetail(Number(blogId));
    return sendSuccess({ blog }, "Blog detail retrieved successfully");
  } catch (error) {
    return sendError("An error occurred while fetching the blog detail." + String(error), 500);
  }
}
