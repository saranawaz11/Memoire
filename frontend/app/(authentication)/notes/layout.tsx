import Sidebar from "../_components/Sidebar";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1">
      <Sidebar />
      <div className="flex-1">
        {children}
      </div>
    </main>
  );
}