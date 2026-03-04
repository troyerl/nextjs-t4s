export interface ISpot {
  availableSpots: Record<string, number>;
  reservationInfo: IEventSettings;
}

export interface IEventSettings {
  visitorAmount: number;
  timeIntervalInMinutes: number;
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
