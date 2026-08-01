"use client";

import { NotesRefreshProvider } from "@/lib/note-refresh-context";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";
import { SearchProvider } from "@/lib/search-context";
import Sidebar from "../_components/Sidebar";
import AssistantLauncher from "../components/AssistantLauncher";
import Navbar from "../_components/Navbar";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useSidebar();

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 min-h-0 relative">
        {isOpen && <div className="sidebar-backdrop" onClick={close} />}
        <aside className={`sidebar-aside ${isOpen ? "open" : ""} w-[20%]`}>
          <Sidebar />
        </aside>
        <NotesRefreshProvider>
          <main className="h-full flex-1 min-w-0 overflow-y-auto">
            {children}
          </main>
          <AssistantLauncher />
        </NotesRefreshProvider>
      </div>
    </div>
  );
}

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SearchProvider>
        <LayoutInner>{children}</LayoutInner>
      </SearchProvider>
    </SidebarProvider>
  );
}