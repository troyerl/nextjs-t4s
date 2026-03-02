"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { routes } from "@/lib/routes";
import { UserGroupEnum } from "@/lib/types";
import Image from "next/image";

interface AdminNavProps {
  group: UserGroupEnum | null;
}

const generalRoutes = [
  routes.auth.base,
  routes.auth.calendar,
  routes.auth.settings,
];
const managementRoutes = [
  routes.auth.shoppers,
  routes.auth.inventory,
  routes.auth.transactions,
  routes.auth.reservations,
];

export default function AdminNav({ group }: AdminNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isDirector = group === UserGroupEnum.Director;
  const desktopRoutes = isDirector
    ? [routes.auth.transactions]
    : [...generalRoutes, ...managementRoutes];

  return (
    <>
      <header
        className={`border-b border-gray-200 bg-white px-4 py-3 ${isDirector ? "" : "md:hidden"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={"/assets/img/logo.png"}
              alt={"Tools-4-Schools Logo"}
              className="h-12 w-12"
              width={900}
              height={300}
            />
            {isDirector ? (
              <p className="text-lg font-semibold">{group}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {!isDirector ? (
              <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold"
              >
                Menu
              </button>
            ) : null}
            <LogoutButton />
          </div>
        </div>
      </header>

      {!isDirector && open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu backdrop"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Image
                src={"/assets/img/logo.png"}
                alt={"Tools-4-Schools Logo"}
                className="h-[20vh] w-auto md:h-[30vh]"
                width={900}
                height={300}
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
                aria-label="Close menu"
              >
                X
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-2 border-t border-gray-200 pt-6">
              {desktopRoutes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={() => setOpen(false)}
                  className={`${pathname === route.path ? "bg-light-primary text-primary" : "text-gray-900"} rounded-md px-3 py-2 text-sm font-semibold`}
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {!isDirector ? (
        <aside className="hidden h-screen w-75 border-r border-dashed border-gray-200 bg-white p-6 md:block">
          <div className="flex h-full flex-col">
            <Image
              src={"/assets/img/logo.png"}
              alt={"Tools-4-Schools Logo"}
              className="h-[20vh] w-auto md:h-[30vh]"
              width={900}
              height={300}
            />
            <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3">
              <div>
                <h3 className="text-base font-semibold">Tools-4-Schools</h3>
                <p className="text-sm">{group ?? "Admin"}</p>
              </div>
              <LogoutButton />
            </div>

            <div className="mt-6 flex-1 overflow-auto">
              <NavSection
                title="General"
                pathname={pathname}
                routes={generalRoutes}
              />
              <NavSection
                title="Management"
                pathname={pathname}
                routes={managementRoutes}
              />
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}

function NavSection({
  title,
  pathname,
  routes: sectionRoutes,
}: {
  title: string;
  pathname: string;
  routes: { path: string; label: string }[];
}) {
  return (
    <div className="mb-6">
      <h4 className="mb-2 text-sm font-semibold text-gray-500">{title}</h4>
      <div className="space-y-1">
        {sectionRoutes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className={`${pathname === route.path ? "bg-light-primary text-primary" : "text-gray-900"} block rounded-md px-3 py-2 text-sm font-medium`}
          >
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
