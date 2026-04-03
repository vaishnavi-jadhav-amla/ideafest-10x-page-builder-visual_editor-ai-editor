import { ILogEntry } from "@znode/types/log";
import { sendLogs } from "@znode/logger/server";

export async function POST(request: Request) {
  const requestBody: ILogEntry[] = await request.json();
  await sendLogs(requestBody);
  return new Response("Logger API");
}
