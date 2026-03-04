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

export interface IModifyShopper extends IBaseShopper {
  classLoad: string;
}

export interface IGetShopperResponse {
  shopper: IShopper;
  needsUpdated?: boolean;
}
