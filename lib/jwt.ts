export interface JwtClaims {
  exp?: number;
  username?: string;
  "cognito:username"?: string;
  "cognito:groups"?: string[];
  "custom:organizationId"?: string;
}

export function isJwtExpired(claims: JwtClaims | null, offsetSeconds = 0): boolean {
  if (!claims?.exp) {
    return true;
  }
  const now = Math.floor(Date.now() / 1000);
  return claims.exp <= now + offsetSeconds;
}

export function decodeJwtClaims(token?: string | null): JwtClaims | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const json = Buffer.from(paddedPayload, "base64").toString("utf8");
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}
