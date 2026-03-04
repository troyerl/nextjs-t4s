export interface IBaseInventory {
  _id: string;
  name: string;
  limit: number;
  description: string;
  minimum: number;
  retail: string;
  need: boolean;
  locationKeys: string[];
}

export interface IInventoryDisplay extends IBaseInventory {
  amount: number;
  locationString: string | undefined;
  matchedLocation: string;
}

export interface ICustomTransactionItem extends IBaseInventory {
  takeAmount: number;
}

export interface IShopperInventory
  extends Omit<IBaseInventory, "need" | "retail" | "minimum"> {
  takeAmount: number;
  matchedLocation: string;
}
