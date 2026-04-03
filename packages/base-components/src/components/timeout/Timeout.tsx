import { useEffect, useState } from "react";
import { TIMEOUT } from "@znode/constants/timeout";

interface IdleTimeoutProps {
  timeout: number;
  onSessionTimeout: () => void;
}

const IdleTimeout: React.FC<IdleTimeoutProps> = ({ timeout, onSessionTimeout }) => {
  const [idleTime, setIdleTime] = useState(0);

  // Function to reset idle time
  const resetIdleTime = () => {
    localStorage.setItem(TIMEOUT.LAST_ACTIVITY, Date.now().toString());
    setIdleTime(0);
  };

  useEffect(() => {
    // Initialize last activity time
    if (!localStorage.getItem(TIMEOUT.LAST_ACTIVITY)) {
      resetIdleTime();
    }

    // Function to increment idle time
    const incrementIdleTime = () => {
      const localStorageLastActivity = localStorage.getItem(TIMEOUT.LAST_ACTIVITY);

      if (!localStorageLastActivity || localStorageLastActivity.trim() === "") {
        setIdleTime(0);
        return;
      }

      const lastActivity = parseInt(localStorageLastActivity, 10);
      const diffSeconds = Math.floor((Date.now() - lastActivity) / 1000);
      setIdleTime(diffSeconds);
    };

    const resetIdleTimerOnActivity = () => resetIdleTime();

    // Listen for activity updates from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === TIMEOUT.LAST_ACTIVITY) {
        incrementIdleTime();
      }
    };

    const idleTimer = setInterval(incrementIdleTime, 1000);
    
    // Reset idle time on user activity
    window.addEventListener("mousemove", resetIdleTimerOnActivity);
    window.addEventListener("keypress", resetIdleTimerOnActivity);
    window.addEventListener("storage", onStorage);

    // Clear idle timer on component unmount    
    return () => {
      clearInterval(idleTimer);
      window.removeEventListener("mousemove", resetIdleTimerOnActivity);
      window.removeEventListener("keypress", resetIdleTimerOnActivity);
      window.removeEventListener("storage", onStorage);
    };
  }, [idleTime]);

  // Check for timeout
  useEffect(() => {
    if (idleTime >= timeout) {
      onSessionTimeout();
      resetIdleTime();
    }
  }, [idleTime, timeout, onSessionTimeout]);

  return null;
};

export default IdleTimeout;
