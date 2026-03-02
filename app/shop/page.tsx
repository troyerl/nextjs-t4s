import type { Metadata } from "next";
import ShoppingClient from "@/components/shop/ShoppingClient";

export const metadata: Metadata = {
  title: "Shop | T4S",
  description: "Tools-4-Schools shopping page",
};

export default function ShopPage() {
  return <ShoppingClient />;
}
