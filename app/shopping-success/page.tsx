"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { clientApiPost } from "@/lib/client-api";
import { UnAuthNavbar } from "@/components/navbar/UnAuthNavbar";
import RatingStars from "@/components/RatingStars";
import { routes } from "@/lib/routes";
import { useSnackbar } from "@/components/snackbar/SnackbarProvider";
import { IShopper, IShopperInventory } from "@/lib/types";

interface PostShoppingState {
  shopper?: IShopper;
  cart?: IShopperInventory[];
}

function getInitialShoppingSuccessState(): {
  loading: boolean;
  items: IShopperInventory[];
  shopper: IShopper | null;
} {
  if (typeof window === "undefined") {
    return { loading: true, items: [], shopper: null };
  }

  localStorage.removeItem("shoppingTime");
  const cart = JSON.parse(localStorage.getItem("cart") || "{}") as Record<
    string,
    IShopperInventory
  >;
  const shopperString = localStorage.getItem("shopper");
  const shopperInfo = shopperString ? (JSON.parse(shopperString) as IShopper) : null;
  const cartList = Object.values(cart);

  if (cartList.length > 0 && shopperInfo) {
    sessionStorage.setItem(
      "postShopping",
      JSON.stringify({ shopper: shopperInfo, cart: cartList }),
    );
    localStorage.removeItem("cart");
    localStorage.removeItem("shopper");
    return {
      loading: false,
      items: cartList,
      shopper: shopperInfo,
    };
  }

  const postShopping = JSON.parse(
    sessionStorage.getItem("postShopping") || "{}",
  ) as PostShoppingState;
  return {
    loading: false,
    items: postShopping.cart ?? [],
    shopper: postShopping.shopper ?? null,
  };
}

export default function ShoppingSuccessPage() {
  const initialState = getInitialShoppingSuccessState();
  const [loading] = useState(initialState.loading);
  const [items] = useState<IShopperInventory[]>(initialState.items);
  const [shopper] = useState<IShopper | null>(initialState.shopper);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.takeAmount, 0),
    [items],
  );

  async function submitFeedback() {
    try {
      await clientApiPost("/email/feedback", {
        feedback: {
          rating,
          response: feedback,
        },
        user:
          anonymous || !shopper
            ? undefined
            : {
                name: `${shopper.firstName} ${shopper.lastName}`,
                email: shopper.email,
                school: shopper.school,
              },
      });
      enqueueSnackbar("Thank you for your feedback!", {
        variant: "success",
        duration: 10000,
      });
      setShowFeedback(false);
      setFeedback("");
      setRating(0);
      setAnonymous(true);
    } catch {
      enqueueSnackbar("Unable to submit feedback right now.", {
        variant: "error",
        duration: 5000,
      });
    }
  }

  if (loading) {
    return (
      <div>
        <UnAuthNavbar />
        <div className="screen-width-border screen-height-border">
          <div className="h-[420px] animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div>
        <UnAuthNavbar />
        <div className="screen-width-border screen-height-border flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold">You haven&apos;t shopped with us yet!</h1>
          <Link
            href={routes.unauth.shop.path}
            className="rounded-md bg-primary px-4 py-2 font-semibold text-white"
          >
            Begin shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <UnAuthNavbar
        rightAction={
          <button
            type="button"
            onClick={() => setShowFeedback(true)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold"
          >
            ⭐ Rate our app!
          </button>
        }
      />
      <div className="screen-width-border screen-height-border mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Thanks for shopping with us!</h1>
        </div>

        <p className="mb-6 text-lg text-gray-700">
          <span className="font-semibold">Next step:</span> Show your cart at checkout.
        </p>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Receipt</h2>
            <p>Total Items: {totalItems}</p>
          </div>
          <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-2">
            <h3 className="font-semibold">Item</h3>
            <h3 className="font-semibold">Qty</h3>
          </div>
          <div className="space-y-1">
            {items.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span>{item.name}</span>
                <span>{item.takeAmount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showFeedback ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 md:items-center md:p-6">
          <div className="w-full rounded-t-xl bg-white p-6 shadow-xl md:max-w-xl md:rounded-xl">
            <h3 className="text-2xl font-semibold">How was your experience?</h3>
            <p className="mt-1 text-sm text-gray-600">Use the stars to rate the app.</p>
            <div className="mt-4 space-y-4">
              <RatingStars value={rating} onChange={setRating} />
              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Describe your experience"
                rows={4}
                className="w-full rounded-md border border-gray-300 p-3"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(event) => setAnonymous(event.target.checked)}
                />
                Make feedback anonymous
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeedback(false)}
                  className="rounded-md border border-gray-300 px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitFeedback}
                  className="rounded-md bg-primary px-3 py-1.5 font-semibold text-white"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
