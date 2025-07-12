import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wind, 
  CloudRain, 
  Thermometer, 
  Sun, 
  RefreshCw, 
  AlertCircle,
  Clock
} from 'lucide-react';

interface WeatherData {
  averageWindSpeed: number;
  averageWindSpeed10min: number;
  rainIntensity10min: number;
  temperature: number;
  heatIndex: number;
  heatIndex10min: number;
}

interface WeatherCardProps {
  title: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
  colorClass: string;
  bgColor: string;
  borderColor: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon, 
  colorClass, 
  bgColor,
  borderColor
}) => (
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
    <h3 className="text-3xl font-bold text-gray-700 mb-3">{title}</h3>
    <div className="absolute -bottom-2 -right-2 opacity-5">
      <div className="transform scale-150 text-gray-400">
        {icon}
      </div>
    </div>
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

function App() {
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
      console.log("app.tsx", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse = await response.json(); 
      const data = apiResponse.data;
      
      // データの構造に応じて適切にマッピング
      const mappedData: WeatherData = {
        averageWindSpeed: data.v || 0,
        averageWindSpeed10min: data.v10m || 0,
        rainIntensity10min: data.rf10m || 0,
        temperature: data.t || 0,
        heatIndex: data.wbgt || 0,
        heatIndex10min: data.wbgt10m || 0
      };

      setWeatherData(mappedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('データ取得エラー:', error);
      setIsError(true);
      
      // エラー時はデモデータを表示（開発用）
      setWeatherData({
        averageWindSpeed: Math.random() * 10,
        averageWindSpeed10min: Math.random() * 10,
        rainIntensity10min: Math.random() * 5,
        temperature: 20 + Math.random() * 15,
        heatIndex: 20 + Math.random() * 15,
        heatIndex10min: 20 + Math.random() * 15
      });
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 初回データ取得
    fetchWeatherData();

    // 60秒間隔でデータを更新
    const interval = setInterval(fetchWeatherData, 60000);

    return () => clearInterval(interval);
  }, [fetchWeatherData]);

  const weatherCards = [
    {
      title: '平均風速',
      value: weatherData?.averageWindSpeed || null,
      unit: 'm/s',
      icon: <Wind className="h-10 w-10" />,
      colorClass: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: '平均風速（10分）',
      value: weatherData?.averageWindSpeed10min || null,
      unit: 'm/s',
      icon: <Wind className="h-10 w-10" />,
      colorClass: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300'
    },
    {
      title: '雨量強度（10分）',
      value: weatherData?.rainIntensity10min || null,
      unit: 'mm/h',
      icon: <CloudRain className="h-10 w-10" />,
      colorClass: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: '気温',
      value: weatherData?.temperature || null,
      unit: '°C',
      icon: <Thermometer className="h-10 w-10" />,
      colorClass: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: '暑さ指数',
      value: weatherData?.heatIndex || null,
      unit: '°C',
      icon: <Sun className="h-10 w-10" />,
      colorClass: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: '暑さ指数（10分平均）',
      value: weatherData?.heatIndex10min || null,
      unit: '°C',
      icon: <Sun className="h-10 w-10" />,
      colorClass: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300'
    }
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-8xl font-bold text-gray-800 mb-4">
            気象データ
          </h1>
          <p className="text-gray-600 text-3xl">
            10秒間隔で自動更新
          </p>
        </div>

        {/* ステータス表示 */}
        <div className="flex justify-center mb-12">
          <StatusIndicator 
            isLoading={isLoading}
            isError={isError}
            lastUpdated={lastUpdated}
          />
        </div>

        {/* データカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {weatherCards.map((card, index) => (
            <WeatherCard
              key={index}
              title={card.title}
              value={card.value}
              unit={card.unit}
              icon={card.icon}
              colorClass={card.colorClass}
              bgColor={card.bgColor}
              borderColor={card.borderColor}
            />
          ))}
        </div>

        {/* フッター */}
        <div className="text-center mt-20">
          <p className="text-gray-500 text-lg">
            データ提供: Weathernews Inc.
          </p>
          <p className="text-gray-400 text-base mt-2">
            Chromium Version 69対応
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;