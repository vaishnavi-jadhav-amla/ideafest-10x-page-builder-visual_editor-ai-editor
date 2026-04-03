import { sendError, sendSuccess } from "@znode/utils/server";

import { getBlogDetail } from "@znode/agents/blogs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const blogNewsCode = searchParams.get("id") || "";

    const blog = await getBlogDetail(blogNewsCode);
    return sendSuccess(blog);
  } catch (error) {
    return sendError("An error occurred while fetching the blog." + String(error), 500);
  }
}
