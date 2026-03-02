import AdminNav from "@/components/admin/AdminNav";
import { getSessionUserGroup } from "@/lib/session";
import { UserGroupEnum } from "@/lib/types";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const group = await getSessionUserGroup();
  const isDirector = group === UserGroupEnum.Director;

  return (
    <div className={`min-h-screen bg-gray-50 ${isDirector ? "flex flex-col" : "md:flex"}`}>
      <AdminNav group={group} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
