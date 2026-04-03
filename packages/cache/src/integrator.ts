/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */

export interface IIntegrator {
    createOrUpdate: (keyPrefix: string, id: string, data: any) => Promise<any>;
    get: (keyPrefix: string, id: string) => Promise<any>;
    getField: (keyPrefix: string, id: string, field: string) => Promise<any>;
    deleteKey: (keyPrefix: string, id?: string) => Promise<any>;
    deleteFields: (keyPrefix: string, id: string, fields: string[]) => Promise<any>;
    deleteByPrefix: (keyPrefix: string) => Promise<any>;
    getByKeyPrefix: (keyPrefix: string) => Promise<any>;  
  }