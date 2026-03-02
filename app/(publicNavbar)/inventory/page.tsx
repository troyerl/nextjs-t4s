import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { IInventoryDisplay } from "@/lib/types";

export const metadata: Metadata = {
  title: "Inventory | T4S",
  description: "Tools-4-Schools inventory page",
};

async function getInventory() {
  return apiGet<IInventoryDisplay[]>(
    "/item/list?showAvailableItems=true",
  ).catch(() => []);
}

interface InventoryPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const inventory = await getInventory();
  const filteredInventory = query
    ? inventory.filter((item) => {
        const locations = [...(item.locationKeys ?? [])].join(" ");
        const haystack =
          `${item.name} ${item.description ?? ""} ${locations}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : inventory;

  return (
    <div className="screen-width-border screen-height-border mx-auto w-full max-w-7xl">
      <h1 className="text-center text-4xl font-semibold text-secondary">What</h1>
      <h2 className="text-center text-3xl font-semibold text-primary">do we have?</h2>
      <p className="mt-3 text-center text-gray-600">
        Below is a current list of inventory we have in stock.
      </p>

      <form className="mx-auto mt-6 max-w-xl">
        <label htmlFor="inventory-search" className="sr-only">
          Search inventory
        </label>
        <div className="flex gap-2">
          <input
            id="inventory-search"
            name="q"
            defaultValue={query}
            placeholder="Search by item, description, or location"
            className="w-full rounded-md border border-gray-300 p-3"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 font-semibold text-white"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {filteredInventory.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            {query
              ? "No inventory items matched your search."
              : "No inventory data is currently available."}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredInventory.map((item) => (
                <div key={item._id} className="p-4">
                  <p className="text-xs text-gray-600">Limit: {item.limit}</p>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-700">In Stock: {item.amount}</p>
                  <p className="text-sm text-gray-700">
                    Location(s): {[...(item.locationKeys ?? [])].sort().join(", ")}
                  </p>
                  {item.description ? (
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      In Stock
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Limit
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Location(s)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInventory.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{item.amount}</td>
                      <td className="px-4 py-3 text-sm">{item.limit}</td>
                      <td className="px-4 py-3 text-sm">
                        {[...(item.locationKeys ?? [])].sort().join(", ")}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
