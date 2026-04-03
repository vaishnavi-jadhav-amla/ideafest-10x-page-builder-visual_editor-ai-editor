"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useMemo } from "react";

interface IGenerateMultiFactorAuthenticationRequest {
  userId: string;
  portalId?: number;
  email: string;
  isResendMail: boolean;
}

interface IMultiFactorFormData {
  otp: string;
  username?: string;
  portalId?: string;
  isRememberDevice?: boolean;
  userId?: string;
  maskedEmail?: string;
  expiresAt?: string;
}

type Props = {
  username: string;
  maskedEmail: string;
  logoUrl: string;
  title?: string;
  subTitle?: string;
  authenticationUrl?: string;
  resendUrl?: string;
  userId?: number;
  remainingAttempts?: number;
  remainingSeconds?: number;
  otpGenerationTime?: Date;
  errorMessage?: string;
  isWebstore?: boolean;
  enableCartRedirection?: boolean;
  redirectURL?: string;
  hasError?: boolean;
  CustomImageComponent?: any;
  validateMultiFactorAuthentication?: any;
  generateMultiFactorAuthentication?: any;
  multiFactorSignIn?: any;
  cleanUpFunction?: any;
  fetchOTPDetails?: any;
  triggerNotification?: any;
  redirectToLogin?: any;
  stringTranslations?: any;
  invalidOtpCodePluralTranslations?: any;
  hideRemainingAttemptsFlag?: boolean;
  removeLocalStorageData?: any;
};

