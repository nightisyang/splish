export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface WaterfallImage {
  uri: string;
}

export interface WaterfallSummary {
  id: string;
  name: string;
  summary: string;
  imgFilenameArr: WaterfallImage[];
}

export interface WaterfallDetails {
  name: string;
  description: string;
  state: string;
  coordinate: [number, number]; // [longitude, latitude]
  waterSource: string;
  waterfallProfile: string;
  accessibility: string;
  lastUpdate: string;
  difficulty: string;
  imgFilenameArr: WaterfallImage[];
}

export interface WaterfallMapCoord {
  id: string;
  title: string;
  coordinates: Coordinates;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type MalaysianState =
  | 'Johor'
  | 'Kedah'
  | 'Kelantan'
  | 'Melaka'
  | 'Negeri Sembilan'
  | 'Pahang'
  | 'Perak'
  | 'Perlis'
  | 'Pulau Pinang'
  | 'Sabah'
  | 'Sarawak'
  | 'Selangor'
  | 'Terengganu'
  | 'Kuala Lumpur'
  | 'Labuan'
  | 'Putrajaya';
