import { sendError, sendSuccess } from "@znode/utils/server";

export async function POST(request: Request) {
  const requestData = await request.json();
  try {
    const recaptchaData = {
      secret: requestData?.secret,
      response: requestData?.response,
    };

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(Object.entries(recaptchaData)).toString(),
    });
    const verificationResult = await response.json();
    return sendSuccess(verificationResult,  "Recaptcha verification successfully" );
  } catch (error) {
    return sendError("An error occurred while verifying recaptcha" + String(error), 500);

  }
}
