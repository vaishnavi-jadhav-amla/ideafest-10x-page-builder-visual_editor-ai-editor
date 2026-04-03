import { sendError, sendSuccess } from "@znode/utils/server";

import { getBlogList } from "@znode/agents/blogs";

export async function GET() {
  try {
    const blogs = await getBlogList();
    return sendSuccess(blogs);
  } catch (error) {
    return sendError("An error occurred while fetching the blog." + String(error), 500);
  }
}
