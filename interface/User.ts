export type UserGroup = "Chairman" | "Co-Chairman" | "Director" | "Owner";

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
