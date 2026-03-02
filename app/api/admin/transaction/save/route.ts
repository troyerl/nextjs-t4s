import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/session";
import { apiPost } from "@/lib/api";
import { ICustomTransactionItem, IShopper } from "@/lib/types";

interface SaveTransactionBody {
  cart: ICustomTransactionItem[];
  shopper: IShopper;
}

export async function POST(request: Request) {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as SaveTransactionBody;
    if (!body.shopper?.shopperId) {
      return NextResponse.json(
        { error: "A shopper must be selected." },
        { status: 400 },
      );
    }

    const response = await apiPost<{ transactionId: string }>(
      "/transaction",
      {
        cart: body.cart,
        shopper: body.shopper,
      },
      { token },
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to save transaction." },
      { status: 500 },
    );
  }
}
