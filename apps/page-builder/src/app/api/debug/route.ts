import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@znode/utils/server";
import { debugManager } from "@znode/clients/common";
import { HEADERS } from "@znode/constants/headers";
import { timingSafeEqual } from "crypto";

const DEBUG_TOKEN = process.env.ZNODE_DEBUG_TOKEN ?? "";

function validateRequestHeaders(request: NextRequest) {
  const debugToken = request.headers.get(HEADERS.ZNODE_DEBUG_TOKEN);

  if (!debugToken) {
    return `Missing required headers: ${HEADERS.ZNODE_DEBUG_TOKEN}.`;
  }

  const tokenFromRequest = Buffer.from(debugToken);
  const expectedToken = Buffer.from(DEBUG_TOKEN);
  if (tokenFromRequest.length !== expectedToken.length || !timingSafeEqual(tokenFromRequest as unknown as Uint8Array, expectedToken as unknown as Uint8Array)) {
    return `Invalid ${HEADERS.ZNODE_DEBUG_TOKEN}`;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const validationError = validateRequestHeaders(request);
    if (validationError) {
      return sendError(validationError, 401);
    }
    return sendSuccess(
      {
        enabledFunctions: debugManager.getEnabled(),
        count: debugManager.getEnabled().length,
      },
      "Debug configuration retrieved"
    );
  } catch (error) {
    return sendError("Failed to get debug configuration", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const validationError = validateRequestHeaders(request);
    if (validationError) {
      return sendError(validationError, 401);
    }
    const { action, functionNames } = await request.json();

    if (action === "enable") {
      const added = debugManager.enableFunction(functionNames);
      return sendSuccess({ enabledFunctions: debugManager.getEnabled(), added }, `Debug enabled for: ${added.join(", ")}`);
    }

    if (action === "disable") {
      const removed = debugManager.disableFunction(functionNames);
      return sendSuccess({ enabledFunctions: debugManager.getEnabled(), removed }, `Debug disabled for: ${removed.join(", ")}`);
    }

    if (action === "clear") {
      debugManager.clearAll();
      return sendSuccess({ enabledFunctions: [], count: 0 }, "All debug functions cleared");
    }

    return sendError("Invalid action. Use: enable, disable, or clear", 400);
  } catch (error) {
    return sendError("Failed to update debug configuration: " + String(error), 500);
  }
}
