// 拠点名とソラテナIDを紐付ける

export interface CityDataMap {
  [key: string]: {
    displayName: string;
    deviceId: string;
  };
}

export const cityData: CityDataMap = {
  hamako: {
    displayName: '浜松工業高等学校',
    deviceId: ' ST3OJE00-000392',
  },
  merck: {
    displayName: 'メルクエレクトロニクス',
    deviceId: ' ST3OJE00-000577',
  },
  hamazoo: {
    displayName: '浜松市動物園',
    deviceId: 'ST3OJE00-000705',
  },
  default: {
    displayName: '不明',
    deviceId: 'unknown',
  }
};