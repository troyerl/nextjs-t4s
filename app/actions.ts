"use server";

import { revalidatePath } from "next/cache";

export async function invalidateServerCache(path: string) {
  // This purges the server-side cache for all users
  revalidatePath(path);
}
