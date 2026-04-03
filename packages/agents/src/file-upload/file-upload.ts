import { AREA, logServer } from "@znode/logger/server";
import { FileUpload_filesUpload } from "@znode/clients/v2/file-upload";

export async function fileUpload(folderId: number | undefined = 1, files: FormData) {
  try {
    const response = await FileUpload_filesUpload(folderId, files);

    if (response && response?.FileUpload && Array.isArray(response.FileUpload)) {
      const result = response.FileUpload.map((fileItem) => ({
        fileName: fileItem.FileName as string,
        mediaId: fileItem.MediaId as string,
      }));
      return {
        fileUpload: result,
      };
    }

    const errorMessage: string = "ErrorMessage" in response && response?.ErrorMessage ? String(response?.ErrorMessage) : "Something went wrong!..";

    logServer.error(AREA.FILE_UPLOAD, errorMessage);
    return null;
  } catch (error) {
    logServer.error(AREA.FILE_UPLOAD, "File upload failed. Please check your file and try again");
    return null;
  }
}
