/* eslint-disable @typescript-eslint/no-explicit-any */
export const sendSuccess = (data: any, message = "Request successful") => {
  return Response.json({
    status: "success",
    message: message,
    data: data,
  });
};

export const sendError = (message = "An error occurred", statusCode = 500) => {
  return new Response(message, {
    status: statusCode,
  });
};