const MultiFactorAuthentication: React.FC<Props> = ({
  username,
  maskedEmail,
  logoUrl,
  title,
  subTitle,
  authenticationUrl,
  resendUrl,
  userId,
  remainingAttempts,
  remainingSeconds = 0,
  otpGenerationTime,
  errorMessage,
  isWebstore = false,
  hasError,
  validateMultiFactorAuthentication,
  generateMultiFactorAuthentication,
  CustomImageComponent,
  multiFactorSignIn,
  fetchOTPDetails,
  triggerNotification,
  redirectToLogin,
  stringTranslations,
  invalidOtpCodePluralTranslations,
  hideRemainingAttemptsFlag = false,
  removeLocalStorageData,
}) => {
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(remainingSeconds);
  const [isErrorNotification, setIsErrorNotification] = useState<boolean | undefined>(hasError);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [otpValue, setOtpValue] = useState<string[]>(Array(6).fill(""));
  const [safeRemainingAttempts, setSafeRemainingAttempts] = useState<number>(remainingAttempts !== undefined && remainingAttempts >= 0 ? remainingAttempts : Infinity);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hideRemainingAttempt, setHideRemainingAttempt] = useState<boolean>(!!hideRemainingAttemptsFlag);

  const [showNotification, setShowNotification] = useState<boolean>(!!errorMessage);
  const [notificationMsg, setNotificationMsg] = useState<string>(errorMessage || "");
  const hasFilledOtp = (): boolean => {
    const otp = otpValue.join("");
    if (otp.length !== 6) return false;
    return true;
  };

  const otpGenerationTimeSeconds = useMemo(() => {
    return otpGenerationTime ? new Date(otpGenerationTime).getTime() : null;
  }, [otpGenerationTime]);

  const enableResend = otpGenerationTimeSeconds ? Math.floor((new Date().getTime() - otpGenerationTimeSeconds) / 1000) >= 30 : false;

  const disableSubmitButtonFlag = !hasFilledOtp() || secondsLeft <= 0 || safeRemainingAttempts <= 0 || isSubmitting;

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(remainingSeconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    inputRefs?.current[0]?.focus();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds]);

  // Timeout notification
  useEffect(() => {
    if (safeRemainingAttempts <= 0) {
      setSecondsLeft(0);
      return;
    }
    if (secondsLeft === 0 && safeRemainingAttempts > 0) {
      showNotificationBox(isWebstore ? stringTranslations.timeOutError : "Your authentication code timed out. Kindly generate a new code to continue.", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, safeRemainingAttempts]);

  // Auto-hide notification

  useEffect(() => {
    let notificationTimer = null;
    if (showNotification && !isWebstore) {
      notificationTimer = setTimeout(() => setShowNotification(false), 10000);
    }
    return () => {
      notificationTimer && clearTimeout(notificationTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNotification]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const showNotificationBox = (msg: string, isError?: boolean) => {
    setNotificationMsg(msg);
    setIsErrorNotification(isError);
    setShowNotification(true);
    if (isWebstore) {
      triggerNotification(isError, msg);
    }
  };

  // OTP input handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) return;
    const newOtp = [...otpValue];
    newOtp[index] = value.slice(-1);
    setOtpValue(newOtp);
    if (index < inputRefs.current.length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const newOtp = [...otpValue];
    if (e.key === "Backspace") {
      e.preventDefault();
      if (otpValue[index]) {
        newOtp[index] = "";
        setOtpValue(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtpValue(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < otpValue.length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!hasFilledOtp() || secondsLeft <= 0 || safeRemainingAttempts <= 0 || isSubmitting) return;
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    // eslint-disable-next-line newline-per-chained-call
    const pasteData = e.clipboardData.getData("Text").replace(/\D/g, "").slice(0, 6).split("");
    const newOtp = [...otpValue];
    pasteData.forEach((char, i) => (newOtp[i] = char));
    setOtpValue(newOtp);
    const nextIndex = Math.min(pasteData.length, inputRefs.current.length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const createFormData = () => {
    const otp = otpValue.join("");
    const formData: IMultiFactorFormData = {
      userId: (userId ?? 0).toString(),
      username: username,
      otp: otp,
      isRememberDevice: Boolean(rememberDevice || false),
    };
    return formData;
  };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event && event.preventDefault();
    setIsSubmitting(true);

    if (isWebstore) {
      const formData = createFormData();
      const data = await validateMultiFactorAuthentication(formData);
      if (data?.hasError) {
        showNotificationBox(data?.errorMessage || "", true);
        setIsSubmitting(false);
        redirectToLogin();
        return;
      } else if (!data?.isValid) {
        hideRemainingAttemptsFlag && removeLocalStorageData("hideRemainingAttemptsFlag");
        hideRemainingAttempt && setHideRemainingAttempt(false);
        setSafeRemainingAttempts((prev) => prev - 1);
        if (data?.remainingAttempts > 1) {
          showNotificationBox(invalidOtpCodePluralTranslations(data?.remainingAttempts) || "", true);
        } else if (data?.remainingAttempts === 1) {
          showNotificationBox(stringTranslations.invalidOtpCodeSingular || "", true);
        }
        setOtpValue(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        setIsSubmitting(false);
        return;
      }
      await multiFactorSignIn();
    } else {
      setShowNotification(false);

      const form = document.createElement("form");
      form.method = "post";
      form.action = authenticationUrl ?? "";

      const addField = (name: string, value: string) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };

      const otp = otpValue.join("");
      addField("OtpCode", otp);
      addField("ExpiresAt", new Date(Date.now() + secondsLeft * 1000).toISOString());
      addField("IsRememberDevice", rememberDevice ? "true" : "false");
      document.body.appendChild(form);
      form.submit();
      setIsSubmitting(false);
    }
  };

  const getGenerateMultiFactorPayload = () => {
    const formData: IGenerateMultiFactorAuthenticationRequest = {
      userId: (userId ?? 0).toString(),
      isResendMail: true,
      email: username,
    };
    return formData;
  };

  const handleResend = async () => {
    if (!enableResend) return;
    const formData = getGenerateMultiFactorPayload();
    if (isWebstore) {
      const response = await generateMultiFactorAuthentication(formData as IGenerateMultiFactorAuthenticationRequest);
      if (response?.hasError) {
        showNotificationBox(response.errorMessage || "", true);
      } else if (response?.isValid) {
        showNotificationBox(stringTranslations.otpResentSuccessfully || "", false);
      } else {
        showNotificationBox(response?.errorMessage || "", true);
      }
      fetchOTPDetails();
    } else {
      const form = document.createElement("form");
      form.method = "post";
      form.action = resendUrl ?? "";

      const addField = (name: string, value: string) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };

      addField("IsResendMail", "true");

      document.body.appendChild(form);
      form.submit();
    }
  };

  const getCloseIconColor = () => (isErrorNotification === false ? adminGreenColor : isErrorNotification === undefined ? "#8a6d3b" : "#ea2f25");
  const getButtonBackgroundColor = () => {
    if (isWebstore) return { backgroundColor: disableSubmitButtonFlag ? "#ccc" : "var(--primary-btn-bg)", color: "var(--primary-btn-text)" };
    return { backgroundColor: disableSubmitButtonFlag ? "#ccc" : adminGreenColor };
  };

  const getNotificationStyles = () =>
    isErrorNotification === false
      ? { backgroundColor: "#e6f4ea", color: adminGreenColor, border: `1px solid ${adminGreenColor}` }
      : isErrorNotification === undefined
      ? { backgroundColor: "#fff8e1", color: "#8a6d3b", border: "1px solid #ffecb3" }
      : { backgroundColor: "#fdecea", color: "#c71c2dff", border: "1px solid #B02A37" };
  return (
    <div style={{ ...styles.container, minHeight: isWebstore ? "70vh" : "100vh" }}>
      {!isWebstore && showNotification && notificationMsg && (
        <div style={{ ...styles.notificationContainer, ...getNotificationStyles() }}>
          <span>{notificationMsg}</span>
          <button
            onClick={() => setShowNotification(false)}
            className="pull-right right z-close-circle"
            style={{ ...styles.notificationButton, color: getCloseIconColor() }}
            aria-label="Close notification"
          ></button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{ background: "white", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", maxWidth: "350px", width: "100%", textAlign: "center" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isWebstore ? (
            <CustomImageComponent customClass="h-16 object-contain" imgSrc={logoUrl} alternate="Logo" width={200} height={60} dataTestSelector="websiteLogo" />
          ) : (
            <img src={logoUrl} alt="Logo" style={{ height: "35px", marginBottom: "8px" }} />
          )}
        </div>
        {subTitle && <h3 style={{ margin: "8px 0", fontWeight: "bold" }}>{subTitle}</h3>}
        {subTitle && <hr style={{ margin: "10px 0" }} />}
        <h2 style={{ color: "black", marginBottom: "5px", fontSize: "18px" }}>{title}</h2>
        <p style={{ color: "#555", fontSize: "13px", marginBottom: "12px" }}>
          {isWebstore ? stringTranslations.enterAuthCode : "Please authenticate your account by entering the authorization code sent to "}
          <br />
          <strong>{maskedEmail}</strong>
        </p>

        {/* OTP inputs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "15px 0" }}>
          {otpValue.map((digit, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={digit}
              ref={(el) => {
                if (el) inputRefs.current[i] = el;
              }}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              style={styles.otpDigit}
            />
          ))}
        </div>
        {safeRemainingAttempts !== Infinity && !hideRemainingAttempt ? (
          <p style={{ fontSize: "12px", color: safeRemainingAttempts <= 2 ? "red" : "#666", marginBottom: "8px" }}>
            {isWebstore ? stringTranslations.attemptsLeft : "Attempts left: "}
            {safeRemainingAttempts}
          </p>
        ) : (
          <></>
        )}
        {/* Timer */}
        <p style={{ fontSize: "12px", color: "#007bff", marginBottom: "10px" }}>
          {isWebstore ? stringTranslations.timeRemaining : "Time remaining: "}
          {formatTime(secondsLeft)}
        </p>
        <div style={{ display: "flex", alignItems: "center", userSelect: "none", fontSize: "13px", marginBottom: "12px" }}>
          <label htmlFor="RememberMe" onClick={() => setRememberDevice((state) => !state)} style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={rememberDevice}
              style={{
                border: rememberDevice ? `1px solid ${adminGreenColor}` : "2px solid #110f0f",
                backgroundColor: rememberDevice ? adminGreenColor : "white",
                marginRight: "4px",
              }}
              name="RememberMe"
            />
            <span className="lbl padding-8 login-font-size-14">{isWebstore ? stringTranslations.rememberThisDevice : "Remember this device"}</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={disableSubmitButtonFlag}
          style={{ ...styles.submitButton, cursor: disableSubmitButtonFlag ? "not-allowed" : "pointer", ...getButtonBackgroundColor() }}
        >
          {isWebstore ? stringTranslations.submitCode : "SUBMIT CODE"}
        </button>
        <p style={{ fontSize: "12px", marginTop: "12px", color: "#666" }}>
          {isWebstore ? stringTranslations.resendNewCodeInfo : "It may take few seconds to receive your code. Haven’t received it? "}
          <button
            type="button"
            onClick={handleResend}
            disabled={!enableResend}
            style={{
              color: enableResend ? "#007bff" : "#aaa",
              textDecoration: "none",
              background: "none",
              border: "none",
              padding: 0,
              cursor: enableResend ? "pointer" : "not-allowed",
            }}
          >
            {isWebstore ? stringTranslations.resendNewCode : "Resend a new code"}
          </button>
          .
        </p>
      </form>
    </div>
  );
};

const backgroundColorGray = "#f5f5f5";
const adminGreenColor = "#5db043";

const styles = {
  container: {
    backgroundColor: backgroundColorGray,
    fontFamily: "Arial, sans-serif",
    margin: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative" as React.CSSProperties["position"],
  },
  notificationContainer: {
    padding: "12px 20px",
    position: "fixed" as React.CSSProperties["position"],
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    maxWidth: "500px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1000,
  },
  notificationButton: {
    background: "none",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    marginLeft: "10px",
    fontSize: "16px",
    lineHeight: "1",
  },
  otpDigit: { width: "36px", height: "36px", fontSize: "18px", textAlign: "center" as React.CSSProperties["textAlign"], border: "1px solid #ccc", borderRadius: "5px" },
  submitButton: {
    display: "block",
    width: "100%",
    padding: "8px 0",
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
    textTransform: "uppercase" as React.CSSProperties["textTransform"],
    border: "none",
    borderRadius: "3px",
    letterSpacing: "1px",
    transition: "background-color 0.3s ease, box-shadow 0.3s ease",
  },
  rememberMeSpan: {
    position: "absolute" as React.CSSProperties["position"],
    top: "2px",
    left: "4px",
    width: "5px",
    height: "9px",
    border: "solid white",
    borderWidth: "0 2px 2px 0",
    transform: "rotate(45deg)",
  },
};

export default MultiFactorAuthentication;
