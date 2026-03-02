"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clientApiGet } from "@/lib/client-api";
import { useSnackbar } from "@/components/snackbar/SnackbarProvider";
import { ICustomTransactionItem, IShopper, ITransaction } from "@/lib/types";

interface AdminTransactionEditorProps {
  transactionId: string;
  initialTransaction: ITransaction | null;
}

function getItemsSignature(items: ICustomTransactionItem[]) {
  return JSON.stringify(
    items
      .map((item) => ({ id: item._id, qty: item.takeAmount }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
}

export default function AdminTransactionEditor({
  transactionId,
  initialTransaction,
}: AdminTransactionEditorProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const initialShopper = initialTransaction?.shopperDetails ?? null;
  const [shoppers, setShoppers] = useState<IShopper[]>([]);
  const [inventory, setInventory] = useState<ICustomTransactionItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [draftItems, setDraftItems] = useState<Record<string, ICustomTransactionItem>>(
    {},
  );

  const [selectedShopperId, setSelectedShopperId] = useState(
    initialTransaction?.shopperDetails?.shopperId ?? "",
  );

  const [selectedItems, setSelectedItems] = useState<ICustomTransactionItem[]>(
    initialTransaction
      ? initialTransaction.items.map((item) => ({
          _id: item.itemId,
          name: item.name,
          limit: 0,
          description: "",
          minimum: 0,
          retail: "",
          need: false,
          locationKeys: [],
          takeAmount: item.quantity,
        }))
      : [],
  );

  const loadLists = useCallback(async () => {
    setLoadingData(true);
    try {
      const [shopperResponse, inventoryResponse] = await Promise.all([
        clientApiGet<IShopper[]>("/shopper/list"),
        clientApiGet<ICustomTransactionItem[]>("/item/list?showAvailableItems=false"),
      ]);
      setShoppers(shopperResponse);
      setInventory(
        inventoryResponse.map((item) => ({
          ...item,
          takeAmount: 0,
        })),
      );
    } catch {
      enqueueSnackbar("Unable to load shoppers or inventory.", {
        variant: "error",
        duration: 5000,
      });
    } finally {
      setLoadingData(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  const selectedShopper = useMemo(
    () =>
      shoppers.find((shopper) => shopper.shopperId === selectedShopperId) ??
      (initialShopper?.shopperId === selectedShopperId ? initialShopper : undefined),
    [initialShopper, selectedShopperId, shoppers],
  );

  const filteredDraftItems = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const items = Object.values(draftItems);
    if (!searchLower) {
      return items;
    }
    return items.filter((item) => item.name.toLowerCase().includes(searchLower));
  }, [draftItems, search]);

  const buildInitialItems = useCallback(() => {
    if (!initialTransaction) {
      return [] as ICustomTransactionItem[];
    }
    return initialTransaction.items.map((item) => ({
      _id: item.itemId,
      name: item.name,
      limit: 0,
      description: "",
      minimum: 0,
      retail: "",
      need: false,
      locationKeys: [],
      takeAmount: item.quantity,
    }));
  }, [initialTransaction]);

  const initialItemsSignature = useMemo(
    () => getItemsSignature(buildInitialItems()),
    [buildInitialItems],
  );

  const currentItemsSignature = useMemo(
    () => getItemsSignature(selectedItems),
    [selectedItems],
  );

  const hasChanges =
    selectedShopperId !== (initialTransaction?.shopperDetails?.shopperId ?? "") ||
    currentItemsSignature !== initialItemsSignature;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasChanges) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasChanges]);

  const openItemsModal = useCallback(() => {
    const map: Record<string, ICustomTransactionItem> = {};

    inventory.forEach((item) => {
      map[item._id] = {
        ...item,
        takeAmount: 0,
      };
    });

    selectedItems.forEach((item) => {
      map[item._id] = {
        ...(map[item._id] ?? item),
        ...item,
      };
    });

    setDraftItems(map);
    setSearch("");
    setShowItemsModal(true);
    setSpeedDialOpen(false);
  }, [inventory, selectedItems]);

  const updateDraftAmount = useCallback((itemId: string, nextAmount: number) => {
    setDraftItems((current) => {
      const item = current[itemId];
      if (!item) {
        return current;
      }
      const clamped = Math.max(0, nextAmount);
      return {
        ...current,
        [itemId]: {
          ...item,
          takeAmount: item.limit > 0 ? Math.min(item.limit, clamped) : clamped,
        },
      };
    });
  }, []);

  const saveDraftItems = useCallback(() => {
    const newSelectedItems = Object.values(draftItems).filter(
      (item) => item.takeAmount > 0,
    );
    setSelectedItems(newSelectedItems);
    setShowItemsModal(false);
  }, [draftItems]);

  const resetAll = useCallback(() => {
    setSelectedItems(buildInitialItems());
    setSelectedShopperId(initialTransaction?.shopperDetails?.shopperId ?? "");
    setSpeedDialOpen(false);
  }, [buildInitialItems, initialTransaction?.shopperDetails?.shopperId]);

  function updateAmount(itemId: string, amount: number) {
    setSelectedItems((current) =>
      current
        .map((item) => (item._id === itemId ? { ...item, takeAmount: amount } : item))
        .filter((item) => item.takeAmount > 0),
    );
  }

  function removeSelectedItem(itemId: string) {
    setSelectedItems((current) => current.filter((item) => item._id !== itemId));
  }

  async function saveTransaction() {
    if (!selectedShopper) {
      enqueueSnackbar("Please select a shopper.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }
    if (!selectedItems.length) {
      enqueueSnackbar("Please add at least one item.", {
        variant: "error",
        duration: 5000,
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/transaction/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopper: selectedShopper,
          cart: selectedItems,
        }),
      });
      const payload = (await response.json()) as {
        transactionId?: string;
        error?: string;
      };
      if (!response.ok || !payload.transactionId) {
        enqueueSnackbar(payload.error ?? "Unable to save transaction.", {
          variant: "error",
          duration: 5000,
        });
        return;
      }
      enqueueSnackbar("Transaction saved.", { variant: "success", duration: 4000 });
      router.push(`/admin/transaction/${payload.transactionId}`);
      router.refresh();
    } catch {
      enqueueSnackbar("Unable to save transaction.", {
        variant: "error",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="screen-width-border screen-height-border w-full">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            if (hasChanges) {
              const shouldLeave = window.confirm(
                "You have unsaved changes. Leave this page?",
              );
              if (!shouldLeave) {
                return;
              }
            }
            router.push("/admin/transactions");
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold"
        >
          Back to Transactions
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-secondary">
          {transactionId.toLowerCase() === "new" ? "New Transaction" : "Edit Transaction"}
        </h1>
        {transactionId.toLowerCase() !== "new" ? (
          <p className="mt-2 text-sm text-gray-600">
            Loaded transaction details. Saving creates an updated transaction record.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadLists}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
            disabled={loadingData}
          >
            {loadingData ? "Loading..." : "Load Shoppers + Inventory"}
          </button>
          <button
            type="button"
            onClick={openItemsModal}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold"
          >
            Modify Items
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold"
            disabled={!hasChanges}
          >
            Reset
          </button>
        </div>

        <div className="mt-6">
          {selectedShopper?.shopperId ? (
            <div>
              <h2 className="mb-3 text-xl font-semibold">Shopper Details</h2>
              <p>
                <span className="font-semibold">Name:</span> {selectedShopper.firstName}{" "}
                {selectedShopper.lastName}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {selectedShopper.email}
              </p>
              <p>
                <span className="font-semibold">School:</span> {selectedShopper.school}
              </p>
              <p>
                <span className="font-semibold">Grade:</span> {selectedShopper.grade}
              </p>
            </div>
          ) : (
            <>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Shopper</label>
              <select
                value={selectedShopperId}
                onChange={(event) => setSelectedShopperId(event.target.value)}
                className="w-full max-w-xl rounded-md border border-gray-300 p-3"
              >
                <option value="">Select a shopper</option>
                {shoppers.map((shopper) => (
                  <option key={shopper.shopperId} value={shopper.shopperId}>
                    {shopper.firstName} {shopper.lastName}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Selected Items</h2>
          {!selectedItems.length ? (
            <div className="mt-3 flex flex-col items-start gap-3">
              <p className="text-gray-600">No items added yet.</p>
              <button
                type="button"
                onClick={openItemsModal}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Add Items
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {selectedItems
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => removeSelectedItem(item._id)}
                        className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                      <p className="font-medium">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateAmount(item._id, item.takeAmount - 1)}
                        className="h-8 w-8 rounded border border-gray-300"
                      >
                        -
                      </button>
                      <input
                        value={item.takeAmount}
                        onChange={(event) =>
                          updateAmount(
                            item._id,
                            Number(event.target.value.replace(/\D/g, "") || "0"),
                          )
                        }
                        className="w-14 rounded border border-gray-300 p-1 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => updateAmount(item._id, item.takeAmount + 1)}
                        className="h-8 w-8 rounded border border-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={saveTransaction}
            disabled={saving || !hasChanges}
            className="rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </div>

      {showItemsModal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 md:items-center md:p-6">
          <div className="max-h-[92vh] w-full overflow-hidden rounded-t-xl bg-white shadow-xl md:max-w-3xl md:rounded-xl">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Select Items</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowItemsModal(false)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveDraftItems}
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search item"
                className="mt-3 w-full rounded-md border border-gray-300 p-3"
              />
            </div>
            <div className="max-h-[70vh] overflow-auto p-4">
              <div className="space-y-2">
                {filteredDraftItems
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Limit: {item.limit === 0 ? "None" : item.limit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateDraftAmount(item._id, item.takeAmount - 1)}
                          className="h-8 w-8 rounded border border-gray-300"
                        >
                          -
                        </button>
                        <input
                          value={item.takeAmount}
                          onChange={(event) =>
                            updateDraftAmount(
                              item._id,
                              Number(event.target.value.replace(/\D/g, "") || "0"),
                            )
                          }
                          className="w-14 rounded border border-gray-300 p-1 text-center"
                        />
                        <button
                          type="button"
                          onClick={() => updateDraftAmount(item._id, item.takeAmount + 1)}
                          className="h-8 w-8 rounded border border-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed right-8 bottom-8 z-40">
        <div className="relative">
          <button
            type="button"
            onClick={() => setSpeedDialOpen((current) => !current)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white shadow-lg"
          >
            {speedDialOpen ? "×" : "+"}
          </button>
          {speedDialOpen ? (
            <div className="absolute right-0 bottom-16 flex min-w-[140px] flex-col gap-2">
              {hasChanges && !!selectedShopper?.shopperId ? (
                <button
                  type="button"
                  onClick={saveTransaction}
                  disabled={saving}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-md"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={openItemsModal}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-md"
              >
                Modify
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-md"
                disabled={!hasChanges}
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
