"use client";

import { useEffect } from "react";

export default function MaintenanceReloader() {
 useEffect(() => {
    const hasReloaded = sessionStorage.getItem("alreadyReloaded");

    if (!hasReloaded) {
      sessionStorage.setItem("alreadyReloaded", "true");
      window?.location?.reload();
    }

    const handleBeforeUnload = () => {
      sessionStorage.removeItem("alreadyReloaded");
    };

    const handlePopState = () => {
      sessionStorage.removeItem("alreadyReloaded");
      window?.location?.reload();
    };

    typeof window !== "undefined" && window.addEventListener("beforeunload", handleBeforeUnload);
    typeof window !== "undefined" && window.addEventListener("popstate", handlePopState);

    return () => {
      typeof window !== "undefined" && window.removeEventListener("beforeunload", handleBeforeUnload);
      typeof window !== "undefined" && window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return <></>;
}
