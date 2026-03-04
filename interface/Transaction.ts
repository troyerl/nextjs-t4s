import { IShopper } from "./Shopper";

export interface ITransactionItem {
  _id: string;
  itemId: string;
  quantity: number;
  name: string;
}
export interface ITransaction {
  _id: string;
  shopper: string;
  event: string | null;
  totalCount: number;
  createdAt: string;
  items: ITransactionItem[];
  shopperDetails: IShopper;
}
