"use client";

import { useEffect } from "react";

type Props = { enableUserActivity: boolean };

type WindowWithFlag = Window & { isUserActivityTrackerEnabled?: boolean };

export function ActivityFlagProvider({ enableUserActivity }: Props) {
  useEffect(() => {
    (window as WindowWithFlag).isUserActivityTrackerEnabled = enableUserActivity;
  }, [enableUserActivity]);
  return null;
}
