import { NextRequest, NextResponse } from "next/server";

interface JwtClaims {
  exp?: number;
  username?: string;
  "cognito:username"?: string;
  "cognito:groups"?: string[];
}

function decodeClaims(token?: string): JwtClaims | null {
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
    const json = atob(paddedPayload);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

function getBase64(value: ArrayBuffer) {
  const bytes = new Uint8Array(value);
  let binary = "";
  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

async function createSecretHash(
  username: string,
  clientId: string,
  clientSecret: string,
) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(clientSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const data = new TextEncoder().encode(username + clientId);
  const signature = await crypto.subtle.sign("HMAC", key, data);
  return getBase64(signature);
}

async function refreshAccessToken(
  refreshToken: string,
  username: string,
): Promise<string | null> {
  const region = process.env.AWS_REGION;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.AUTH_SECRET;

  if (!region || !clientId || !clientSecret) {
    return null;
  }

  try {
    const secretHash = await createSecretHash(username, clientId, clientSecret);
    const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
      },
      body: JSON.stringify({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          SECRET_HASH: secretHash,
          USERNAME: username,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      AuthenticationResult?: { AccessToken?: string };
    };
    return payload.AuthenticationResult?.AccessToken ?? null;
  } catch {
    return null;
  }
}

function setAccessTokenCookie(response: NextResponse, accessToken: string) {
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let accessToken = request.cookies.get("accessToken")?.value;
  let claims = decodeClaims(accessToken);
  let group = claims?.["cognito:groups"]?.[0];
  let accessTokenWasRefreshed = false;
  const refreshThresholdSeconds = 15 * 60;
  const now = Math.floor(Date.now() / 1000);
  const tokenNeedsRefresh = !claims?.exp || claims.exp <= now + refreshThresholdSeconds;

  if (tokenNeedsRefresh && accessToken) {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const username = claims?.username ?? claims?.["cognito:username"];

    if (refreshToken && username) {
      const newAccessToken = await refreshAccessToken(refreshToken, username);
      if (newAccessToken) {
        accessToken = newAccessToken;
        claims = decodeClaims(newAccessToken);
        group = claims?.["cognito:groups"]?.[0];
        accessTokenWasRefreshed = true;
      } else {
        const response =
          pathname === "/login"
            ? NextResponse.next()
            : NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
      }
    } else {
      const response =
        pathname === "/login"
          ? NextResponse.next()
          : NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  const tokenStillValid =
    !!accessToken &&
    !!claims?.exp &&
    claims.exp > Math.floor(Date.now() / 1000);

  if (pathname.startsWith("/admin") && !tokenStillValid) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && group === "Director" && !pathname.includes("transaction")) {
    const transactionsUrl = new URL("/admin/transactions", request.url);
    const response = NextResponse.redirect(transactionsUrl);
    if (accessTokenWasRefreshed && accessToken) {
      setAccessTokenCookie(response, accessToken);
    }
    return response;
  }

  if (pathname === "/login" && tokenStillValid) {
    const adminUrl = new URL("/admin", request.url);
    const response = NextResponse.redirect(adminUrl);
    if (accessTokenWasRefreshed && accessToken) {
      setAccessTokenCookie(response, accessToken);
    }
    return response;
  }

  const response = NextResponse.next();
  if (accessTokenWasRefreshed && accessToken) {
    setAccessTokenCookie(response, accessToken);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
