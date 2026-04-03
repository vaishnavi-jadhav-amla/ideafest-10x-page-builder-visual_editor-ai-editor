import { CUSTOM_HEADERS } from "@znode/constants/common";
import { generateDomainBasedToken } from "@znode/utils/server";
import { customFetch } from "../../common/customFetch";
const baseUrl = process.env.API_URL;

export async function UploadPOMedia(formData: FormData) {
    const url_ = baseUrl + "fileupload/post?folderid=1&isPODocumentUpload=true";
    const headers: HeadersInit = new Headers();
    headers.set(CUSTOM_HEADERS.AUTHORIZATION, "basic " + generateDomainBasedToken());
    const options_: RequestInit = {
        body: formData,
        method: "POST",
        cache: "no-store",
        headers: headers,
    };
    const response = await customFetch(url_, options_, "UploadPOMedia").then((response) => response.json());
    return response;
}