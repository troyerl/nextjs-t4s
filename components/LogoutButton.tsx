"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        sessionStorage.clear();
        localStorage.removeItem("activeShopper");
        localStorage.removeItem("shopper");
        localStorage.removeItem("cart");
        localStorage.removeItem("shoppingTime");
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      className="rounded-md border border-gray-200 px-3 py-1 text-sm font-medium text-secondary hover:bg-gray-50"
    >
      Log out
    </button>
  );
}
