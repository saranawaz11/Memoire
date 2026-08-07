"use client";

import { usePathname } from "next/navigation";
import { NotesRefreshProvider } from "@/lib/note-refresh-context";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";
import { SearchProvider } from "@/lib/search-context";
import Sidebar from "@/app/notes/_components/Sidebar";
import AssistantLauncher from "@/app/notes/_components/AssistantLauncher";
import Navbar from "@/app/notes/_components/Navbar";

// Matches /notes/<id> but not /notes itself and not /notes/form
function useIsFocusedNote() {
  const pathname = usePathname();
  return /^\/notes\/[^/]+$/.test(pathname) && pathname !== "/notes/form";
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useSidebar();
  const isFocusedNote = useIsFocusedNote();

  if (isFocusedNote) {
    // No navbar, no sidebar, no assistant launcher — just the page.
    return (
      <NotesRefreshProvider>
        <main className="h-full w-full overflow-y-auto no-scrollbar">{children}</main>
      </NotesRefreshProvider>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 min-h-0 relative">
        {isOpen && <div className="sidebar-backdrop" onClick={close} />}
        <aside className={`sidebar-aside ${isOpen ? "open" : ""} w-[20%]`}>
          <Sidebar />
        </aside>
        <NotesRefreshProvider>
          <main className="h-full flex-1 min-w-0 overflow-y-auto no-scrollbar">
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