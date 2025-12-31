"use client";

import React, { memo, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  label: string;
  onClick?: () => void;     // mobile close など
  prefetch?: boolean;
};

function NavLinkItemBase({ href, label, onClick, prefetch = true }: NavLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname === href;

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (prefetch) router.prefetch(href);
  }, [router, href, prefetch]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  const colorClass = isActive
    ? "text-white drop-shadow-sm"
    : isHovered
      ? "text-white/100"
      : "text-white/80";

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={[
        "block py-2 transition-colors duration-150",
        isPressed ? "scale-95" : "scale-100",
        colorClass,
        "[will-change:transform,color]",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export const NavLinkItem = memo(NavLinkItemBase);
