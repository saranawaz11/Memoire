"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useSidebar } from "@/lib/sidebar-context";
import styles from "./Notes.module.css";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
const navItems = [
  { label: "All Notes", href: "/notes", icon: "▤" },
  { label: "Ask AI", href: "/notes/ask-ai", icon: "✦" },
  { label: "Archive", href: "/notes/archive", icon: "▣" },
  { label: "Trash", href: "/notes/trash", icon: "🗑" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { close } = useSidebar();
  const { signOut } = useClerk();

  const handleLogout = () => signOut({ redirectUrl: "/sign-in" });

  return (
    <div className={`${styles.sidebar} sidebar h-full flex flex-col`}>
      <div className="sb-scroll">
        <div className="sb-section-label">Workspace</div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={`sb-item ${isActive ? "active" : ""}`}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          );
        })}
      </div>

      <div className="sb-footer">
        <div className="sb-divider" />
        <button type="button" className="sb-item sb-logout" onClick={handleLogout}>
          <span className="ic">⏻</span> Log out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;