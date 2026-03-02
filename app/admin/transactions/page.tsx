import Link from "next/link";
import type { Metadata } from "next";
import RefreshButton from "@/components/admin/RefreshButton";
import { apiGet } from "@/lib/api";
import { formatDateTime } from "@/lib/date";
import { routes } from "@/lib/routes";
import { getAccessToken } from "@/lib/session";
import { ITransaction } from "@/lib/types";

export const metadata: Metadata = {
  title: "Admin Transactions | T4S",
  description: "Tools-4-Schools admin transactions page",
};

async function getTransactions() {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  return apiGet<ITransaction[]>("/transaction/list", { token }).catch(() => []);
}

interface AdminTransactionsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminTransactionsPage({
  searchParams,
}: AdminTransactionsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const transactions = (await getTransactions()).slice().sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });
  const filteredTransactions = query
    ? transactions.filter((transaction) => {
        const haystack = [
          transaction.shopperDetails.firstName,
          transaction.shopperDetails.lastName,
          transaction.shopperDetails.school,
          transaction.shopperDetails.grade,
          transaction.shopperDetails.email,
          String(transaction.totalCount),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      })
    : transactions;

  return (
    <div className="screen-width-border screen-height-border animate-slide-in-from-bottom w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-secondary">Transactions</h1>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Link
            href={`${routes.auth.transaction.path}/new`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            New Transaction
          </Link>
        </div>
      </div>

      <form className="mb-4 w-full md:max-w-md">
        <label htmlFor="transaction-search" className="sr-only">
          Search transactions
        </label>
        <div className="flex gap-2">
          <input
            id="transaction-search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search"
            className="w-full rounded-md border border-gray-300 p-3"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            {query ? "No transactions matched your search." : "No transactions found."}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredTransactions.map((transaction) => (
                <Link
                  key={transaction._id}
                  href={`${routes.auth.transaction.path}/${transaction._id}`}
                  className="flex items-center justify-between px-4 py-4"
                >
                  <div>
                    <p className="text-xs">{formatDateTime(transaction.createdAt)}</p>
                    <h3 className="text-lg font-semibold">
                      {transaction.shopperDetails.firstName} {transaction.shopperDetails.lastName}
                    </h3>
                    <p className="mb-0.5 text-sm">{transaction.shopperDetails.school}</p>
                    <p className="text-xs">{transaction.shopperDetails.email}</p>
                  </div>
                  <div aria-hidden className="text-xl">
                    &rarr;
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      School
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Total Items
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-4 py-3 text-sm">
                        {formatDateTime(transaction.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`${routes.auth.transaction.path}/${transaction._id}`}
                          className="text-primary hover:underline"
                        >
                          {transaction.shopperDetails.firstName}{" "}
                          {transaction.shopperDetails.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">{transaction.shopperDetails.school}</td>
                      <td className="px-4 py-3 text-sm">{transaction.shopperDetails.grade}</td>
                      <td className="px-4 py-3 text-sm">{transaction.shopperDetails.email}</td>
                      <td className="px-4 py-3 text-sm">{transaction.totalCount}</td>
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
