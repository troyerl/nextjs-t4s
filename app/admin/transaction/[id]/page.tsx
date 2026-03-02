import AdminTransactionEditor from "@/components/admin/AdminTransactionEditor";
import { apiGet } from "@/lib/api";
import { getAccessToken } from "@/lib/session";
import type { Metadata } from "next";
import { ITransaction } from "@/lib/types";

interface AdminTransactionByIdPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminTransactionByIdPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: id.toLowerCase() === "new" ? "New Transaction | T4S" : "Transaction | T4S",
    description: "Tools-4-Schools admin transaction page",
  };
}

export default async function AdminTransactionByIdPage({
  params,
}: AdminTransactionByIdPageProps) {
  const { id } = await params;
  const token = await getAccessToken();

  const isNew = id.toLowerCase() === "new";
  const initialTransaction =
    !isNew && token
      ? await apiGet<ITransaction>(`/transaction/${id}`, { token }).catch(() => null)
      : null;

  return <AdminTransactionEditor transactionId={id} initialTransaction={initialTransaction} />;
}
