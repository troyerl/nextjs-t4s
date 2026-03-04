import type { Metadata } from "next";
import HeroSection, {
  BaseHeroSubHeader,
  StackedHeader,
} from "@/components/HeroSection";
import { Suspense } from "react";
import BasePageContainer from "@/components/BasePageContainer";
import inventoryProvider from "@/app/api/inventoryProvider";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Client } from "@/lib/reactQuery";
import PageContent from "./PageContent";

export const metadata: Metadata = {
  title: "Inventory | T4S",
  description: "Tools-4-Schools inventory page",
};

const Page = async () => {
  // Start fetching on the server
  await Client.prefetchQuery({
    queryKey: ["inventory", true],
    queryFn: () => inventoryProvider.getInventory(true),
  });

  return (
    <>
      <HydrationBoundary state={dehydrate(Client)}>
        <PageContent />
      </HydrationBoundary>
    </>
  );
};

const LoadingContent = () => (
  <div className="h-150 w-full animate-pulse rounded-lg bg-gray-100"></div>
);

export default async function InventoryPage() {
  return (
    <main>
      <HeroSection header={<StackedHeader main="What" subtext="do we have?" />}>
        <BaseHeroSubHeader text="Below is a current list of inventory we have in stock." />
      </HeroSection>
      <BasePageContainer>
        <Suspense fallback={<LoadingContent />}>
          <Page />
        </Suspense>
      </BasePageContainer>
    </main>
  );
}
