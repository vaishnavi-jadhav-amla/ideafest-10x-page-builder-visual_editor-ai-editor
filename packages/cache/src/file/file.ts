/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { promisify } from "util";

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

const unlink = promisify(fs.unlink);

const storageDir = path.join(process.cwd(), "../../data");

// Ensure storage directory exists
async function ensureStorageDir(filePath: string) {
  try {
    await mkdir(filePath, { recursive: true });
  } catch (err) {
    console.error("Failed to create storage directory:", err);
  }
}

// Create or Update a record (Insert or Update)
export async function createOrUpdateFile<T>(keyPrefix: string, id: string, data: T): Promise<void> {
  const keyPrefixDir = path.join(storageDir, keyPrefix);
  await ensureStorageDir(keyPrefixDir);
  const filePath = path.join(keyPrefixDir, `${id}.json`);

  try {
    await writeFile(filePath, JSON.stringify(data));
    console.log(`Data inserted/updated for file: ${filePath}`);
  } catch (error) {
    console.error("Error inserting/updating data:", error);
  }
}

export async function deleteFolderByKeyPrefix(keyPrefix: string): Promise<void> {
  const hasColon = keyPrefix.includes(":");
  const [folderName, filePrefix] = hasColon
    ? keyPrefix.split(":")
    : [keyPrefix, null];

  const folderPath = path.join(storageDir, folderName);
  try {
    await access(folderPath);

    if (hasColon && filePrefix) {
      const files = await fs.promises.readdir(folderPath);
      const matchingFiles = files.filter(file => file.startsWith(filePrefix));
      if (matchingFiles.length === 0) {
        console.log(`No files starting with '${filePrefix}' found in '${folderPath}'.`);
        return;
      }
      for (const file of matchingFiles) {
        const filePath = path.join(folderPath, file);
        await fs.promises.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      }

      console.log(`Deleted files starting with '${filePrefix}' in '${folderPath}'.`);
    } else {
      await fs.promises.rm(folderPath, { recursive: true, force: true });
      console.log(`Folder '${folderPath}' deleted successfully.`);
    }
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log(`Folder '${folderPath}' does not exist.`);
    } else {
      console.error("Error during deletion:", error);
    }
  }
}

export async function createOrUpdateExistingFile<T>(keyPrefix: string, id: string, data: T): Promise<void> {
  const keyPrefixDir = path.join(storageDir, keyPrefix);
  await ensureStorageDir(keyPrefixDir);
  const filePath = path.join(keyPrefixDir, `${id}.json`);

  try {
    let existingData: T[] = [];
    let parsedData = {};

    // Read the existing file if it exists
    try {
      const fileContent = String(await readFile(filePath, "utf-8"));
      parsedData = JSON.parse(fileContent) || {};
    } catch (readError) {
      console.error("Error reading existing file:", readError);
      parsedData = {};
      // File does not exist, existingData remains null
    }

    if (Array.isArray(parsedData)) {
      existingData = parsedData;
    } else if (parsedData && typeof parsedData === "object") {
      existingData = [parsedData as T]; // Wrap the object in an array and cast to T[]
    } else {
      existingData = []; // Default to an empty array if the data is invalid
    }

    existingData?.push(data);

    // Write the combined data back to the file
    await writeFile(filePath, JSON.stringify(existingData, null, 2));
    console.log(`Data appended to file: ${filePath}`);
  } catch (error) {
    console.error("Error appending data:", error);
  }
}

// Read/Get all fields from a file
export async function getFile<T>(keyPrefix: string, id: string): Promise<T | null> {
  const keyPrefixDir = path.join(storageDir, keyPrefix);
  const filePath = path.join(keyPrefixDir, `${id}.json`);
  try {
    const response = await readFile(filePath, "utf-8");
    const parsedResponse = JSON.parse(response);
    const data = parsedResponse;
    return data as T;
  } catch (error) {
    console.error("Error retrieving data:", error);
    return null;
  }
}

// Read/Get specific field from a file
export async function getFileField<T>(keyPrefix: string, id: string, field: string): Promise<T | string | null> {
  const fileData = await getFile<Record<string, any>>(keyPrefix, id);
  if (fileData && field in fileData) {
    return fileData[field] as T;
  }
  console.log(`No data found for field: ${field} in file: ${keyPrefix}-${id}.json`);
  return null;
}

// Delete a record (entire file)
export async function deleteFile(keyPrefix: string): Promise<void> {
  const filePath = path.join(storageDir, `/${keyPrefix}.json`);
  try {
    await unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

// Delete specific fields from a file
export async function deleteFileFields(keyPrefix: string, id: string, fields: string[]): Promise<void> {
  const fileData = await getFile<Record<string, any>>(keyPrefix, id);
  if (!fileData) {
    console.log(`No data found for file: ${keyPrefix}-${id}.json`);
    return;
  }

  fields.forEach((field) => delete fileData[field]);
  await createOrUpdateFile(keyPrefix, id, fileData);
  console.log(`Deleted fields: ${fields.join(", ")} from file: ${keyPrefix}-${id}.json`);
}

export async function getKeysByPrefix(keyPrefix: string): Promise<string[]> {
  const keyPrefixDir = path.join(storageDir, keyPrefix);
  try {
    // Check if the directory exists
    await fs.promises.access(keyPrefixDir);

    // Read directory contents
    const files = await fs.promises.readdir(keyPrefixDir);

    // Modify filenames to match the desired format
    return files.map((file) => {
      const cleanFileName = file.replace(/\.json$/, ""); // Remove `.json`
      return `${keyPrefix}\\${cleanFileName}`; // Prepend keyPrefix without appending category ID
    });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log(`Folder '${keyPrefixDir}' does not exist.`);
      return [];
    } else {
      console.error("Error reading folder:", error);
      throw error;
    }
  }
}
