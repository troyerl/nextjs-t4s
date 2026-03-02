import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { userFromIdToken } from "@/lib/session";

interface CognitoInitiateAuthResponse {
  AuthenticationResult?: {
    AccessToken?: string;
    RefreshToken?: string;
    IdToken?: string;
  };
}

interface LoginBody {
  username: string;
  password: string;
}

function createSecretHash(username: string, clientId: string, clientSecret: string) {
  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(username + clientId);
  return hmac.digest("base64");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const username = body.username?.trim();
    const password = body.password?.trim();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 },
      );
    }

    const region = process.env.AWS_REGION;
    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.AUTH_SECRET ?? "";
    if (!region || !clientId || !clientSecret) {
      return NextResponse.json(
        {
          error:
            "Missing auth configuration (AWS_REGION, COGNITO_CLIENT_ID, AUTH_SECRET).",
        },
        { status: 500 },
      );
    }

    const secretHash = createSecretHash(username, clientId, clientSecret);
    const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;
    const cognitoResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
      },
      body: JSON.stringify({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
          SECRET_HASH: secretHash,
        },
      }),
      cache: "no-store",
    });

    if (!cognitoResponse.ok) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }

    const payload = (await cognitoResponse.json()) as CognitoInitiateAuthResponse;
    const accessToken = payload.AuthenticationResult?.AccessToken;
    const refreshToken = payload.AuthenticationResult?.RefreshToken;
    const idToken = payload.AuthenticationResult?.IdToken;

    if (!accessToken || !idToken) {
      return NextResponse.json(
        { error: "Missing token response from Cognito." },
        { status: 401 },
      );
    }

    const user = userFromIdToken(idToken);
    if (!user) {
      return NextResponse.json(
        { error: "Unable to read user claims from token." },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });

    if (refreshToken) {
      cookieStore.set("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
        secure: process.env.NODE_ENV === "production",
      });
    }

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
