/* eslint-disable @typescript-eslint/no-explicit-any */
import { IIntegrator } from "../integrator";
import { createOrUpdate, deleteByKeyPrefix, deleteFields, deleteKey, get, getField, getKeysByPrefix } from "./cdn";

export async  function cdnIntegrator(): Promise<IIntegrator> {
  return {
    createOrUpdate: async<T>(keyPrefix: string, id: string, data: T) => {
    const dataResponse  = await createOrUpdate(keyPrefix, id, data);
    return dataResponse;
    },
    getField: async (keyPrefix: string, id: string, field: string) => {
    const dataResponse  = await getField(keyPrefix, id, field);
    return dataResponse;
    },
    get: async (keyPrefix: string, id: string) => {
      const dataResponse  = await get(keyPrefix, id);
      return dataResponse;
    },
    getByKeyPrefix: async (keyPrefix: string) => {
      const dataResponse = await getKeysByPrefix(keyPrefix);
      return dataResponse;
    },
    deleteFields: async (keyPrefix: string, id: string, fields: string[]) => {
      const dataResponse  = await deleteFields(keyPrefix, id, fields);
      return dataResponse;
    },
    deleteKey: async (keyPrefix: string) => {
      const dataResponse  = await deleteKey(keyPrefix);
      return dataResponse;
    },
    deleteByPrefix: async(keyPrefix: string) =>{
      const dataResponse = await deleteByKeyPrefix(keyPrefix);
      return dataResponse;
    }
  };
}
