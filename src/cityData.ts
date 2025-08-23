// cityData.ts

export interface CityDataMap {
  [key: string]: {
    displayName: string;
    deviceId: string;
  };
}

export const cityData: CityDataMap = {
  tokyo: {
    displayName: '東京都',
    deviceId: ' ST3OJE00-000392',
  },
  osaka: {
    displayName: '大阪府',
    deviceId: ' ST3OJE00-000577',
  },
  nagoya: {
    displayName: '愛知県',
    deviceId: 'ST3OJE00-000705',
  },
  default: {
    displayName: '不明',
    deviceId: 'unknown',
  }
};