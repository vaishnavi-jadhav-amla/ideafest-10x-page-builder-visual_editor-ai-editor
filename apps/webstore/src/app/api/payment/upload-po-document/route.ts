import { uploadPODocument } from "@znode/agents/payment";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
    try {
        const requestData = await request.formData();
        if (requestData) {
            const fileData = await uploadPODocument(requestData);
            return sendSuccess(fileData, "File data retrieved successfully.");
        } else {
            return sendError("No formdata present in request.", 404);
        }
    } catch (error) {
        return sendError("Internal server error." + String(error), 500);
    }
}