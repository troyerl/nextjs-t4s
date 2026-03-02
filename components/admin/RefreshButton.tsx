"use client";

import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-secondary"
    >
      Refresh
    </button>
  );
}
