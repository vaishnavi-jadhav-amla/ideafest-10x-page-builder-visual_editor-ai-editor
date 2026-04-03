export const registerUserWithoutEmailVerification = async (registrationDetails: { userName: string; password?: string; retypePassword?: string; emailOptIn: boolean }) => {
  const registerResponse = await fetch("/api/user/register/without-email-verification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registrationDetails),
  });
  if (!registerResponse.ok) {
    const errorResponse = await registerResponse.json();
    return { hasError: true, errorCode: errorResponse.errorCode, errorMessage: errorResponse.errorMessage };
  }
  const data = await registerResponse.json();
  return data;
};
