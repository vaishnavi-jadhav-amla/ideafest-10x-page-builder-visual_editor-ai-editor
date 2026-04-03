import { NextRequest } from "next/server";
import { mockRoutesMap } from "./mock-routes-map";
import { sendError } from "@znode/utils/server";

interface IParams {
  slug: string[];
}

interface IRouteContext {
  params: IParams;
}

export function GET(req: NextRequest, ctx: IRouteContext) {
  return handleRequest(req, ctx.params);
}

export function POST(req: NextRequest, ctx: IRouteContext) {
  return handleRequest(req, ctx.params);
}

export function PUT(req: NextRequest, ctx: IRouteContext) {
  return handleRequest(req, ctx.params);
}

export function DELETE(req: NextRequest, ctx: IRouteContext) {
  return handleRequest(req, ctx.params);
}

export function PATCH(req: NextRequest, ctx: IRouteContext) {
  return handleRequest(req, ctx.params);
}

async function handleRequest(req: NextRequest, params: IParams) {
  const slugPath = params.slug.join("/");

  const response = mockRoutesMap.get(slugPath);
  if (response) {
    return response();
  }

  return sendError();
}
