// from Gemini 8/23

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Link } from 'react-router-dom';
import { 
  Wind, CloudRain, Thermometer, Sun, RefreshCw, AlertCircle, Clock, AlertTriangle, Shield, Zap
} from 'lucide-react';
// 外部ファイルからcityDataの読み込み
import { cityData, CityDataMap } from './cityData';

// --- インターフェースの定義 ---
interface WeatherData {
  averageWindSpeed: number;
  averageWindSpeed10min: number;
  rainIntensity10min: number;
  temperature: number;
  heatIndex: number;
  heatIndex10min: number;
}

interface AlertInfo {
  level: string;
  message: string;
  icon: React.ReactNode;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
}

interface WeatherCardProps {
  title: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
  colorClass: string;
  alert?: AlertInfo;
}

// --- 補助関数 ---
const getHeatIndexAlert = (temperature: number): AlertInfo => {
  let level, message, icon, colorClass, bgColorClass, borderColorClass;

  if (temperature < 21) {
    level = 'ほぼ安全';
    message = 'ほぼ安全';
    icon = <Shield className="h-8 w-8" />;
    colorClass = 'text-green-700';
    bgColorClass = 'bg-green-100';
    borderColorClass = 'border-green-300';
  } else if (temperature < 25) {
    level = '注意';
    message = '注意';
    icon = <AlertCircle className="h-8 w-8" />;
    colorClass = 'text-yellow-700';
    bgColorClass = 'bg-yellow-100';
    borderColorClass = 'border-yellow-300';
  } else if (temperature < 28) {
    level = '警戒';
    message = '警戒';
    icon = <AlertTriangle className="h-8 w-8" />;
    colorClass = 'text-orange-700';
    bgColorClass = 'bg-orange-100';
    borderColorClass = 'border-orange-300';
  } else if (temperature < 31) {
    level = '厳重警戒';
    message = '厳重警戒';
    icon = <AlertTriangle className="h-8 w-8" />;
    colorClass = 'text-red-700';
    bgColorClass = 'bg-red-100';
    borderColorClass = 'border-red-300';
  } else {
    level = '危険';
    message = '危険';
    icon = <Zap className="h-8 w-8" />;
    colorClass = 'text-red-900';
    bgColorClass = 'bg-red-200';
    borderColorClass = 'border-red-500';
  }

  return { level, message, icon, colorClass, bgColorClass, borderColorClass };
};

