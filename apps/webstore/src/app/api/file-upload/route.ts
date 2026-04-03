import { sendError, sendSuccess } from "@znode/utils/server";

import { fileUpload } from "@znode/agents/file-upload/file-upload";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const files: FormData = formData;

    const data = await fileUpload(undefined, files);

    if (data && data !== null && "fileUpload" in data && data.fileUpload) {
      return sendSuccess(data);
    }

    return sendError("Internal server error.", 500);
  } catch (error) {
    return sendError("Internal server error.", 500);
  }
}
