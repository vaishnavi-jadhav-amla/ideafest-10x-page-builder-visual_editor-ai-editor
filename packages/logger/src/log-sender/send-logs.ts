"use server";

/* eslint-disable no-console */
import { ILogEntry } from "@znode/types/log";
import fs from "fs";
import path from "path";

// Function to send logs to an API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendLogsToApi = async (result: any): Promise<void> => {
  try {
    const authorizationToken = "basic " + (await generateDomainBasedToken());
    const baseUrl = process.env.API_URL;
    const res = await fetch(baseUrl + "v2/log-messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationToken,
      },
      body: JSON.stringify(result),
    });
    const apiResult = await res.json();
    return apiResult;
  } catch (error) {
    console.error("Failed to send logs to API:", error);
  }
};

// Function to ensure the logs folder exists
const ensureLogsFolderExists = (folderPath: string): void => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // Create folder if it does not exist
  }
};

// Function to write logs to a file
const sendLogsToFile = (logBuffer: ILogEntry[]): void => {
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; // Format: YYYY-MM-DD
  const logsFolderPath = path.join(process.cwd(), "logs"); // Path to the logs folder
  ensureLogsFolderExists(logsFolderPath); // Ensure the folder exists

  const logFilePath = path.join(logsFolderPath, `logs-${formattedDate}.txt`); // Log file named by date

  const logData = logBuffer.map((log) => `${log.timestamp} - ${log.level} - ${log.area}: params: ${JSON.stringify(log.params)}: ${log.message}`).join("\n") + "\n";
  fs.appendFile(logFilePath, logData, (err) => {
    if (err) {
      console.error("Failed to write logs to file:", err);
    }
  });

  logBuffer.length = 0; // Clear buffer after writing
};

// Main function to handle logging based on environment
export const sendLogs = async (logBuffer: ILogEntry[]): Promise<void> => {
  const domainName = process.env.WEBSTORE_DOMAIN_NAME;
  const result = await Promise.all(
    logBuffer.map(async (log) => ({
      logMessageId: await logMessageId(), // generate unique ID per log
      component: log.area,
      traceLevel: log.level,
      logMessage: log.message,
      createdDate: new Date().toUTCString(),
      domainName: domainName,
      stackTraceMessage: "",
    }))
  );
  const loggingMethod = process.env.LOGGING_METHOD ?? "FILE"; // fallback to "FILE"

  if (loggingMethod === "API") {
    await sendLogsToApi(result);
  } else if (loggingMethod === "FILE") {
    sendLogsToFile(logBuffer);
  } else {
    console.warn("Invalid LOGGING_METHOD specified. No logs were sent.");
  }
};

export async function logMessageId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function generateDomainBasedToken() {
  const domain = process.env.API_DOMAIN;
  const domainKey = process.env.API_KEY;
  return Buffer.from(domain + "|" + domainKey).toString("base64");
}
