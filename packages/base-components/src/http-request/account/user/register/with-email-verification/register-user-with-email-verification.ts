export const registerUserWithEmailVerification = async (registrationDetails: { emailOptIn: boolean; userName: string; baseUrl: string }) => {
  const registerResponse = await fetch("/api/user/register/with-email-verification", {
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
