"use client";

import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";

interface ScrollToTopProps {
  headerRef?: React.RefObject<HTMLElement>;
}

export function ScrollToTop({ headerRef }: ScrollToTopProps) {
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const pathname = usePathname();

  useEffect(() => {
    if (headerRef?.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [headerRef]);

  const scrollToHash = () => {
    const hash = window.location.hash;
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const id = hash.substring(1);
    const el = document.getElementById(id);

    if (el && headerHeight > 0) {
      const rectTop = el.getBoundingClientRect().top;
      const scrollY = rectTop + window.scrollY - headerHeight;

      window.scrollTo({
        top: scrollY,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (window.location.hash) {
      scrollToHash();
    }

    const handleScroll = () => {
      requestAnimationFrame(scrollToHash);
    };

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      if (window.location.hash) {
        setTimeout(() => {
          scrollToHash();
        }, 0);
      }
    };

    const handleHashChange = (event: HashChangeEvent) => {
      event.preventDefault();
      scrollToHash();
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("load", handleScroll);

    if (document.readyState === "complete" || document.readyState === "interactive") {
      handleScroll();
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("load", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, headerHeight]);

  return null;
}
