
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const validateApis = async (request: NextRequest, response : NextResponse) => {
  if (request.nextUrl.pathname.startsWith("/api/account")){
    const session = await getToken({ req: request, secret: process.env.SECRET });
    if (!session) {
      return new Response("Unauthorized Request", {
        status: 401,
      });
    }
  }
  return response;
};
