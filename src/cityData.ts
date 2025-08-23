// cityData.ts

export interface CityDataMap {
  [key: string]: {
    displayName: string;
    temperatureRange: { min: number; max: number; };
    windRange: { min: number; max: number; };
  };
}

export const cityData: CityDataMap = {
  tokyo: {
    displayName: '東京都',
    temperatureRange: { min: 20, max: 30 },
    windRange: { min: 1, max: 5 },
  },
  osaka: {
    displayName: '大阪府',
    temperatureRange: { min: 25, max: 35 },
    windRange: { min: 2, max: 8 },
  },
  nagoya: {
    displayName: '愛知県',
    temperatureRange: { min: 22, max: 32 },
    windRange: { min: 1, max: 6 },
  },
  default: {
    displayName: '不明',
    temperatureRange: { min: 15, max: 25 },
    windRange: { min: 0.5, max: 4 },
  }
};