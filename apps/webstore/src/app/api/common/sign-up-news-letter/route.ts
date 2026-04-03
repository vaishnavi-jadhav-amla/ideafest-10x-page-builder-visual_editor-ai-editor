import { signUpForNewsLetter } from "@znode/agents/common";
import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const newsLetterSubscription = await signUpForNewsLetter(payload);
    return sendSuccess({ isSuccess: newsLetterSubscription.isSuccess, errorMessage: newsLetterSubscription.errorMessage });
  } catch (error) {
    return sendError("An error occurred while adding email. " + String(error), 500);
  }
}
