/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import cloudinary from "./cloudinary-config";

// Create or Update a record (Insert or Update)
export async function createOrUpdate<T>(keyPrefix: string, id: string, data: T): Promise<void> {
    try{
    const base64Data = Buffer.from(JSON.stringify(data)).toString("base64");
    const dataUri = `data:application/json;base64,${base64Data}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: "raw",
      public_id: id,
      invalidate: true,
    });
  }
  catch(error)
  {
    console.error("Error while inserting data in cloudinary:", error);
  }
}

  export async function getField<T>(keyPrefix: string, id: string, field: string): Promise<T | string | null> {

    try {
     //method not implemented
     return null;
    } catch (error) {
      console.error("Error retrieving field:", error);
      return null;
    }
  }
  

// Read/Get all fields from a Redis hash
export async function get<T>(keyPrefix: string, id: string): Promise<T | null> {
  try {

    const resource = await cloudinary.api.resource(id, {
        resource_type: "raw",
      });
      const response = await fetch(resource.secure_url);
      const responseJson: { data : any } = await response.json();
      const data = responseJson.data;
      return data;
  } catch (error) {
    console.error("Error retrieving data:", error);
    return null;
  }
}

// Delete a record (entire hash)
export async function deleteKey(keyPrefix: string): Promise<void> {

  try {
     //Method not implemented
  } catch (error) {
    console.error("Error deleting key:", error);
  }
}

// Delete specific fields from a Redis hash
export async function deleteFields(keyPrefix: string, id: string, fields: string[]): Promise<void> {
  try {
     //Method not implemented
  } catch (error) {
    console.error("Error deleting fields:", error);
  }
}

// Delete by keyPrefix
export async function deleteByKeyPrefix(keyPrefix: string): Promise<void> {
  try {
     //Method not implemented
  } catch (error) {
    console.error("Error deleting fields:", error);
  }
}

//Get key by key prefix
export async function getKeysByPrefix(keyPrefix: string): Promise<void>{
  try {
    //Method not implemented
  } catch (error) {
    console.error("Error deleting fields:", error);
  }
}
