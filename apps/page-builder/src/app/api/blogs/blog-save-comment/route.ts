import { sendError, sendSuccess } from "@znode/utils/server";

import { saveComments } from "@znode/agents/blogs";

export async function POST(request: Request) {
  try {
    const dataResponse = await request.json();
    const blogData = await saveComments(dataResponse);
    return sendSuccess({ blogData }, "Comment added successfully");
  } catch (error) {
    return sendError("An error occurred while fetching the blog." + String(error), 500);
  }
}
