import { getSingleSignInUserToken } from "@znode/agents/single-sign-in";
import { getPortalHeader, sendError, sendSuccess } from "@znode/utils/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function handler(req: NextRequest) {
  const clientSecretKey = req.headers.get("ClientSecret") ?? "";

  const method = req.method;

  switch (method) {
    case "POST":
      try {
        const requestBody = await req.json();
        const { username, password } = requestBody;

        const portalHeader = await getPortalHeader();

        if (!username || !password) {
          return sendError("Username and password are required.", 400);
        }

        const userToken = await getSingleSignInUserToken(username, password, portalHeader.storeCode || "", clientSecretKey);

        if (userToken?.hasError) {
          return sendError("Sign In Token retrieval failed: " + (userToken?.errorMessage || "Unknown error."), 400);
        }

        if (userToken?.errorCode === 401) {
          return sendError("You are unauthorized to access this resource. Please check your token credentials.", 401);
        }

        return sendSuccess(userToken, "Sign In Token retrieved successfully.");
      } catch (error) {
        const errorMessage = String(error);
        return sendError("An error occurred while fetching the user token: " + errorMessage, 500);
      }

    case "GET":
      return NextResponse.json(
        {
          message: "GET request is not supported for this route.",
        },
        { status: 405 }
      );

    default:
      return NextResponse.json(
        {
          message: "Method Not Allowed",
        },
        { status: 405 }
      );
  }
}

export { handler as POST, handler as GET };
