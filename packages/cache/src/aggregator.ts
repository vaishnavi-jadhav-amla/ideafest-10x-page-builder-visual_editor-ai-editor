import { integrators } from "./factory";

export async function createOrUpdate<T>(keyPrefix: string, id: string, data: T) {
  const integratorsInstance = await integrators();
  return integratorsInstance.createOrUpdate(keyPrefix, id, data);
}

export async function getField(keyPrefix: string, id: string, field: string) {
  const integratorsInstance = await integrators();
  return integratorsInstance.getField(keyPrefix, id, field);
}

export async function get(keyPrefix: string, id: string) {
  const integratorsInstance = await integrators();
  return integratorsInstance.get(keyPrefix, id);
}

export async function deleteFields(keyPrefix: string, id: string, fields: string[]) {
  const integratorsInstance = await integrators();
  return integratorsInstance.deleteFields(keyPrefix, id, fields);
}

export async function deleteKey(keyPrefix: string) {
  const integratorsInstance = await integrators();
  return integratorsInstance.deleteKey(keyPrefix);
}

export async function deleteKeyPrefix(keyPrefix: string) {
  const integratorsInstance = await integrators();
  return integratorsInstance.deleteByPrefix(keyPrefix);
}

export async function getByKeyPrefix(keyPrefix: string){
  const integratorsInstance = await integrators();
  return integratorsInstance.getByKeyPrefix(keyPrefix);
}