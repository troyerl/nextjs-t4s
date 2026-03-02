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

export interface ICustomTransactionItem extends IBaseInventory {
  takeAmount: number;
}

export interface IInventoryDisplay extends IBaseInventory {
  amount: number;
  locationString?: string;
  matchedLocation: string;
}

export interface IShopperInventory
  extends Omit<IBaseInventory, "need" | "retail" | "minimum"> {
  takeAmount: number;
  matchedLocation: string;
}

export interface IEventSettings {
  visitorAmount: number;
  timeIntervalInMinutes: number;
}

export interface ISpot {
  availableSpots: Record<string, number>;
  reservationInfo: IEventSettings;
}

export interface IEvent {
  _id: string;
  name: string;
  description: string;
  end: string;
  start: string;
  spot?: string;
  spotDetails?: ISpot;
}

export interface IBaseShopper {
  shopperId: string;
  firstName: string;
  lastName: string;
  grade: string;
  school: string;
  email: string;
}

export interface IShopper extends IBaseShopper {
  classLoad: number;
}

export interface IGetShopperResponse {
  shopper: IShopper;
  needsUpdated?: boolean;
}

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

export enum UserGroupEnum {
  Chairman = "Chairman",
  CoChairman = "Co-Chairman",
  Director = "Director",
  Owner = "Owner",
}

export interface IUser {
  organizationId: string;
  username: string;
  group: UserGroupEnum;
}
