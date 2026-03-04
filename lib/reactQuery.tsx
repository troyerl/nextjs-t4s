import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import { cache } from "react";

export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60 * 1000 }, // Avoid immediate refetching on the client
        dehydrate: {
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) ||
            query.state.status === "pending",
        },
      },
    }),
);

export const Client = new QueryClient();

export const getData = async <T extends object>(
  key: any[],
  queryFn: any,
): Promise<T> => {
  const result = await Client.fetchQuery<T>({
    queryKey: key,
    queryFn,
    staleTime: 60 * 60 * 1000, //1 hour
    gcTime: 60 * 60 * 1000, //1 hour
  });
  return result;
};

export const clearCache = (key: any[]) => {
  Client.invalidateQueries({ queryKey: key });
};

export const queryKeys = {
  inventory: (showAvailableItems: boolean, location?: string) => [
    "inventory",
    showAvailableItems,
    location || "all",
  ],
  schools: (distinct?: string) => ["schools", distinct ?? "All"],
  getShopper: (id: string, checkLastUpdated: boolean) => [
    "shopper",
    id,
    checkLastUpdated ? "checkLastUpdated=true" : "checkLastUpdated=false",
  ],
  getShoppingSettings: () => ["shoppingSettings"],
  getEvents: () => ["events"],
  getEvent: (eventId: string, showSpots?: boolean) => [
    "event",
    eventId,
    showSpots ? "showSpots=true" : "showSpots=false",
  ],
  getTransactions: (token: string) => ["transactions", token],
  getShoppers: () => ["shoppers"],
  getTransaction: (transactionId: string) => ["transaction", transactionId],
};
