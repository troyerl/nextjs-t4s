"use client";

import inventoryProvider from "@/app/api/inventoryProvider";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function PageContent() {
  // This will NOT trigger a network request on mount because the data is hydrated
  const { data: inventory } = useSuspenseQuery({
    queryKey: ["inventory", true],
    queryFn: () => inventoryProvider.getInventory(true),
  });

  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {inventory?.length === 0 ? (
        <div className="p-8 text-center text-gray-600">
          No inventory data is currently available.
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100 md:hidden">
            {inventory?.map((item) => (
              <div key={item._id} className="p-4">
                <p className="text-xs text-gray-600">Limit: {item.limit}</p>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-700">In Stock: {item.amount}</p>
                <p className="text-sm text-gray-700">
                  Location(s):{" "}
                  {[...(item.locationKeys ?? [])].sort().join(", ")}
                </p>
                {item.description ? (
                  <p className="mt-1 text-sm text-gray-600">
                    {item.description}
                  </p>
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
                {inventory?.map((item) => (
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
  );
}