// --- コンポーネント ---
const WeatherCard: React.FC<WeatherCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon, 
  colorClass, 
  alert
}) => {
  const [bgColor, borderColor] = colorClass.split('-').slice(1).map(c => {
    if (c === '700' || c === '600') return `bg-${c.replace('700', '100').replace('600', '50')}`;
    return `border-${c.replace('700', '300').replace('600', '200')}`;
  });

  return (
    <div className={`relative overflow-hidden rounded-xl ${bgColor} ${borderColor} border-2 p-10 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-8">
        <div className={`p-6 rounded-full ${colorClass} bg-white shadow-md`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-8xl font-bold text-gray-800">
            {value !== null ? value.toFixed(1) : '--'}
          </div>
          <div className="text-3xl text-gray-600 font-medium mt-3">{unit}</div>
        </div>
      </div>
      <h3 className="text-5xl font-bold text-gray-700 mb-3 leading-tight">
        {title.includes('（10分') ? (
          <>
            {title.split('（')[0]}
            <br />
            <span className="text-4xl">（{title.split('（')[1]}</span>
          </>
        ) : (
          title
        )}
      </h3>
      
      {alert && (
        <div className={`mt-6 p-6 rounded-lg ${alert.bgColorClass} ${alert.borderColorClass} border-2`}>
          <div className="flex items-center space-x-4">
            <div className={alert.colorClass}>
              {alert.icon}
            </div>
            <span className={`text-4xl font-bold ${alert.colorClass}`}>
              {alert.message}
            </span>
          </div>
        </div>
      )}
      
      <div className="absolute -bottom-2 -right-2 opacity-5">
        <div className="transform scale-150 text-gray-400">
          {icon}
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const StatusIndicator: React.FC<{ 
  isLoading: boolean; 
  isError: boolean; 
  lastUpdated: Date | null 
}> = ({ isLoading, isError, lastUpdated }) => (
  <div className="flex items-center space-x-6 bg-white rounded-lg px-8 py-4 shadow-md border border-gray-200">
    <div className="flex items-center space-x-3">
      {isLoading ? (
        <RefreshCw className="h-7 w-7 text-blue-500 animate-spin" />
      ) : isError ? (
        <AlertCircle className="h-7 w-7 text-red-500" />
      ) : (
        <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
      )}
      <span className="text-lg font-medium text-gray-700">
        {isLoading ? '更新中...' : isError ? 'エラー' : 'オンライン'}
      </span>
    </div>
    {lastUpdated && (
      <div className="flex items-center space-x-2 text-lg text-gray-500">
        <Clock className="h-6 w-6" />
        <span>
          最終更新: {lastUpdated.toLocaleTimeString('ja-JP')}
        </span>
      </div>
    )}
  </div>
);

// ランダムな数値を生成するヘルパー関数
const getRandomNumber = (min: number, max: number, decimals: number = 1): number => {
  const factor = Math.pow(10, decimals);
  return Math.round((Math.random() * (max - min) + min) * factor) / factor;
};

// 都市ごとのダミーデータを定義
const cityData: { [key: string]: string } = {
  tokyo: '東京都',
  osaka: '大阪府',
  nagoya: '愛知県'
};



const WeatherPage = () => {
  const { city } = useParams<{ city: string }>();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeatherData = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);

// 1. ベースURLを定義
     const url = '/.netlify/functions/weather-proxy';

     const response = await fetch(url, {
       method: 'GET',
       headers: {
         'X-API-Key': 'AXCI2Liuyu94PGpEl46cEa7Ck2SU0Xbv3mDc8SNi',
         'Content-Type': 'application/json',
       }
     });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`API Error: ${response.status}`);
      }

      const responseData = await response.json();
      
      // レスポンス構造を確認してデータを取得
      const data = responseData.data || responseData;
      
      console.log('Received data:', data); // デバッグ用

      // データの構造に応じて適切にマッピング
      const mappedData: WeatherData = {
        averageWindSpeed: typeof data.v === 'number' ? data.v : 0,
        averageWindSpeed10min: typeof data.v10m === 'number' ? data.v10m : 0,
        rainIntensity10min: typeof data.rf10m === 'number' ? data.rf10m : 0,
        temperature: typeof data.t === 'number' ? data.t : 0,
        heatIndex: typeof data.wbgt === 'number' ? data.wbgt : 0,
        heatIndex10min: typeof data.wbgt10m === 'number' ? data.wbgt10m : 0
      };

      setWeatherData(mappedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('データ生成エラー:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 60000);
    return () => clearInterval(interval);
  }, [fetchWeatherData]);

  const weatherCards = [
    {
      title: '平均風速',
      value: weatherData?.averageWindSpeed || null,
      unit: 'm/s',
      icon: <Wind className="h-10 w-10" />,
      colorClass: 'text-green-600'
    },
    {
      title: '平均風速（10分）',
      value: weatherData?.averageWindSpeed10min || null,
      unit: 'm/s',
      icon: <Wind className="h-10 w-10" />,
      colorClass: 'text-green-700'
    },
    {
      title: '雨量強度（10分）',
      value: weatherData?.rainIntensity10min || null,
      unit: 'mm/h',
      icon: <CloudRain className="h-10 w-10" />,
      colorClass: 'text-blue-600'
    },
    {
      title: '気温',
      value: weatherData?.temperature || null,
      unit: '°C',
      icon: <Thermometer className="h-10 w-10" />,
      colorClass: 'text-orange-600'
    },
    {
      title: '暑さ指数',
      value: weatherData?.heatIndex || null,
      unit: '°C',
      icon: <Sun className="h-10 w-10" />,
      colorClass: 'text-red-600',
      alert: weatherData?.heatIndex ? getHeatIndexAlert(weatherData.heatIndex) : undefined
    },
    {
      title: '暑さ指数（10分平均）',
      value: weatherData?.heatIndex10min || null,
      unit: '°C',
      icon: <Sun className="h-10 w-10" />,
      colorClass: 'text-red-700',
      alert: weatherData?.heatIndex10min ? getHeatIndexAlert(weatherData.heatIndex10min) : undefined
    }
  ];

  const cityDisplayName = cityData[city || 'default']?.displayName || 'unknown';

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-8xl font-bold text-gray-800 mb-4">
            気象データ ({cityDisplayName})
          </h1>
          <p className="text-gray-600 text-3xl">
            60秒間隔で自動更新
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <StatusIndicator 
            isLoading={isLoading}
            isError={isError}
            lastUpdated={lastUpdated}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {weatherCards.map((card, index) => (
            <WeatherCard
              key={index}
              title={card.title}
              value={card.value}
              unit={card.unit}
              icon={card.icon}
              colorClass={card.colorClass}
              alert={card.alert}
            />
          ))}
        </div>

        <div className="text-center mt-20">
          <p className="text-gray-500 text-lg">
            データ提供: Weathernews Inc.
          </p>
          <p className="text-gray-400 text-base mt-2">
            Chromium Version 69対応
          </p>
          <div className="mt-8 flex justify-center space-x-6">
            {Object.keys(cityData).map(key => (
              <Link key={key} to={`/${key}`} className="text-blue-500 hover:text-blue-700 text-xl font-semibold">
                {cityData[key]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/:city" element={<WeatherPage />} />
      <Route path="/" element={<WeatherPage />} />
    </Routes>
  </Router>
);

export default App;