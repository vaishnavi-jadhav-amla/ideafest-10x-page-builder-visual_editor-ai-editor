"use server";

import { AREA, errorStack, logServer } from "@znode/logger/server";

const cryptoSubtle = crypto.subtle;
const ALGO = "AES-GCM";
const IV_LENGTH = 12;
const defaultSecret: string = process.env.NEXT_ENCRYPTION_SECRET || "ABC@123213512123";

async function generateKey(secret: string) {
  return cryptoSubtle.importKey("raw", new TextEncoder().encode(secret), { name: ALGO }, false, ["encrypt", "decrypt"]);
}

function base64Encode(arrayBuffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
}

function base64Decode(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

/**
 * Encrypts a string and returns a single base64 string
 */
export async function encryptData(data: string, secret: string = defaultSecret): Promise<string> {
  try {
    const key = await generateKey(secret);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await cryptoSubtle.encrypt({ name: ALGO, iv }, key, encodedData);

    // Combine IV + Encrypted data into one Uint8Array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const combined: any = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return base64Encode(combined);
  } catch (error) {
    logServer.error(AREA.ENCRYPTION_DECRYPTION_STRING, errorStack(error));
    return "";
  }
}

/**
 * Decrypts a base64 string back to original string
 */
export async function decryptData(encryptedBase64: string, secret: string = defaultSecret): Promise<string> {
  try {
    const combined = base64Decode(encryptedBase64);
    const iv = combined.slice(0, IV_LENGTH); // Extract IV
    const encryptedData = combined.slice(IV_LENGTH); // Extract actual encrypted data

    const key = await generateKey(secret);
    const decrypted = await cryptoSubtle.decrypt({ name: ALGO, iv }, key, encryptedData);

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    logServer.error(AREA.ENCRYPTION_DECRYPTION_STRING, errorStack(error));
    return "";
  }
}
