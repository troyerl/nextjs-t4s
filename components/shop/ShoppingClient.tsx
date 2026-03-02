"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clientApiGet, clientApiPost, ClientApiError } from "@/lib/client-api";
import { grades } from "@/lib/constants";
import CodeScanner from "@/components/shop/CodeScanner";
import { useSnackbar } from "@/components/snackbar/SnackbarProvider";
import {
  IEventSettings,
  IGetShopperResponse,
  IInventoryDisplay,
  IShopper,
  IShopperInventory,
} from "@/lib/types";

type CartMap = Record<string, IShopperInventory>;

interface ShopperFormState {
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  grade: string;
  classLoad: string;
}

const emptyForm: ShopperFormState = {
  firstName: "",
  lastName: "",
  email: "",
  school: "",
  grade: "",
  classLoad: "",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function ShoppingTimer({ onExpire }: { onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem("shoppingTime");
      if (!stored) {
        setTimeLeft("");
        return;
      }
      const diff = new Date(stored).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("");
        if (!expired) {
          setExpired(true);
          onExpire();
        }
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [expired, onExpire]);

  if (!timeLeft) {
    return null;
  }
  return <p className="text-lg font-semibold">⏳ Time left: {timeLeft}</p>;
}

export default function ShoppingClient() {
  const router = useRouter();
  const [shopper, setShopper] = useState<IShopper | null>(null);
  const [cart, setCart] = useState<CartMap>({});
  const [signInMode, setSignInMode] = useState<"code" | "info">("code");
  const [scanLocation, setScanLocation] = useState(true);
  const [lookupCode, setLookupCode] = useState("");
  const [shopperForm, setShopperForm] = useState<ShopperFormState>(emptyForm);
  const [schools, setSchools] = useState<string[]>([]);
  const [locationCode, setLocationCode] = useState("");
  const [locationItems, setLocationItems] = useState<CartMap>({});
  const [manualEntry, setManualEntry] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const cartItems = useMemo(
    () => Object.values(cart).sort((a, b) => a.name.localeCompare(b.name)),
    [cart],
  );
  const hasOverLimitLocationItems = useMemo(
    () => Object.values(locationItems).some((item) => item.limit > 0 && item.takeAmount > item.limit),
    [locationItems],
  );

  useEffect(() => {
    const savedShopper = localStorage.getItem("activeShopper");
    const savedCart = localStorage.getItem("cart");
    if (savedShopper) {
      try {
        setShopper(JSON.parse(savedShopper) as IShopper);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart) as CartMap;
          setCart(parsedCart);
          setScanLocation(Object.keys(parsedCart).length === 0);
        } else {
          setScanLocation(true);
        }
      } catch {
        localStorage.removeItem("activeShopper");
      }
    }
  }, []);

  useEffect(() => {
    if (shopper) {
      localStorage.setItem("activeShopper", JSON.stringify(shopper));
    } else {
      localStorage.removeItem("activeShopper");
    }
  }, [shopper]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  async function startShoppingSession() {
    const settings = await clientApiGet<IEventSettings>("/shopping/settings");
    localStorage.setItem(
      "shoppingTime",
      new Date(Date.now() + settings.timeIntervalInMinutes * 60 * 1000).toISOString(),
    );
  }

  async function handleCodeLookup() {
    if (lookupCode.length !== 4) {
      enqueueSnackbar("Please enter a 4-digit shopping code.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setLoading(true);
    try {
      const response = await clientApiGet<IGetShopperResponse>(
        `/shopper/${lookupCode}`,
      );
      await startShoppingSession();
      setShopper(response.shopper);
      setScanLocation(true);
      enqueueSnackbar(`Welcome ${response.shopper.firstName}!`, {
        variant: "success",
        duration: 4000,
      });
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart) as CartMap);
      }
    } catch (error) {
      if (error instanceof ClientApiError && error.status === 404) {
        enqueueSnackbar("Unable to find shopper with that code.", {
          variant: "error",
          duration: 5000,
        });
      } else {
        enqueueSnackbar("There was an error retrieving the shopper.", {
          variant: "error",
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadSchools() {
    if (schools.length > 0) {
      return;
    }
    try {
      const data = await clientApiGet<string[]>("/school/list?distinct=name");
      setSchools(data);
    } catch {
      enqueueSnackbar("Unable to load schools.", {
        variant: "error",
        duration: 5000,
      });
    }
  }

  async function handleInfoStart() {
    if (
      !shopperForm.firstName ||
      !shopperForm.lastName ||
      !shopperForm.email ||
      !shopperForm.school ||
      !shopperForm.grade ||
      !shopperForm.classLoad
    ) {
      enqueueSnackbar("Please complete all fields.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }
    if (!isValidEmail(shopperForm.email)) {
      enqueueSnackbar("Please provide a valid email address.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }
    if (Number(shopperForm.classLoad) <= 0) {
      enqueueSnackbar("Class load must be greater than 0.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }
    await startShoppingSession();
    setShopper({
      shopperId: "",
      firstName: shopperForm.firstName,
      lastName: shopperForm.lastName,
      grade: shopperForm.grade,
      classLoad: Number(shopperForm.classLoad),
      school: shopperForm.school,
      email: shopperForm.email,
    });
    setScanLocation(true);
  }

  async function loadLocationItems(location: string) {
    if (!location.trim()) {
      enqueueSnackbar("Please enter a location ID.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }

    setLoading(true);
    try {
      const data = await clientApiGet<IInventoryDisplay[]>(
        `/item/list?showAvailableItems=true&location=${encodeURIComponent(location)}`,
      );
      if (!data.length) {
        enqueueSnackbar("No available items found for this location.", {
          variant: "error",
          duration: 5000,
        });
        return;
      }
      const mapped: CartMap = {};
      data.forEach((item) => {
        mapped[item._id] = cart[item._id] ?? {
          ...item,
          takeAmount: 0,
          matchedLocation: item.matchedLocation || location,
        };
      });
      setLocationItems(mapped);
      setLocationCode(location);
    } catch {
      enqueueSnackbar("There was an error retrieving the location.", {
        variant: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }

  async function getLocationItems() {
    await loadLocationItems(locationCode);
  }

  function saveLocationItems() {
    const updated: CartMap = { ...cart };
    Object.entries(locationItems).forEach(([id, item]) => {
      if (item.takeAmount <= 0) {
        delete updated[id];
      } else {
        updated[id] = item;
      }
    });
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    setLocationItems({});
    setScanLocation(false);
    setManualEntry(false);
  }

  async function checkout() {
    if (!shopper) {
      enqueueSnackbar("Missing shopper.", { variant: "error", duration: 5000 });
      return;
    }
    if (!Object.keys(cart).length) {
      enqueueSnackbar("Your cart is empty.", { variant: "error", duration: 5000 });
      return;
    }
    setLoading(true);
    try {
      await clientApiPost("/shopper/checkout", {
        shopper,
        cart: Object.values(cart),
      });
      localStorage.setItem("shopper", JSON.stringify(shopper));
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.removeItem("activeShopper");
      router.push("/shopping-success");
      router.refresh();
    } catch {
      enqueueSnackbar("There was an error checking out. Please try again later.", {
        variant: "error",
        duration: 5000,
      });
    } finally {
      setShowCheckoutModal(false);
      setLoading(false);
    }
  }

  const endShopping = useCallback(() => {
    setShopper(null);
    setCart({});
    setScanLocation(true);
    setLocationItems({});
    setLookupCode("");
    localStorage.removeItem("cart");
    localStorage.removeItem("activeShopper");
    localStorage.removeItem("shoppingTime");
    setManualEntry(false);
    setShowCheckoutModal(false);
  }, []);

  const onShoppingExpired = useCallback(() => {
    enqueueSnackbar("Your shopping session expired. Please start again.", {
      variant: "info",
      duration: 6000,
    });
    endShopping();
  }, [enqueueSnackbar, endShopping]);

  const openScanner = useCallback(() => {
    setLocationItems({});
    setManualEntry(false);
    setScanLocation(true);
  }, []);

  return (
    <>
      <div className="md:hidden">
        {showCheckoutModal ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold">Checkout</h3>
              <p className="mt-2 text-gray-600">Are you sure you want to checkout?</p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  disabled={loading}
                  className="rounded-md border border-gray-300 px-4 py-2 font-semibold disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={checkout}
                  disabled={loading}
                  className="rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-70"
                >
                  {loading ? "Checking out..." : "Checkout"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Shop</h1>
            {shopper ? (
              <div className="flex items-center gap-3">
                <ShoppingTimer onExpire={onShoppingExpired} />
                <button
                  type="button"
                  onClick={openScanner}
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-semibold"
                >
                  Scan Location
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="screen-width-border py-5">
          {!shopper ? (
            <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Welcome!</h2>
              <p className="mt-1 text-gray-600">
                {signInMode === "code" ? "Input shopping code below." : "Enter your info below."}
              </p>

              {signInMode === "code" ? (
                <div className="mt-6">
                  <input
                    value={lookupCode}
                    onChange={(event) =>
                      setLookupCode(event.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="0000"
                    inputMode="numeric"
                    className="w-full rounded-md border border-gray-300 p-3 text-center text-xl tracking-[0.4em]"
                  />
                  <button
                    type="button"
                    onClick={handleCodeLookup}
                    disabled={loading || lookupCode.length !== 4}
                    className="mt-4 rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={async () => {
                        setSignInMode("info");
                        await loadSchools();
                      }}
                      className="text-primary underline"
                    >
                      Haven&apos;t shopped with us or forgot your code?
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid gap-3">
                  <input
                    value={shopperForm.firstName}
                    onChange={(event) =>
                      setShopperForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    placeholder="First Name"
                    className="rounded-md border border-gray-300 p-3"
                  />
                  <input
                    value={shopperForm.lastName}
                    onChange={(event) =>
                      setShopperForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    placeholder="Last Name"
                    className="rounded-md border border-gray-300 p-3"
                  />
                  <input
                    value={shopperForm.email}
                    onChange={(event) =>
                      setShopperForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="Email"
                    className="rounded-md border border-gray-300 p-3"
                  />
                  <select
                    value={shopperForm.school}
                    onChange={(event) =>
                      setShopperForm((current) => ({
                        ...current,
                        school: event.target.value,
                      }))
                    }
                    className="rounded-md border border-gray-300 p-3"
                  >
                    <option value="">Select School</option>
                    {schools.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                  <select
                    value={shopperForm.grade}
                    onChange={(event) =>
                      setShopperForm((current) => ({
                        ...current,
                        grade: event.target.value,
                      }))
                    }
                    className="rounded-md border border-gray-300 p-3"
                  >
                    <option value="">Select Grade</option>
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  <input
                    value={shopperForm.classLoad}
                    onChange={(event) =>
                      setShopperForm((current) => ({
                        ...current,
                        classLoad: event.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="Class Load"
                    inputMode="numeric"
                    className="rounded-md border border-gray-300 p-3"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSignInMode("code")}
                      className="rounded-md border border-gray-300 px-4 py-2 font-semibold"
                    >
                      Input My Code
                    </button>
                    <button
                      type="button"
                      onClick={handleInfoStart}
                      className="rounded-md bg-primary px-4 py-2 font-semibold text-white"
                    >
                      Start Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : scanLocation ? (
            <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {!Object.keys(locationItems).length ? (
                <>
                  <h2 className="text-xl font-semibold">Scan QR Code</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {manualEntry
                      ? "Unable to load scanner, please input the location ID manually."
                      : "Use your camera to scan the location QR code."}
                  </p>
                  <div className="mt-4">
                    {manualEntry ? (
                      <input
                        value={locationCode}
                        onChange={(event) => setLocationCode(event.target.value)}
                        placeholder="Location ID"
                        className="w-full rounded-md border border-gray-300 p-3"
                      />
                    ) : (
                      <div className="relative">
                        <CodeScanner
                          onScan={(text) => {
                            void loadLocationItems(text);
                          }}
                          onError={(scannerError) => {
                            enqueueSnackbar(scannerError, {
                              variant: "error",
                              duration: 6000,
                            });
                            setManualEntry(true);
                          }}
                        />
                        {loading ? (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-black/50">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <h3 className="mt-3 text-lg text-white">Retrieving location...</h3>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setScanLocation(false)}
                      className="rounded-md border border-gray-300 px-4 py-2 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualEntry((current) => !current)}
                      className="rounded-md border border-gray-300 px-4 py-2 font-semibold"
                    >
                      {manualEntry ? "Use Scanner" : "Can&apos;t Scan Code"}
                    </button>
                    <button
                      type="button"
                      onClick={getLocationItems}
                      disabled={loading || !manualEntry}
                      className="rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-70"
                    >
                      {loading ? "Loading..." : "Get Items"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Select Items</h2>
                    <button
                      type="button"
                      onClick={saveLocationItems}
                      disabled={hasOverLimitLocationItems}
                      className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-70"
                    >
                      Save
                    </button>
                  </div>
                  <div className="space-y-3">
                    {Object.values(locationItems)
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((item) => (
                        <div
                          key={item._id}
                          className="rounded-md border border-gray-200 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                Limit: {item.limit === 0 ? "None" : item.limit}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setLocationItems((current) => ({
                                    ...current,
                                    [item._id]: {
                                      ...current[item._id],
                                      takeAmount: Math.max(0, current[item._id].takeAmount - 1),
                                    },
                                  }))
                                }
                                className="h-8 w-8 rounded border border-gray-300"
                              >
                                -
                              </button>
                              <input
                                value={item.takeAmount}
                                onChange={(event) =>
                                  setLocationItems((current) => ({
                                    ...current,
                                    [item._id]: {
                                      ...current[item._id],
                                      takeAmount: Number(
                                        event.target.value.replace(/\D/g, "") || "0",
                                      ),
                                    },
                                  }))
                                }
                                className="w-14 rounded border border-gray-300 p-1 text-center"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setLocationItems((current) => {
                                    const next = current[item._id].takeAmount + 1;
                                    const allowed = item.limit === 0 || next <= item.limit;
                                    return {
                                      ...current,
                                      [item._id]: {
                                        ...current[item._id],
                                        takeAmount: allowed ? next : current[item._id].takeAmount,
                                      },
                                    };
                                  })
                                }
                                className="h-8 w-8 rounded border border-gray-300"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          {item.limit > 0 && item.takeAmount > item.limit ? (
                            <p className="mt-2 text-sm font-medium text-red-600">
                              More than limit.
                            </p>
                          ) : null}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cart</h2>
                <button
                  type="button"
                  onClick={() => setScanLocation(true)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold"
                >
                  Add Items
                </button>
              </div>
              {!cartItems.length ? (
                <div className="py-10 text-center">
                  <div className="mb-4 text-5xl">🛒</div>
                  <h3 className="text-2xl font-semibold">Your cart is empty</h3>
                  <p className="mt-2 text-gray-600">
                    You can add items to your cart by scanning a QR code.
                  </p>
                  <button
                    type="button"
                    onClick={endShopping}
                    className="mt-6 rounded-md bg-primary px-4 py-2 font-semibold text-white"
                  >
                    Quit Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 pb-20">
                    {cartItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Location: {item.matchedLocation.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-md bg-[#f2e9da] px-3 py-1 font-semibold text-[#7C663D]">
                            {item.takeAmount}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setCart((current) => {
                                const updated = { ...current };
                                delete updated[item._id];
                                localStorage.setItem("cart", JSON.stringify(updated));
                                return updated;
                              })
                            }
                            className="text-sm text-red-600 underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <div className="mx-auto w-full max-w-2xl">
                      <button
                        type="button"
                        onClick={() => setShowCheckoutModal(true)}
                        disabled={loading}
                        className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-70"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      <div className="hidden min-h-screen items-center justify-center px-10 md:flex">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold">Mobile only page</h2>
          <p className="mt-2 text-gray-600">
            This page is only available on mobile devices.
          </p>
        </div>
      </div>
    </>
  );
}
