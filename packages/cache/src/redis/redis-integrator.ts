/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { IIntegrator } from "../integrator";
import { createOrUpdate, deleteFields, deleteKeysByPrefix, get, getField, getKeysByPrefix } from "./redis";

export  async function createRedisIntegrator(): Promise<IIntegrator> {
  return {
    createOrUpdate: async<T>(keyPrefix: string, id: string, data: T) => {
      return await createOrUpdate(keyPrefix, id, data);
    },
    getField: async (keyPrefix: string, id: string, field: string) => {
      return await getField(keyPrefix, id, field);
    },
    get: async (keyPrefix: string, id: string) => {
      return await get(keyPrefix, id);
    },
    getByKeyPrefix: async (keyPrefix: string) => {
      const dataResponse = await getKeysByPrefix(keyPrefix);
          return dataResponse;
    },
    deleteFields: async (keyPrefix: string, id: string, fields: string[]) => {
      return await deleteFields(keyPrefix, id, fields);
    },
    deleteKey: async (keyPrefix: string) => {
      const dataResponse= await deleteKeysByPrefix(keyPrefix);
      return dataResponse;
    },
    deleteByPrefix: async(keyPrefix: string) =>{
      const dataResponse = await deleteKeysByPrefix(keyPrefix);
      return dataResponse;
    }
  };
}


