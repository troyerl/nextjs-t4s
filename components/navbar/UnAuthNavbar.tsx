"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { routes, unauthNavbarRoutes } from "@/lib/routes";
import Image from "next/image";
import { ArrowLongRight, XMark } from "@/icons";
import { HamburgerMenu } from "@/icons/HamburgerMenu";

interface UnAuthNavbarProps {
  isDarkText?: boolean;
  rightAction?: ReactNode;
}

export function UnAuthNavbar({
  isDarkText = true,
  rightAction,
}: UnAuthNavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const textColorClass = isDarkText ? "text-black" : "text-white";

  return (
    <header className={isDarkText ? "baseUnderBoxShadow" : ""}>
      <nav
        aria-label="Global"
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:justify-end md:px-8 md:py-5 ${isDarkText ? "bg-white" : "bg-transparent"}`}
      >
        <div className="flex items-center gap-2">
          {rightAction ? <div className="md:hidden">{rightAction}</div> : null}
          <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            className={`text-sm font-semibold md:hidden ${textColorClass}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <HamburgerMenu
              class={`${isDarkText ? "text-black" : "text-white"} size-7`}
            />
          </button>
        </div>

        <div className="hidden items-center gap-x-10 md:flex">
          {unauthNavbarRoutes
            .filter((route) => !route.mobileOnly)
            .map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`${pathname === route.path ? "text-primary" : textColorClass} hover:underline hover:opacity-50 font-medium`}
              >
                {route.label}
              </Link>
            ))}
          <Link
            href={routes.unauth.login.path}
            className={`${pathname === routes.unauth.login.path ? "text-primary" : textColorClass} font-bold hover:underline hover:opacity-50 flex flex-nowrap gap-2`}
          >
            Log in <ArrowLongRight />
          </Link>
          {rightAction ? <div>{rightAction}</div> : null}
        </div>
      </nav>

      {open ? (
        <div id="mobile-menu" className="fixed inset-0 z-50 md:hidden">
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
                className="h-12 w-12"
                width={900}
                height={300}
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                // className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                aria-label="Close menu"
              >
                <XMark />
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-2 border-t border-gray-200 pt-6">
              {unauthNavbarRoutes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={() => setOpen(false)}
                  className={`${pathname === route.path ? "text-primary" : "text-gray-900"} rounded-md px-3 py-2 text-base font-semibold hover:bg-gray-50`}
                >
                  {route.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 border-t border-gray-200 pt-6">
              <Link
                href={routes.unauth.login.path}
                onClick={() => setOpen(false)}
                className={`${pathname === routes.unauth.login.path ? "text-primary" : "text-gray-900"} flex items-center gap-2 rounded-md px-3 py-2 text-base font-semibold hover:bg-gray-50`}
              >
                Log in <ArrowLongRight />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
