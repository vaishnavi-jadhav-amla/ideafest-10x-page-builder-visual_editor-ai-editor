import { getMessages } from "next-intl/server";

export async function getResourceMessages(resourceName: string | number) {
  const messages = await getMessages();
  const requiredMessages = messages[resourceName];

  if (requiredMessages) {
    const result = { [resourceName]: requiredMessages };
    return result;
  } else {
    throw new Error(`Messages for ${resourceName} not found.`);
  }
}

export async function fetchMessages(resourceNames: Array<string>) { 
  const messages = await Promise.all(resourceNames.map((name) => getResourceMessages(name)));
  return messages.reduce((acc, msg) => ({ ...acc, ...msg }), {});
}
