/* eslint-disable @typescript-eslint/no-explicit-any */
import { IIntegrator } from "../integrator";
import { createOrUpdateFile, getFile, deleteFile, deleteFileFields, getFileField, deleteFolderByKeyPrefix, getKeysByPrefix } from "./file";

export async  function createFileIntegrator(): Promise<IIntegrator> {
  return {
    createOrUpdate: async<T>(keyPrefix: string, id: string, data: T) => {
    const dataResponse  = await createOrUpdateFile(keyPrefix, id, data);
    return dataResponse;
    },
    getField: async (keyPrefix: string, id: string, field: string) => {
    const dataResponse  = await getFileField(keyPrefix, id, field);
    return dataResponse;
    },
    get: async (keyPrefix: string, id: string) => {
      const dataResponse  = await getFile(keyPrefix, id);
      return dataResponse;
    },
    getByKeyPrefix: async (keyPrefix: string) => {
      const dataResponse = await getKeysByPrefix(keyPrefix);
      return dataResponse;
    },
    deleteFields: async (keyPrefix: string, id: string, fields: string[]) => {
      const dataResponse  = await deleteFileFields(keyPrefix, id, fields);
      return dataResponse;
    },
    deleteKey: async (keyPrefix: string) => {
      const dataResponse  = await deleteFile(keyPrefix);
      return dataResponse;
    },
    deleteByPrefix: async(keyPrefix: string) =>{
      const dataResponse = await deleteFolderByKeyPrefix(keyPrefix);
      return dataResponse;
    }
  };
}
