"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useSidebar } from "@/lib/sidebar-context";
import { useSearch } from "@/lib/search-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import logo from "@/public/assets/wax-seal.png";
import styles from "@/app/notes/_components/Notes.module.css";

const BRAND = "Mémoire";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  const { toggle } = useSidebar();
  const { query, setQuery } = useSearch();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Split-text reveal for the wordmark, runs each time the navbar mounts
  // (i.e. on page load / route entry).
  useEffect(() => {
    if (!brandRef.current) return;
    const letters = brandRef.current.querySelectorAll(`.${styles.letter}`);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        letters,
        { yPercent: 110, opacity: 0, rotateZ: 6 },
        {
          yPercent: 0,
          opacity: 1,
          rotateZ: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.045,
          delay: 0.15,
        },
      );
    }, brandRef);

    return () => ctx.revert();
  }, []);

  const handleLogout = () => signOut({ redirectUrl: "/" });
  const initial = user?.firstName?.[0] ?? user?.username?.[0] ?? "U";
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="navbar">
      <div className="nav-left">
        <button
          type="button"
          className="hamburger-btn"
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <Image src={logo} alt="Mémoire" width={40} height={40} />

        <div className={styles.brandWrap} ref={brandRef} aria-label={BRAND}>
          {BRAND.split("").map((char, i) => (
            <span key={i} className={styles.letterMask}>
              <span className={styles.letter}>
                {char === " " ? "\u00A0" : char}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="nav-search-wrap">
        <input
          type="text"
          className="nav-search-input"
          placeholder="Search notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {(searchFocused || query) && (
          <span
            className="search-caret"
            style={{ left: `${24 + query.length * 6.5}px` }}
          />
        )}
      </div>

      <div className="nav-right">
        <div className="profile-menu" ref={menuRef}>
          <button
            type="button"
            className="profile-trigger-icon"
            onClick={() => setOpen((o) => !o)}
            aria-label="Account menu"
          >
            {user?.hasImage ? (
              <Image
                src={user.imageUrl}
                alt={user.fullName ?? "Account"}
                className="avatar avatar-img"
              />
            ) : (
              <div className="avatar">{initial}</div>
            )}
          </button>

          {open && (
            <div className="dropdown">
              <div className="who">
                <div className="n">{user?.fullName ?? "Account"}</div>
                <div className="e">
                  {user?.primaryEmailAddress?.emailAddress ?? ""}
                </div>
              </div>
              <div
                className="d-item"
                onClick={() => {
                  setOpen(false);
                  router.push("/profile");
                }}
              >
                👤 Profile
              </div>
              <div
                className="d-item"
                onClick={() => {
                  setOpen(false);
                  router.push("/settings");
                }}
              >
                ⚙ Settings
              </div>
              <hr />
              <div
                className="d-item danger"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
              >
                ⏻ Log out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
