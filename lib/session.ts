import { cookies } from "next/headers";
import { decodeJwtClaims, isJwtExpired } from "@/lib/jwt";
import { IUser, UserGroupEnum } from "@/lib/types";

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value ?? null;
}

export async function getSessionUserGroup(): Promise<UserGroupEnum | null> {
  const token = await getAccessToken();
  const claims = decodeJwtClaims(token);
  if (isJwtExpired(claims)) {
    return null;
  }
  const group = claims?.["cognito:groups"]?.[0];
  return (group as UserGroupEnum | undefined) ?? null;
}

export async function isLoggedIn(): Promise<boolean> {
  return (await getSessionUserGroup()) !== null;
}

export function userFromIdToken(idToken: string): IUser | null {
  const claims = decodeJwtClaims(idToken);
  if (!claims) {
    return null;
  }

  const group = claims["cognito:groups"]?.[0] as UserGroupEnum | undefined;
  const username = claims["cognito:username"];
  const organizationId = claims["custom:organizationId"];

  if (!group || !username || !organizationId) {
    return null;
  }

  return { group, username, organizationId };
}
