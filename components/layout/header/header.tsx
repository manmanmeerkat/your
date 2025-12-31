"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NAVI_LINKS } from "@/constants/constants";
import { MOBILE_NAVI_LINKS } from "@/constants/constants";
import { Button } from "@/components/ui/button";

import { NavLinkItem } from "./headerParts/NavLinkItem";
import MobileMenuOverlay from "./headerParts/MobileMenuOverlay";

const HamburgerIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-colors duration-150 group-hover:stroke-black [will-change:stroke]"
  >
    {isOpen ? (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ) : (
      <>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </>
    )}
  </svg>
);

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((v) => !v), []);

  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      router.push("/");
    },
    [router]
  );

  const desktopNavLinks = useMemo(
    () =>
      NAVI_LINKS.map(({ href, label }) => (
        <li key={href}>
          <NavLinkItem href={href} label={label} />
        </li>
      )),
    []
  );

  const mobileNavLinks = useMemo(
    () =>
      MOBILE_NAVI_LINKS.map(({ href, label }) => (
        <li key={href}>
          <NavLinkItem href={href} label={label} onClick={closeMenu} />
        </li>
      )),
    [closeMenu]
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#180614] shadow-sm border-b border-white/5">
        <div className="container mx-auto px-6 md:px-16 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="text-2xl font-bold text-white hover:text-gray-300 transition-colors duration-150 [will-change:color]"
            >
              Your Secret Japan
            </Link>

            {/* Hamburger */}
            <Button
              type="button"
              variant="ghost"
              className={[
                "group lg:hidden z-50 relative hover:bg-white transition-all duration-150 p-2 rounded active:scale-95",
                "[will-change:transform,background-color]",
              ].join(" ")}
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <HamburgerIcon isOpen={isMenuOpen} />
            </Button>

            {/* Desktop nav */}
            <nav className="hidden lg:block" role="navigation" aria-label="Main navigation">
              <ul className="flex space-x-6">{desktopNavLinks}</ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <MobileMenuOverlay isOpen={isMenuOpen} onClose={closeMenu}>
        {mobileNavLinks}
      </MobileMenuOverlay>
    </>
  );
}
