import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./Sidebar";

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Sidebar userName={session.name} userRole={session.role} />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-w-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full box-border">
          {children}
        </div>
      </main>
    </div>
  );
}
