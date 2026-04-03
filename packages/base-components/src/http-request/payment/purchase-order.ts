export const uploadPOMedia = async (props: FormData) => {
    //TODO : Warlords : Need to use httpRequest wrapper here after modifying it to support formdata 
    const res = await fetch("/api/payment/upload-po-document", {
        method: "POST",
        headers: {
            cache: "no-store",
        },
        body: props,
    });
    const response = await res.json();
    return response;
};