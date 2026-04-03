import { sendError, sendSuccess } from "@znode/utils/server";

import { getUserCommentList } from "@znode/agents/blogs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get("id");
    const blogList = await getUserCommentList(Number(blogId));
    return sendSuccess({ blogList }, "Blog comment list retrieved successfully");
  } catch (error) {
    return sendError("An error occurred while fetching the blog." + String(error), 500);
  }
}
