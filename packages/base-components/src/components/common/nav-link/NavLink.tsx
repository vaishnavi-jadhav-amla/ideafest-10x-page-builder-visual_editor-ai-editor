import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

export const NavLink = ({
  children,
  url,
  className,
  title,
  ariaLabel,
  onMouseEnter,
  onClick,
  dataTestSelector,
}: {
  children: React.ReactNode;
  url: string;
  className?: string;
  title?: string;
  ariaLabel?:string;
  dataTestSelector: string;
  onMouseEnter?: () => void;
  onClick?: ((_e: React.MouseEvent<HTMLAnchorElement>) => void) | (() => void);
}) => {
  const router = useRouter();
  const [prefetched, setPrefetched] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const triggerPrefetch = () => {
    if (!prefetched) {
      router.prefetch(url);
      setPrefetched(true);
    }
    onMouseEnter?.();
  };

  const navigateToDestination = (_e: React.MouseEvent<HTMLAnchorElement>) => {
    _e.preventDefault();
    router.push(url);

    if (onClick) {
      if (onClick.length > 0) {
        // eslint-disable-next-line no-unused-vars
        (onClick as (e: React.MouseEvent<HTMLAnchorElement>) => void)(_e);
      } else {
        (onClick as () => void)();
      }
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      triggerPrefetch();
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <Link
      href={url}
      prefetch={false}
      scroll={false}
      passHref={false}
      title={title || ""}
      ref={anchorRef}
      className={className || ""}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => navigateToDestination(e)}
      data-test-selector={dataTestSelector}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
};
